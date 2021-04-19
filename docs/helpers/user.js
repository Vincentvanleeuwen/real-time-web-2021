const { firebase } = require('./firebase')

const playlistRef = firebase.database().ref('playlists/')

let allUsers

const combineUser = (playlist, searchKey, socketId, user) => {

  let duplicate = false;

  playlistRef
    .child(`${playlist}`)
    .orderByChild('searchKey')
    .get().then(snap => {
      if(snap.val().searchKey === searchKey) {

        // Check if user already exists
        if(snap.val().activeUsers) {
          Object.values(snap.val().activeUsers).forEach(activeUser => {
            console.log('activeUsers', activeUser.id, user.id)
            if (activeUser.id === user.id) {
              duplicate = true
            }
          })
        }

        if(!duplicate) {
          // Create new active user
          playlistRef.child(`${playlist}`)
            .child('activeUsers')
            .push({ ...user, socketId })
            .then(() => console.log('updated'))
            .catch(err => console.warn('error updating', err))
        }
      }
    })
    .catch((err) => console.log(err))


  return { ...user, socketId }
}

const getUsers = (playlist, searchKey) => {

  playlistRef
    .child(`${playlist}`)
    .orderByChild('searchKey')
    .once('value', (snap) => {

      if(snap.val().searchKey === searchKey) {
        allUsers = snap.val()
      }

    })
    .then((snap) => console.log('Got all users'))
    .catch((err) => console.warn('error getting users', err))

  return allUsers
}

const deleteUser = (playlist, searchKey, id) => {

  // Get playlist
  playlistRef.child(`${playlist}`)
    .orderByChild('searchKey')
    .get().then(snap => {
      if(snap.val().searchKey === searchKey) {

        // Get active users
        playlistRef.child(`${playlist}`)
        .child('activeUsers').get().then('value', (snapshot) => {

          Object.values(snapshot.val()).forEach((person, i) => {
            if(person.id === id) {

              // If its the host, dont delete
              if(snap.val().host === id) { return }

              // Delete user
              playlistRef
                .child(`${playlist}`)
                .child('activeUsers')
                .child(Object.keys(snapshot.val())[i])
                .remove()
                .then(() => console.log('removed user'))
                .catch(err => console.log('error removing item', err))

              // Delete user addition
              console.log(id)
              playlistRef
                .child(`${playlist}`)
                .child('songs')
                .child(id)
                .remove()
                .then(() => console.log('removed songs'))
                .catch(err => console.log('error removing item', err))
            }
          })
        }).catch(err => console.warn(err))
      }
    })
    .catch((err) => console.log(err))
}


module.exports = { combineUser, getUsers, deleteUser }
