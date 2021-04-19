const sharedSessions = require('express-socket.io-session')
const { combineUser, getUsers } = require('./user')

const initSocketIO = (server, newSession) => {
  const io = require('socket.io')(server)

  io.use(sharedSessions(newSession))

  io.on('connection', (socket) => {

    if(!socket.handshake.session.user || !socket.handshake.session.socketRoom) return

    let user = combineUser(socket.handshake.session.playlist, socket.handshake.session.searchKey, socket.id, socket.handshake.session.user)

    let users = getUsers(socket.handshake.session.playlist, socket.handshake.session.searchKey);
    socket.handshake.session.users = users
    socket.handshake.session.save()

    socket.join(socket.handshake.session.socketRoom)
    console.log('users and user', users, user)
    console.log('sockethost', socket.handshake.session.host, socket.id)
    io.to(socket.handshake.session.socketRoom).emit('update users', users, socket.id, socket.handshake.session.host)

    socket.on('disconnect', () => {
      let newUsers = socket.handshake.session.users.filter(user => user.socketId !== socket.id)

      io.to(socket.handshake.session.socketRoom).emit('update user', newUsers, socket.id, socket.handshake.session.host)


    })
  })
}
module.exports = {
  initSocketIO,
}
