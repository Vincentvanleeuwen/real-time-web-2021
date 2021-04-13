const socket = io('localhost:3000')
const peopleEl = document.querySelector('.people')
socket.on('connect', () => {
  console.log('connected')
})
socket.on('add users', (users, currentUser) => {
  console.log('userInAddUser', users)
  updateUsers(users, currentUser)
})
socket.on('remove user', (users, currentUser) => {
  console.log('userInremoveUsers', users)
  removeUser(users, currentUser)
})

const removeUser = (users, currentUser) => {
  updateUsers(users, currentUser)
}
const updateUsers = (users, currentUser) => {
  peopleEl.innerHTML = ''
  console.log(users, currentUser)
  const sortedUsers = users.sort((user, index) => {
    return user.socketId === currentUser ? -1 : index === currentUser ? 1 : 0;
  })
  console.log(sortedUsers)
  sortedUsers.forEach(user => {
    const personEl = document.createElement('section')
    personEl.classList.add('person')

    const imgEl = document.createElement('img')
    imgEl.src = user.image

    const nameEl = document.createElement('h2')
    const nameText = document.createTextNode(user.name)
    nameEl.classList.add('name')
    nameEl.appendChild(nameText)

    personEl.appendChild(imgEl)
    personEl.appendChild(nameEl)

    peopleEl.appendChild(personEl)
  })

}

