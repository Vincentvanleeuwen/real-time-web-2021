const { firebase } = require('../helpers/firebase')
const router = require('express').Router()
const request = require('request')
const { randomString } = require('../utils/generateRandomString')
const { makeUrlSafe } = require('../utils/makeUrlSafe')

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
    res.redirect('/')
    return
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

  // Create a searchKey
  let searchKey = randomString(6);

  // Check if the searchKey exists, if it exists set the searchKey to a new randomString
  playlistRef.orderByChild("searchKey").equalTo(searchKey).get().then(snap => {
    if (snap.exists()) {searchKey = randomString(6)}

    // Push a playlist into the spotify API
    request.post(options, function(error, response, body) {

      if(!body.error) {

        // Set the playlist in Firebase
        playlistRef.set({
          id: body.id,
          host: req.session.user.id,
          duration: req.body.duration,
          term: req.body.term,
          url: body.external_urls.spotify,
          searchKey: searchKey
        }).then(() => {

          req.session.playlistUrl = body.external_urls.spotify
          req.session.playlistId = body.id
          req.session.playlistName = req.body.playlist
          req.session.socketRoom = `${req.body.playlist}#${searchKey}`
          req.session.save()
          res.redirect(`/playlists/${makeUrlSafe(req.body.playlist)}/${searchKey}`)

        }).catch(err => console.log(err))
      }
    })
  })
})

module.exports = router;
