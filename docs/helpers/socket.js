const sharedSessions = require('express-socket.io-session')
const { combineUser, getUsers, deleteUser } = require('./user')
const { makeUrlSafe} = require('../utils/makeUrlSafe')
const initSocketIO = (server, newSession) => {
  const io = require('socket.io')(server)

  io.use(sharedSessions(newSession))

  io.on('connection', (socket) => {

    if(!socket.handshake.session.user || !socket.handshake.session.playlist ||
      !socket.handshake.session.searchKey) return

    // Create a user and add it to firebase
    let user = combineUser(
      socket.handshake.session.playlist,
      socket.handshake.session.searchKey,
      socket.id,
      socket.handshake.session.user
    )

    socket.on('room joined', () => {
      console.log('room joined')
      socket.join(makeUrlSafe(socket.handshake.session.socketRoom))

      io
      .to(socket.handshake.session.socketRoom)
      .emit('update users',
        getUsers(socket.handshake.session.playlist, socket.handshake.session.searchKey),
        socket.handshake.session.socketRoom
      )
    })


    socket.on('disconnect', () => {
      console.log('disconnected', socket.handshake.session.socketRoom, user)
      deleteUser(socket.handshake.session.playlist, socket.handshake.session.searchKey, user.id)

      io
        .to(socket.handshake.session.socketRoom)
        .emit('update users',
          getUsers(socket.handshake.session.playlist, socket.handshake.session.searchKey),
          socket.handshake.session.socketRoom
        )
      socket.handshake.session.socketRoom = null
      socket.handshake.session.save();
    })
  })
}
module.exports = {
  initSocketIO,
}
