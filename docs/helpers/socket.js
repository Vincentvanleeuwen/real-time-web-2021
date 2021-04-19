const sharedSessions = require('express-socket.io-session')
const { combineUser, getUsers, deleteUser } = require('./user')
const { makeUrlSafe} = require('../utils/makeUrlSafe')
const initSocketIO = (server, newSession) => {
  const io = require('socket.io')(server)

  io.use(sharedSessions(newSession))

  io.on('connection', (socket) => {

    if(!socket.handshake.session.user || !socket.handshake.session.socketRoom || !socket.handshake.session.playlist ||
      !socket.handshake.session.searchKey) return

    let user = combineUser(
      socket.handshake.session.playlist,
      socket.handshake.session.searchKey,
      socket.id,
      socket.handshake.session.user
    )

    socket.join(makeUrlSafe(socket.handshake.session.socketRoom))

    io
      .in(socket.handshake.session.socketRoom)
      .emit('update users',
        getUsers(socket.handshake.session.playlist, socket.handshake.session.searchKey),
        socket.handshake.session.socketRoom
      )

    socket.on('disconnect', () => {
      console.log('disconnected', socket.handshake.session.socketRoom, user)
      deleteUser(socket.handshake.session.playlist, socket.handshake.session.searchKey, user.id)

      io.in(socket.handshake.session.socketRoom).emit('update users',
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
