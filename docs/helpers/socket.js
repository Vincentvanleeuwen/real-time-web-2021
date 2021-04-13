const sharedSessions = require('express-socket.io-session')
const { combineUser } = require('./user')

const initSocketIO = (server, newSession) => {
  const io = require('socket.io')(server)

  io.use(sharedSessions(newSession))

  io.on('connection', (socket) => {

    if(!socket.handshake.session.user || !socket.handshake.session.socketRoom) return

    let users = combineUser(socket.id, socket.handshake.session.user)
    socket.handshake.session.users = users
    socket.handshake.session.save()

    socket.join(socket.handshake.session.socketRoom)
    console.log('socketid' ,socket.id)
    io.to(socket.handshake.session.socketRoom).emit('add users', users, socket.id)

    socket.on('disconnect', () => {
      let newUsers = socket.handshake.session.users.filter(user => user.socketId !== socket.id)

      io.to(socket.handshake.session.socketRoom).emit('remove user', newUsers, socket.id)


    })
  })
}
module.exports = {
  initSocketIO,
}
