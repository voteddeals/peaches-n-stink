
//
require('dotenv').config()

//
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const websiteRouter = require('./routes/active')
const routesUserSettings = require('./routes/user-settings')
const routeSignUp = require('./routes/sign-up')
const routeLogin = require('./routes/login')
const apiRouter = require('./routes/api')
const uuid = require('uuid/v4')
const session = require('express-session')
const redisStore = require('connect-redis')(session)
const redis = require('redis')

//
const redisClient = redis.createClient(process.env.REDIS_PORT)
const app = express()
const server = app.listen(process.env.HTTP_PORT)

//
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//TODO: do the secret better
//TODO: use more options to ensure cookie/session
//security is good enough
app.use(session({
    genid: req => uuid(),
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new redisStore({ host: "localhost", port: process.env.REDIS_PORT, client: redisClient })
    })
)

app.use(express.static(path.join(
    __dirname,
    'public')))

app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use('/', websiteRouter)
app.use('/settings/', routesUserSettings)
app.use('/sign-up/', routeSignUp)
app.use('/login/', routeLogin)
app.use('/new/', require('./routes/new-post'))
app.use(/^\/p\/([a-z0-9]{22})$/i, require('./routes/display-single-post'))
app.use(/^\/p\/([a-z0-9]{22})\/edit$/i, require('./routes/single-post-edit'))
app.use(/^\/c\/([a-z0-9]{22})$/i, require('./routes/single-comment-display'))
app.use('/api/v1/', apiRouter)
