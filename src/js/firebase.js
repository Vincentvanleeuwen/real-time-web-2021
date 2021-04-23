const firebaseConfig = {
  apiKey: "AIzaSyDnBaT31_LbWAjiRd7isQ1pPdiDVD1HmtQ",
  authDomain: "combinify-b1222.firebaseapp.com",
  databaseURL: "combinify-b1222-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "combinify-b1222",
  storageBucket: "combinify-b1222.appspot.com",
  messagingSenderId: "274350746286",
  appId: "1:274350746286:web:ee843bfbd1f420cb235b3f",
  measurementId: "G-1PDBZFE48J"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const deleteBtn = document.querySelectorAll('.delete')
const playlist = document.querySelector('.playlist-name')
const songContainer = document.querySelector('.songs')
const songListEl = document.querySelector('.song-lists')

const personEl = document.querySelectorAll('.person')

if(playlist && personEl) {
  const afterHashtag = /#([\w\d]+)/.exec(playlist.innerHTML)[1]
  const beforeHashtag = /([\w\d\s]+)#/.exec(playlist.innerHTML)[1]
  const currentUser = songContainer.classList[1]
  const playlistRef = firebase.database().ref(`playlists/${beforeHashtag}`)


  personEl.forEach(person => {


    setSelected(person, currentUser)

    person.addEventListener('click', (e) => {

      // Get Id of clicked user
      const personId = person.classList[[person.classList.length - 1]]
      const songsRef = playlistRef.child(`/songs/`)

      // Check if person is already selected. Return if true
      if(person.classList.contains('selected')) return

      // Empty the songs
      songListEl.innerHTML = ''
      const containerOfSongs = document.createElement('section')
      containerOfSongs.classList.add(`songs`)
      containerOfSongs.classList.add(`${personId}`)

      // Get songs from selected person
      playlistRef
      .get().then(snap => {
        if(snap.val().searchKey === afterHashtag) {
          songsRef.get().then(snap => {

            Object.keys(snap.val()).forEach(key => {
              if (key === personId) {
                console.log()
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
              }
              // Add songs to songlist
              songListEl.appendChild(containerOfSongs)

              // Change selected person
              changeSelected(person, personId)
            })
          }).catch(err => console.warn('SongErr', err))
        }

      }).catch(err => console.warn('playlistRefErr', err))




    })
  })

  // Delete a song
  playlistRef
  .get().then(snap => {
    if(snap.val().searchKey === afterHashtag) {
      deleteBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {

          let prevSibling = e.currentTarget
          let songEl = prevSibling.previousSibling.previousSibling.childNodes
          let songArtist = songEl[1].innerHTML
          let songName = songEl[3].innerHTML
          const songsRef = playlistRef.child(`/songs/${songContainer.classList[1]}`)

          e.currentTarget.parentElement.innerHTML = ''

          songsRef.get().then(snap => {

            snap.forEach(snapshot => {
              if(snapshot.val().songArtist === songArtist && snapshot.val().songName === songName) {
                songsRef
                  .orderByChild('uri')
                  .equalTo(snapshot.val().uri)
                  .once("value")
                  .then(snapshot => {
                    snapshot.forEach(child => {
                      child
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

function changeSelected(person) {
  let classes = []

  person.classList.forEach(cssClass => {

    // Remove Selected before placing.
    let selected = document.querySelector('.selected')
    selected.classList.remove('selected')

    classes.push(cssClass)

    classes.unshift('selected')
    classes.forEach(separateClass => {
      person.classList.add(separateClass)
    })

  })
}

function setSelected(person, songsId) {
  let classes = []
  console.log(person, songsId)
  person.classList.forEach(cssClass => {

    classes.push(cssClass)

    if (cssClass === songsId) {
      person.removeAttribute('class')
      person.classList.add('selected')

      classes.forEach(separateClass => {
        person.classList.add(separateClass)
      })
    }

  })
}
