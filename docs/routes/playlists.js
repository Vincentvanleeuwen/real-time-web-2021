const { firebase } = require('../helpers/firebase')
const router = require('express').Router()
const request = require('request')
const { deleteColumns, restructureSongs } = require('../helpers/transformData')
const { makeUrlSafe } = require('../utils/makeUrlSafe')
const { shuffleArray } = require('../utils/shuffleArray')

const globalRef = firebase.database().ref('playlists/')

globalRef.on('value', function (snap) {
  let playlists = snap.val()
  if(!playlists) {
    return
  }
  let playlistKeys = Object.keys(playlists)
  playlistKeys.forEach((playlist) => {

    // Get all playlist routes from Firebase
    router.get(`/${makeUrlSafe(playlist)}/${playlists[playlist].searchKey}`, (req, res) => {

      if(!req.session.user) {
        res.redirect('/')
        return
      }

      req.session.host = playlists[playlist].host
      req.session.searchKey = playlists[playlist].searchKey
      req.session.playlist = playlist
      req.session.save()

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

        // Get a users top song list
        request.get(options, (error, response, body) => {

          // Filter the data
          let filtered = deleteColumns(body)

          const songsRef = firebase.database().ref(`playlists/${playlist}/songs/${req.session.user.id}`)

          // Add the songs to firebase
          songsRef.get().then((snapshot) => {
            if(!snapshot.val()) {
              songsRef
                .set(restructureSongs(filtered))
                .then(() => console.log('Set songs'))
                .catch(err => console.warn('SetSongError',err));
            }
          }).catch(err => console.warn('songError', err));

          // Render the playlist
          res.render('playlist', {
            layout: 'main',
            userId: req.session.user.id,
            name: req.session.user.name,
            image: req.session.user.image,
            playlistTitle: playlist,
            playlistTitleUrlSafe: makeUrlSafe(playlist),
            playlistUrl: snap.val().url,
            searchKey: snap.val().searchKey,
            users: snap.val().activeUsers ? Object.values(snap.val().activeUsers) :
              [{
                id: req.session.user.id,
                image: req.session.user.image,
                name: req.session.user.name
              }],
            isHost: snap.val().host,
            songs: restructureSongs(filtered)
          });
        });
      })
    })

    router.post(`/${makeUrlSafe(playlist)}/${playlists[playlist].searchKey}`, (req, res) => {

      if(!req.session.access_token){
        res.redirect('/')
        return
      }

      const songRef = globalRef.child(`${playlist}/songs`)
      songRef.on('value', (snap) => {

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
              return res.redirect(`/playlists/${makeUrlSafe(playlist)}/${playlists[playlist].searchKey}`)
            } else {
              console.log('error posting songs')
            }
          })
        })
      })

    })
  })
})

module.exports = router
