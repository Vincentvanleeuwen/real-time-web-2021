const firebase = require('firebase/app')
require('firebase/database')
const router = require('express').Router()
const request = require('request')
const { deleteColumns, restructureSongs } = require('../helpers/transformData')
const { makeUrlSafe } = require('../utils/makeUrlSafe')

const globalRef = firebase.database().ref('playlists/')
globalRef.on('value', function (snap) {
  let playlists = snap.val()
  if(!playlists) {
    return
  }
  console.log(playlists)
  let playlistKeys = Object.keys(playlists)
  playlistKeys.forEach((playlist) => {

    router.get(`/${makeUrlSafe(playlist)}/${playlists[playlist].searchKey}`, (req, res) => {
      console.log(req.session.user)
      if(!req.session.user) {
        res.redirect('/')
        return
      }

      const playlistRef = firebase.database().ref('playlists/').child(`${playlist}`)
      playlistRef.on('value', (snap) => {

        const options = {
          url: `https://api.spotify.com/v1/me/top/tracks/?time_range=${snap.val().term + '_term'}&limit=${snap.val().duration}`,
          headers: {
            'Authorization': 'Bearer ' + req.session.access_token,
            'Content-Type': 'application/json'
          },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          let filtered = deleteColumns(body)

          const songsRef = firebase.database().ref(`playlists/${playlist}/songs/${req.session.user.id}`)

          songsRef.once('value', (snapshot) => {
            if(!snapshot.val()) {
              songsRef.set(restructureSongs(filtered)).then(() => console.log('Set songs')).catch(err => console.log(err));
            }
          }).then(() => console.log('Songs Completed')).catch(err => console.log(err));

          res.render('playlist', {
            layout: 'main',
            userId: req.session.user.id,
            name: req.session.user.name,
            image: req.session.user.image,
            playlistTitle: playlist,
            playlistUrl: snap.val().url,
            searchKey: snap.val().searchKey,
            songs: restructureSongs(filtered)
          });
        });
      })
    })

    router.post(`/${makeUrlSafe(playlist)}`, (req, res) => {
      if(!req.session.access_token) {
        res.redirect('/')
        return
      }
      let uris = ""
      const playlistRef = firebase.database().ref(`playlists/${playlist}`)
      playlistRef.on('value', (snap) => {
        snap.val().songs.map(song => {
          uris = uris + song.uri + ","
        })
      })

      const options = {
        method: 'POST',
        url: `https://api.spotify.com/v1/playlists/${req.session.playlistId}/tracks?uris=${uris}`,
        headers: {
          'Authorization': 'Bearer ' + req.session.access_token,
          'Content-Type': 'application/json'
        },
        json: true
      }

      // use the access token to access the Spotify Web API
      request.post(options, function(error, response, body) {
        if(!body.error) {
          res.redirect(`/playlists/${makeUrlSafe(req.session.playlistName)}`)
        }
      })
    })
  })
})

module.exports = router
