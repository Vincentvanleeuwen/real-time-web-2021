const sharedSessions = require('express-socket.io-session')
const { combineUser, getUsers, deleteUser } = require('./user')
const { makeUrlSafe} = require('../utils/makeUrlSafe')

const initSocketIO = (server, newSession) => {
  const io = require('socket.io')(server)

  // Use Sessions in socket io
  io.use(sharedSessions(newSession))

  io.on('connection', async (socket) => {

    if(!socket.handshake.session.user || !socket.handshake.session.playlist ||
      !socket.handshake.session.searchKey) return

    // Create a user and add it to firebase
    let user = await combineUser(
      socket.handshake.session.playlist,
      socket.handshake.session.searchKey,
      socket.id,
      socket.handshake.session.user
    )

    // Join the correct socketRoom
    socket.join(makeUrlSafe(socket.handshake.session.socketRoom))

    // Update the users visually
    io
    .to(makeUrlSafe(socket.handshake.session.socketRoom))
    .emit('update users',
      await getUsers(socket.handshake.session.playlist, socket.handshake.session.searchKey)
    )

    // When add songs button is fired
    socket.on('add songs', () => {

      // Update songs to animate
      io
      .to(makeUrlSafe(socket.handshake.session.socketRoom))
      .emit('animate songs')

    })

    socket.on('disconnect', async () => {

      // Delete user from firebase
      await deleteUser(socket.handshake.session.playlist, socket.handshake.session.searchKey, user.id)

      // Update the users visually
      io
        .to(makeUrlSafe(socket.handshake.session.socketRoom))
        .emit('update users',
          await getUsers(
            socket.handshake.session.playlist,
            socket.handshake.session.searchKey
          )
        )
      // Reset the socketRoom
      socket.handshake.session.socketRoom = null
      socket.handshake.session.save();
    })
  })
}
module.exports = {
  initSocketIO,
}
