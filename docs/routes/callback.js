const router = require('express').Router();
const request = require('request'); // "Request" library
const querystring = require('querystring');

const stateKey = 'spotify_auth_state';

// Spotify API callback
router.get('/', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')),
        'Content-Type': 'application/x-www-urlencoded'
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {

      if (error || response.statusCode !== 200) {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          })
        );
        return
      }

      req.session.access_token = body.access_token
      req.session.refresh_token = body.refresh_token
      req.session.save();

      res.redirect('/home' );

    });
  }
});

module.exports = router;
