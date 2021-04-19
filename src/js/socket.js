const socket = io('localhost:3000')
const peopleEl = document.querySelector('.people')

socket.on('connect', () => {
  console.log('connected')
})

socket.on('update users', (playlist, socketRoom) => {
  console.log('socket room =', socketRoom)
  updateUsers(playlist)
})

const updateUsers = (playlist) => {
  peopleEl.innerHTML = ''
  console.log(Object.values(playlist.activeUsers))
  Object.values(playlist.activeUsers).forEach(user => {
    const personEl = document.createElement('section')
    personEl.classList.add('person')

    if(user.id === playlist.host) {
      personEl.classList.add('host')

      const hostTag = document.createElement('div')
      hostTag.classList.add('host-tag')
      personEl.appendChild(hostTag)
    }

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
