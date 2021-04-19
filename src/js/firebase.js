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

if(playlist) {
  const afterHashtag = /#([\w\d]+)/.exec(playlist.innerHTML)[1]
  const beforeHashtag = /([\w\d\s]+)#/.exec(playlist.innerHTML)[1]

  const playlistRef = firebase.database().ref(`playlists/${beforeHashtag}`)

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
