let users = []
const combineUser = (socketId, user) => {
  users.push({ ...user, socketId })
  return users;
}

module.exports = { combineUser }
