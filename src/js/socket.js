const socket = io()

window.addEventListener('load', () => {
  if (window.location.pathname.startsWith('/playlists')) {

    const peopleEl = document.querySelector('.people')
    const playlist = document.querySelector('.playlist-name')
    const songContainer = document.querySelector('.songs')
    const songListEl = document.querySelector('.song-lists')
    const copyButton = document.getElementById('copy-button')

    const afterHashtag = /#([\w\d]+)/.exec(playlist.innerHTML)[1]
    const beforeHashtag = /([\w\d\s]+)#/.exec(playlist.innerHTML)[1]
    const currentUser = songContainer.classList[1]
    const spotifyUrl = playlist.getAttribute("data-spotify-link")

    const playlistRef = firebase.database().ref(`playlists/${beforeHashtag}`)
    const songsRef = playlistRef.child(`/songs/`)

    // Fire on serverside event "update users"
    socket.on('update users', playlist => {
      // Update the user list
      updateUsers(playlist)

      // Set click event listener per person
      setListeners()

    })

    // Fire on serverside event "animate songs"
    socket.on('animate songs', async () => {
      console.log('Animation fired')
      animateSongs()
      if(!copyButton) {
        addSpotifyBtn()
      }
    })

    // Set the songs on first load
    if(songContainer.length !== 0) {

      if (!songContainer.childNodes[1].classList) return

      let isAnimating = songContainer.childNodes[1].classList.contains('animateSong')

      if (isAnimating) {
        // Send to server
        socket.emit('add songs')
      }

      // Empty container to prevent duplicates
      songContainer.innerHTML = ''

      // Set the songs
      setNewSongs(currentUser, songContainer, isAnimating)
        .then(()=> console.log('set songs'))
        .catch(err => console.log(err))
    }

    /**
     * Updates the user list
     * @playlist  {object} The Firebase Playlist Object
     */
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

    /**
     * Set event listener per person.
     */
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

    /**
     * Animate the songs for everyone in the socket room
     */
    function animateSongs() {

      const songs = document.querySelectorAll('.songs section')
      songs.forEach((song, i) => {
        // setTimeout(()=> {
          song.classList.add('animateSong')
          // song.style.marginTop = `-${i * 2}em`
        // }, i * 200)
      })
    }


    /**
     * Add spotify button after animation.
     */
    function addSpotifyBtn() {
      console.log('In Btn!')
      const songListElement = document.querySelector('.song-lists')
      const btn = document.createElement('button')
      const btnNode = document.createTextNode('Spotify Link')
      const label = document.createElement('label')
      const textArea = document.createElement('textarea')
      const textNode = document.createTextNode(spotifyUrl)

      console.log('spotifyurl=', spotifyUrl)
      textArea.id = 'copy-text'

      textArea.appendChild(textNode)

      label.for = 'copy-text'
      label.appendChild(textArea)

      btn.id = 'copy-button'
      btn.classList.add('btn')
      btn.appendChild(btnNode)


      songListElement.appendChild(label)
      songListElement.appendChild(btn)
    }


    /**
     * Sets all songs
     * @personId  {string} Spotify ID
     * @containerOfSongs  {node} The container of current songs
     * @isAnimating  {boolean} **Optional** Adds animateSong class to section
     * @return {Promise}
    */
    async function setNewSongs(personId, containerOfSongs, isAnimating) {

      return await playlistRef
      .get().then(snap => {
        if(snap.val().searchKey === afterHashtag) {
          return songsRef.get().then(snap => {

            Object.keys(snap.val()).forEach(async key => {
              if (key === personId) {
                snap.val()[`${key}`].forEach(song => {

                  // Create song elements
                  const artistContainer = document.createElement('section')
                  if(isAnimating) {
                    artistContainer.classList.add('animateSong')
                  }
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

    /**
     * Set the event listeners of the delete song buttons
     * @return {Promise}
     */
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

    // Change selection field
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

