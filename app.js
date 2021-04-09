/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
const firebase = require('firebase/app')
require('firebase/database')
const compression = require('compression')
const express = require('express') // Express web server framework
const handlebars = require('express-handlebars')
const session = require('express-session')
const cors = require('cors')
const cookieParser = require('cookie-parser')

if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const port = process.env.PORT || 3000
const app = express();

const firebaseConfig = {
  apiKey: "AIzaSyDnBaT31_LbWAjiRd7isQ1pPdiDVD1HmtQ",
  authDomain: "combinify-b1222.firebaseapp.com",
  databaseURL: "combinify-b1222-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "combinify-b1222",
  storageBucket: "combinify-b1222.appspot.com",
  messagingSenderId: "274350746286",
  appId: "1:274350746286:web:ee843bfbd1f420cb235b3f",
  measurementId: "G-1PDBZFE48J"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Require the routes
const home = require('./docs/routes/home')
const login = require('./docs/routes/login')
const callback = require('./docs/routes/callback')
const create = require('./docs/routes/create')
const playlists = require('./docs/routes/playlists')
const error = require('./docs/routes/error')
const offline = require('./docs/routes/offline')

// Assign handlebars as the view engine
app.set('view engine', 'hbs');
app.set('views', __dirname + '/docs/views')
app.engine('hbs', handlebars({
  extname: 'hbs',
  defaultLayout: 'main'
}))
app.set('trust proxy', 1)
app.use(express.static(__dirname + '/public'))
  .use(compression())
  .use(cors())
  .use(cookieParser())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(session({
    secret: 'combinify-secret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: 'auto' }
  }))
  .use('/', login)
  .use('/home', home)
  .use('/callback', callback)
  .use('/create', create)
  .use('/playlists', playlists)
  .use('/offline', offline)
  .use('/*', error)

console.log(`Listening on ${port}`)
app.listen(port)
