// const socket = io('localhost:3000')
const socket = io('combinify.herokuapp.com')
const peopleEl = document.querySelector('.people')
const createPlaylistBtn = document.querySelector('#playlist-form input[type="submit"]')
const joinPlaylistBtn = document.querySelector('.home-options input[type="submit"]')

socket.on('connect', () => {
  console.log('connected')
})

socket.on('update users', (playlist, socketRoom) => {
  console.log('socket room =', socketRoom)
  updateUsers(playlist)
})
if (createPlaylistBtn) {
  createPlaylistBtn.addEventListener('click', () => {
    socket.emit('room joined')
  })
}
if (joinPlaylistBtn) {
  joinPlaylistBtn.addEventListener('click', () => {
    socket.emit('room joined')
    console.log('room joined client side')
  })
}


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

