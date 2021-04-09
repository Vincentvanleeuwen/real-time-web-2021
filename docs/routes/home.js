const firebase = require('firebase/app')
require('firebase/database')
const router = require('express').Router()
const request = require('request')
const { deleteColumns, restructureData } = require('../helpers/transformData')

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

    console.log('restructured', restructured)
    req.session.user = {
      id: restructured[0].id,
      name: restructured[0].name,
      image: restructured[0].img
    }
    req.session.save();

    res.render('home', {
      layout: 'main',
      name: req.session.user.name,
      img: req.session.user.image
    })
  })
})

router.post('/', (req, res) => {

  console.log(req.body.searchPlaylist)

  const afterHashtag = /#([\w\d]+)/.exec(req.body.searchPlaylist)[1]
  const beforeHashtag = /([\w\d]+)#/.exec(req.body.searchPlaylist)[1]
  console.log(beforeHashtag, afterHashtag)

  const playlistRef = firebase.database().ref('playlists/').child(`${beforeHashtag}`)
  playlistRef.on('value', (snap) => {
    console.log(snap.val())
    if(snap.val()) {
      res.redirect(`/playlists/${beforeHashtag}/${afterHashtag}`)
    } else {
      res.redirect(`/home`)
    }
  })
})

module.exports = router
