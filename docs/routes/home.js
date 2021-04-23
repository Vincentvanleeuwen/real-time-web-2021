const { firebase } = require('../helpers/firebase')
const router = require('express').Router()
const request = require('request')
const { deleteColumns, restructureData } = require('../helpers/transformData')
const { makeUrlSafe } = require('../utils/makeUrlSafe')

router.get('/', (req, res) => {

  if(!req.session.access_token) {
    res.redirect('/')
    return
  }

  const options = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + req.session.access_token },
    json: true
  }

  // Get the profile data from spotify
  request.get(options, function(error, response, body) {
    // Clean the profile data from spotify
    let filtered = deleteColumns(body);
    let restructured = restructureData(filtered)

    // Set the user
    req.session.user = {
      id: restructured[0].id,
      name: restructured[0].name,
      image: restructured[0].img
    }
    req.session.save()

    res.render('home', {
      layout: 'main',
      name: req.session.user.name,
      img: req.session.user.image
    })
  })
})

router.post('/', (req, res) => {
  // Check if theres a hashtag
  if(!req.body.searchPlaylist.includes('#')) {
    return res.render('home', {
      layout: 'main',
      name: req.session.user.name,
      img: req.session.user.image,
      error: 'This code was incorrect, please try again!'
    })
  }

  // get the combinify playlist and searchKey
  const afterHashtag = /#([\w\d]+)/.exec(req.body.searchPlaylist)[1]
  const beforeHashtag = /([\w\d\s]+)#/.exec(req.body.searchPlaylist)[1]

  const playlistRef = firebase.database().ref('playlists/').child(`${beforeHashtag}`)
  playlistRef.get().then(snap => {
    if(snap.val()) {

      // Set the socket room for socket.io
      req.session.socketRoom = `${beforeHashtag}#${afterHashtag}`
      req.session.playlistId = snap.val().id
      req.session.save()
      console.log(`/playlists/${makeUrlSafe(beforeHashtag)}/${afterHashtag}`)
      // Redirect to the playlist
      res.redirect(`/playlists/${makeUrlSafe(beforeHashtag)}/${afterHashtag}`)
    } else {
      res.render('home', {
        layout: 'main',
        name: req.session.user.name,
        img: req.session.user.image,
        error: 'This code was incorrect, please try again!'
      })
    }
  }).then(() => console.log('Redirected to Playlist')).catch(err => console.warn('Failed to redirect', err))
})

module.exports = router
