const router = require('express').Router()
const { randomString } = require('../utils/generateRandomString')
const stateKey = 'spotify_auth_state'
const querystring = require('querystring')

router.get('/', (req, res) => {

  res.render('login', {
    layout: 'main'
  });
});

router.get('/login', (req, res) => {

  let state = randomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  const scope = 'user-read-email user-read-private user-library-read user-top-read playlist-read-collaborative' +
    ' playlist-modify-public playlist-modify-private'

  // Redirect to spotify authorization api
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      state: state
    }));
});

module.exports = router
