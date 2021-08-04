const { firebase } = require('../helpers/firebase')
const router = require('express').Router()
const request = require('request')
const { deleteColumns, restructureSongs } = require('../helpers/transformData')
const { makeUrlSafe, makeUrlUnsafe } = require('../utils/makeUrlSafe')
const { shuffleArray } = require('../utils/shuffleArray')
const globalRef = firebase.database().ref('playlists/')

router.get('/:playlistName/:searchKey', getPlaylist, (req, res) => {

  if(!req.session.user) {
    res.redirect('/')
    return
  }

  let animationState = req.session.animateState
  req.session.animateState = false

  const playlist = req.playlist

  req.session.host = playlist.host
  req.session.searchKey = playlist.searchKey
  req.session.playlist = playlist.name
  req.session.save()

  const options = {
    url: `https://api.spotify.com/v1/me/top/tracks/?time_range=${playlist.term + '_term'}&limit=${playlist.duration}`,
    headers: {
      'Authorization': 'Bearer ' + req.session.access_token,
      'Content-Type': 'application/json'
    },
    json: true
  };

  // Get a users top song list
  request.get(options, (error, response, body) => {

    // Filter the data
    let filtered = deleteColumns(body)
    const songsRef = firebase.database().ref(`playlists/${playlist.name}/songs/${req.session.user.id}`)

    // Add the songs to firebase
    songsRef.get().then((snapshot) => {
      if (!snapshot.val()) {
        return songsRef
        .set(restructureSongs(filtered))
      }
    })
    .catch(err => console.warn('songError', err))
    .then(() => {
      res.render('playlist', {
        layout: 'main',
        userId: req.session.user.id,
        name: req.session.user.name,
        image: req.session.user.image,
        playlistTitle: playlist.name,
        playlistTitleUrlSafe: makeUrlSafe(playlist.name),
        playlistUrl: playlist.url,
        searchKey: playlist.searchKey,
        users: playlist.activeUsers ? Object.values(playlist.activeUsers) : [],
        isHost: playlist.host === req.session.user.id,
        host: playlist.host,
        songs: restructureSongs(filtered),
        animateState: animationState
      });
    })
  });
})

router.post('/:playlistName/:searchKey', getPlaylist, (req, res) => {

  const playlist = req.playlist

  if(!req.session.access_token){
    res.redirect('/')
    return
  }

  const songRef = globalRef.child(`${playlist.name}/songs`)
  songRef.get().then(snap => {

    let songs = Object.values(snap.val()).flat()
    shuffleArray(songs)

    const uris = songs.map(song => song.uri).join(',')

    // Empty playlist before pushing new songs in
    const deleteUris = songs.map(song => ({
      uri: song.uri
    }))

    const deleteOptions = {
      method: 'DELETE',
      url: `https://api.spotify.com/v1/playlists/${req.session.playlistId}/tracks`,
      headers: {
        'Authorization': 'Bearer ' + req.session.access_token,
        'Content-Type': 'application/json'
      },
      body: {
        tracks: deleteUris
      },
      json: true
    }

    request.delete(deleteOptions, (error, response, body) => {
      if(body.error) {
        return console.error('Couldnt delete songs', body.error)
      }

      const options = {
        method: 'POST',
        url: `https://api.spotify.com/v1/playlists/${req.session.playlistId}/tracks?uris=${uris}`,
        headers: {
          'Authorization': 'Bearer ' + req.session.access_token,
          'Content-Type': 'application/json'
        },
        json: true
      }

      // Push songs into the playlist
      request.post(options, (error, response, body) => {
        if(!body.error) {
          req.session.animateState = true
          req.session.save()
          return res.redirect(`/playlists/${makeUrlSafe(playlist.name)}/${playlist.searchKey}`)
        } else {
          console.log('error posting songs')
        }
      })
    })
  }).catch(err => console.log('error posting songs', err))

})

// Middleware for getting the playlist name
function getPlaylist(req, res, next) {

  const { playlistName, searchKey } = req.params
  const unsafePlaylistName = makeUrlUnsafe(playlistName)

  globalRef.child(unsafePlaylistName).orderByChild('searchKey').get().then(snap => {
    if (!snap.val()) return res.status(404).redirect('/home')
    if(snap.val().searchKey !== searchKey) return res.status(404).redirect('/')

    req.playlist = snap.val()
    req.playlist.name = unsafePlaylistName
    next()
  }).catch(err => {
    console.error(err)
    return res.status(500).redirect('/home')
  })
}

module.exports = router
