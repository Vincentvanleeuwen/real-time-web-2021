const firebase = require('firebase/app')
require('firebase/database')
const router = require('express').Router()
const request = require('request')
const querystring = require('querystring');
const { randomString } = require('../utils/generateRandomString')
router.get('/', (req, res) => {
  if(!req.session.user) {
    res.redirect('/')
    return
  }

  res.render('create', {
    layout: 'main',
    name: req.session.user.name,
    img: req.session.user.image
  })
})

router.post('/', (req, res) => {

  if(!req.session.user.id) {
    res.redirect('/error')
  }

  const playlistRef = firebase.database().ref('playlists/').child(`${req.body.playlist}`)

  const options = {
    method: 'POST',
    url: `https://api.spotify.com/v1/users/${req.session.user.id}/playlists`,
    headers: {
      'Authorization': 'Bearer ' + req.session.access_token,
      'Content-Type': 'application/json'
    },
    form: JSON.stringify({
      "name": req.body.playlist,
      "description": "Made with Combinify",
      "public": false,
      "collaborative": true
    }),
    json: true
  }
  let searchKey = randomString(6);

  playlistRef.orderByChild("searchKey").equalTo(searchKey).on("value",snap => {
    if (snap.exists()){
      searchKey = randomString(6);
    }
  });
  // use the access token to access the Spotify Web API
  request.post(options, function(error, response, body) {
    playlistRef.set({
      duration: req.body.duration,
      term: req.body.term,
      url: body.external_urls.spotify,
      searchKey: searchKey
    }).then(() => console.log('succesfully set')).catch(err => console.log(err));
    if(!body.error) {

      req.session.playlistUrl = body.external_urls.spotify
      req.session.playlistId = body.id
      req.session.playlistName = req.body.playlist
      req.session.save()
      res.redirect(`/playlists/${req.body.playlist}/${searchKey}`)
    }
  })
})

module.exports = router;
