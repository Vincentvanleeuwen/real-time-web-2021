const socket = io()




window.addEventListener('load', () => {
  if (window.location.pathname.startsWith('/playlists')) {

    const peopleEl = document.querySelector('.people')
    const songsEl = document.querySelectorAll('.songs section')
    const saveBtn = document.getElementById('save-button')
    const playlist = document.querySelector('.playlist-name')
    const songContainer = document.querySelector('.songs')
    const songListEl = document.querySelector('.song-lists')
    const afterHashtag = /#([\w\d]+)/.exec(playlist.innerHTML)[1]
    const beforeHashtag = /([\w\d\s]+)#/.exec(playlist.innerHTML)[1]
    const playlistRef = firebase.database().ref(`playlists/${beforeHashtag}`)
    const songsRef = playlistRef.child(`/songs/`)
    const currentUser = songContainer.classList[1]

    socket.on('connect', () => {
      setListeners()
      console.log('connected')

    })

    socket.on('update users', playlist => {
      // Updating user.
      updateUsers(playlist)
      setListeners()
      // setSelected(currentUser)
    })

    if(saveBtn) {
      saveBtn.addEventListener('click', () => {
        console.log('clicked!')
        socket.emit('add songs')
      })
    }



    // Not fired because page reloaded before execution?
    socket.on('animate songs', async test => {
      console.log('Animation fired', test)
      return await animateSongs()

    })

    if(songContainer.length !== 0) {
      console.log(songContainer)
      setNewSongs(currentUser, songContainer).then(()=> console.log('nice')).catch(err => console.log(err))
    }



    function updateUsers (playlist) {

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

    function setListeners()  {

      const personElements = document.querySelectorAll('.person')
      personElements.forEach(async person => {

        const personId = person.classList[[person.classList.length - 1]]
        person.addEventListener('click', async () => {

          // Check if person is already selected. Return if true
          if(person.classList.contains('selected')) return

          // Empty the songs
          songListEl.innerHTML = ''
          const containerOfSongs = document.createElement('section')
          containerOfSongs.classList.add(`songs`)
          containerOfSongs.classList.add(`${personId}`)

          await setNewSongs(personId, containerOfSongs)
        })
      })
    }


    async function animateSongs () {
      console.log('In animation!')
      songsEl.forEach(song => {
        console.log(song)
      })
    }



    async function setNewSongs(personId, containerOfSongs) {

      return await playlistRef
      .get().then(snap => {
        if(snap.val().searchKey === afterHashtag) {
          return songsRef.get().then(snap => {

            Object.keys(snap.val()).forEach(async key => {
              if (key === personId) {
                snap.val()[`${key}`].forEach(song => {

                  // Create song elements
                  const artistContainer = document.createElement('section')
                  const songEl = document.createElement('div')
                  const artistEl =  document.createElement('p')
                  const nameEl = document.createElement('p')

                  artistEl.classList.add('songArtist')
                  nameEl.classList.add('songName')
                  artistEl.innerHTML = `${song.songArtist}`
                  nameEl.innerHTML = `${song.songName}`
                  songEl.appendChild(nameEl)
                  songEl.appendChild(artistEl)
                  artistContainer.appendChild(songEl)

                  if(personId === currentUser) {
                    const deleteBtn = `
                   <svg xmlns="http://www.w3.org/2000/svg" height="50" viewBox="0 0 24 24" width="50" class="delete">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  `
                    artistContainer.innerHTML += deleteBtn
                  }
                  containerOfSongs.appendChild(artistContainer)
                })

                // Add songs to songlist
                songListEl.appendChild(containerOfSongs)

                // Change selected person
                setSelected(personId)
                await setDeleteButtons()

              }

            })
          }).catch(err => console.warn('SongErr', err))
        }

      }).catch(err => console.warn('playlistRefErr', err))
    }

    async function setDeleteButtons() {

      const deleteBtn = document.querySelectorAll('.delete')

      return await playlistRef
      .get().then(snap => {

        if(snap.val().searchKey === afterHashtag) {
          deleteBtn.forEach(btn => {
            btn.addEventListener('click', (e) => {

              let prevSibling = e.currentTarget
              let songEl = prevSibling.previousSibling.previousSibling.childNodes
              let songArtist = songEl[1].innerHTML
              let songName = songEl[0].innerHTML
              const songsRef = playlistRef.child(`/songs/${songContainer.classList[1]}`)

              e.currentTarget.parentElement.innerHTML = ''

              return songsRef.get().then(snap => {
                snap.forEach(snapshot => {
                  if(snapshot.val().songArtist === songArtist && snapshot.val().songName === songName) {
                    songsRef
                    .orderByChild('uri')
                    .equalTo(snapshot.val().uri)
                    .once("value")
                    .then(snapshot => {
                      snapshot.forEach(child => {
                        return child
                        .ref
                        .remove()
                        .then(() => 'Removed song')
                        .catch(err => console.warn('songErr', err))
                      })
                    })
                    .catch(err => console.warn('songRefErr', err))
                  }
                })
              }).catch(err => console.warn('playlistRefErr', err))
            })
          })
        }
      }).catch(err => console.warn(err))
    }

    function setSelected(personId) {

      const allPeople = document.querySelectorAll('.person')
      let classes = []

      // Remove Selected before placing.
      const selected = document.querySelector('.selected')

      if(selected) {
        selected.classList.remove('selected')
      }

      allPeople.forEach(person => {
        if(!person.classList.contains(personId)) return

        person.classList.forEach(cssClass => {
          classes.push(cssClass)
        })
        person.removeAttribute('class')
        person.classList.add('selected')
        classes.forEach(separateClass => {
          person.classList.add(separateClass)
        })
      })
    }
  }
})

