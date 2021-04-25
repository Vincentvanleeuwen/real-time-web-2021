const socket = io()

const peopleEl = document.querySelector('.people')
const songsEl = document.querySelectorAll('.songs section')
const saveBtn = document.getElementById('save-button')

window.addEventListener('load', () => {
  if (window.location.pathname.startsWith('/playlists')) {
    socket.on('connect', () => {

      console.log('connected')

    })

    socket.on('update users', playlist => {
      updateUsers(playlist)
    })

    if(saveBtn) {
      saveBtn.addEventListener('click', () => {
        console.log('clicked!')
        socket.emit('add songs')
      })
    }



    // Not fired because page reloaded before execution?
    socket.on('animate songs', test => {
      console.log('Animation fired', test)
      animateSongs()

    })


  }
})

const updateUsers = (playlist) => {

  peopleEl.innerHTML = ''

  Object.values(playlist.activeUsers).forEach(user => {
    const personEl = document.createElement('section')
    personEl.classList.add('person')

    if(user.id === playlist.host) {
      personEl.classList.add('host')
      const hostTag = document.createElement('div')
      hostTag.classList.add('host-tag')
      personEl.appendChild(hostTag)
    }
    personEl.classList.add(user.id)

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

const animateSongs = () => {
  console.log('In animation!')
  songsEl.forEach(song => {
    console.log(song)
  })
}
