const socket = io('localhost:3000')
const peopleEl = document.querySelector('.people')
socket.on('connect', () => {
  console.log('connected')
})
socket.on('add users', (users) => {
  console.log('userInAddUser', users)
  addUsers(users)
})
socket.on('remove user', (users) => {
  console.log('userInremoveUsers', users)
  removeUser(users)
})

const removeUser = (users) => {
  addUsers(users)
}
const addUsers = (users) => {
  peopleEl.innerHTML = ''
  users.forEach(user => {
    let personEl = document.createElement('section')
    personEl.classList.add('person')

    let imgEl = document.createElement('img')
    imgEl.src = user.image

    let nameEl = document.createElement('h2')
    let nameText = document.createTextNode(user.name)
    nameEl.classList.add('name')
    nameEl.appendChild(nameText)

    personEl.appendChild(imgEl)
    personEl.appendChild(nameEl)

    peopleEl.appendChild(personEl)
  })

}

