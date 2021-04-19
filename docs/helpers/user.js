const firebase = require('firebase/app')
require('firebase/database')

const playlistRef = firebase.database().ref('playlists/')

const combineUser = (playlist, searchKey, socketId, user) => {
  playlistRef.child(`${playlist}`)
    .orderBy('searchKey')
    .startAt(searchKey)
    .endAt(searchKey)
    .child('active-users')
    .update({ ...user, socketId })
    .then(() => console.log('updated'))
    .catch(err => console.warn('error updating', err))

  return { ...user, socketId }
}

const getUsers = (playlist, searchKey) => {

  playlistRef.child(`${playlist}`).orderBy('searchKey').startAt(searchKey).endAt(searchKey).child('active-users').once('value', (snap) => {
    console.log('correctPlaylist?', snap.val())
    return snap.val()
  }).then(() => 'Received users').catch(err => console.warn('Error receiving Users', err))

}

module.exports = { combineUser, getUsers }
