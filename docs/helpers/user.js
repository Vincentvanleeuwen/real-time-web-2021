let users = []
const combineUser = (socketId, user) => {
  let findUser = users.findIndex(oldUser => oldUser.id === user.id)
  if(findUser !== -1) {
    users.forEach((oldUser, i) => {
      if (oldUser.id === user.id) {
        return users[i].socketId = socketId
      }
    })
  } else {
    users.push({ ...user, socketId })
  }
  // users.push({ ...user, socketId })
  return users;
}

module.exports = { combineUser }
