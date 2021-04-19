const firebase = require('firebase/app')
require('firebase/database')
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

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {

    let filtered = deleteColumns(body);
    let restructured = restructureData(filtered)

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

  const afterHashtag = /#([\w\d]+)/.exec(req.body.searchPlaylist)[1]
  const beforeHashtag = /([\w\d]+)#/.exec(req.body.searchPlaylist)[1]
  console.log('hello', beforeHashtag, afterHashtag)
  const playlistRef = firebase.database().ref('playlists/').child(`${beforeHashtag}`)

  playlistRef.once('value', (snap) => {
    if(snap.val()) {
      req.session.socketRoom = `${req.body.playlist}#${afterHashtag}`
      req.session.playlistId = snap.val().id
      req.session.save()
      console.log(`/playlists/${makeUrlSafe(beforeHashtag)}/${afterHashtag}`)
      res.redirect(`/playlists/${makeUrlSafe(beforeHashtag)}/${afterHashtag}`)
    } else {
      res.redirect(`/home`)
    }
  }).then(() => console.log('Redirected to Playlist')).catch(err => console.warn('Failed to redirect', err))
})

module.exports = router
