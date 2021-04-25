const sharedSessions = require('express-socket.io-session')
const { combineUser, getUsers, deleteUser } = require('./user')
const { makeUrlSafe} = require('../utils/makeUrlSafe')

const initSocketIO = (server, newSession) => {
  const io = require('socket.io')(server)

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

    console.log('session= ', socket.handshake.session)
    socket.join(makeUrlSafe(socket.handshake.session.socketRoom))

    io
    .to(makeUrlSafe(socket.handshake.session.socketRoom))
    .emit('update users',
      await getUsers(socket.handshake.session.playlist, socket.handshake.session.searchKey)
    )

    socket.on('add songs', () => {
      console.log('server - add songs')
      console.log('to socketroom: ', makeUrlSafe(socket.handshake.session.socketRoom))
      io
      .to(makeUrlSafe(socket.handshake.session.socketRoom))
      .emit('animate songs', 'test')

    })

    socket.on('disconnect', async () => {
      console.log('disconnected', socket.handshake.session.socketRoom, user)
      await deleteUser(socket.handshake.session.playlist, socket.handshake.session.searchKey, user.id)

      io
        .to(makeUrlSafe(socket.handshake.session.socketRoom))
        .emit('update users',
          await getUsers(
            socket.handshake.session.playlist,
            socket.handshake.session.searchKey
          )
        )
      socket.handshake.session.socketRoom = null
      socket.handshake.session.save();
    })
  })
}
module.exports = {
  initSocketIO,
}
