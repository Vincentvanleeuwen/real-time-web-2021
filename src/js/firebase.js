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

if(playlist) {
  const afterHashtag = /#([\w\d]+)/.exec(playlist.innerHTML)[1]
  const beforeHashtag = /([\w\d\s]+)#/.exec(playlist.innerHTML)[1]
  const songsId = songContainer.classList[1]
  const playlistRef = firebase.database().ref(`playlists/${beforeHashtag}`)


  personEl.forEach(person => {

    setSelected(person, songsId)

    person.addEventListener('click', (e) => {
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
                  containerOfSongs.appendChild(artistContainer)
                })
              }
            })
          })
        }

      }).catch(err => console.warn('playlistRefErr', err))

      // Add songs to songlist
      songListEl.appendChild(containerOfSongs)

      // Change selected person
      changeSelected(person, personId)
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
                  .then(() => 'Removed song')
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
