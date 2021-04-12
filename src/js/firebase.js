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
  const beforeHashtag = /([\w\d]+)#/.exec(playlist.innerHTML)[1]

  const playlistRef = firebase.database().ref(`playlists/${beforeHashtag}`)

  playlistRef
  .orderByChild("searchKey")
  .on('value', (snap) => {
    console.log(snap.val())
    if(snap.val().searchKey === afterHashtag) {
      deleteBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {

          let prevSibling = e.currentTarget
          let songEl = prevSibling.previousSibling.previousSibling.childNodes
          let songArtist = songEl[1].innerHTML
          let songName = songEl[3].innerHTML

          const songsRef = playlistRef.child(`/songs/${songContainer.classList[1]}`)
          // songsRef.orderByChild('songName').equalTo(songName).set(null)

          e.currentTarget.parentElement.innerHTML = ''
          // console.log(songArtist, ' - ', songName)

          // songsRef.on('value', snap => {
          //   console.log('deleteSnap', snap.val())
          //   snap.forEach(snapshot => {
          //     if(snapshot.val().songArtist === songArtist && snapshot.val().songName === songName) {
          //       snapshot.val().remove()
          //     }
          //   })
          // })
        })
      })
    }
  })


  //





}
