const http = require('http')
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
const server = http.createServer(app)
const { initSocketIO } = require('./docs/helpers/socket')

// Create a session
const newSession = session({
  secret: 'combinify-secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: 'auto',
  },
})

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
  defaultLayout: 'main',
  helpers: require('./docs/config/handlebarsHelpers')
}))
app.set('trust proxy', 1)
app.use(express.static(__dirname + '/public'))
    .use(compression())
    .use(cors())
    .use(cookieParser())
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(newSession)
    .use('/', login)
    .use('/home', home)
    .use('/callback', callback)
    .use('/create', create)
    .use('/playlists', playlists)
    .use('/offline', offline)
    .use('/*', error)

// Initialize Socket.io
initSocketIO(server, newSession)

server.listen(port, () => {
  console.log(`Listening on ${port}`)
})
