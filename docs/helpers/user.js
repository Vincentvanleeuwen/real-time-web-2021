const { firebase } = require('./firebase')

const playlistRef = firebase.database().ref('playlists/')

/**
 * Combines a Spotify user with a socket ID
 * @playlist  {string} Playlist name
 * @searchKey  {string} Playlist Key
 * @socketId  {string} Socket ID
 * @user {object} Object with Spotify ID, image and name
 * @return {Promise}
 */
const combineUser = async (playlist, searchKey, socketId, user) => {

  return await playlistRef
    .child(`${playlist}`)
    .orderByChild('searchKey')
    .get().then(snap => {

      let duplicate = false;
      if (snap.val().searchKey === searchKey) {

        // Check if user already exists
        if (snap.val().activeUsers) {
          Object.values(snap.val().activeUsers).forEach(activeUser => {
            if (activeUser.id === user.id) {
              duplicate = true
            }
          })
        }

        if (!duplicate) {
          // Create new active user
          playlistRef.child(`${playlist}`)
          .child('activeUsers')
          .push({...user, socketId})
          .then(() => console.log('updated'))
          .catch(err => console.warn('error updating', err))
        }
        return {...user, socketId}
      }
  })
  .catch((err) => console.log('error getting playlist', err))
}

/**
 * Combines a Spotify user with a socket ID
 * @playlist  {string} Playlist name
 * @searchKey  {string} Playlist Key
 * @return {Promise}
 */
const getUsers = async (playlist, searchKey) => {
  return await playlistRef
  .child(`${playlist}`)
  .orderByChild('searchKey')
  .get().then(snap => {
    if (snap.val().searchKey === searchKey) {
      return snap.val()
    }

  })
  .catch((err) => console.warn('error getting users', err))
}

/**
 * Combines a Spotify user with a socket ID
 * @playlist  {string} Playlist name
 * @searchKey  {string} Playlist Key
 * @id  {string} User ID to delete
 * @return {Promise}
 */
const deleteUser = (playlist, searchKey, id) => {

  // Get playlist
  return playlistRef.child(`${playlist}`)
    .orderByChild('searchKey')
    .get().then(snap => {
      if(snap.val().searchKey === searchKey) {

        // Get active users
        return playlistRef.child(playlist)
        .child('activeUsers').get().then(snapshot => {

          const people =
            Object.entries(snapshot.val()).filter(([key, person]) => {
              return person.id === id && snap.val().host !== id
            })

          if(!people.length) return

          // Delete user
          return playlistRef
            .child(`${playlist}`)
            .child('activeUsers')
            .child(people[0][0])
            .remove()
            .then(() => {
              // Delete user song addition
              return playlistRef
                .child(`${playlist}`)
                .child('songs')
                .child(id)
                .remove()
            })

        }).catch(err => console.warn('error getting Active Users', err))
      }
    })
    .catch((err) => console.log('error getting playlist', err))
}


module.exports = { combineUser, getUsers, deleteUser }
