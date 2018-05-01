var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var Jar = require('./db.js')
var index = require('./routes/index')
const basicAuth = require('express-basic-auth')

var app = express()

var db = new Jar()
app.set('db', db)

db.on('ready', () => {
  console.log('Db is ready')
  if (!db.get('users')) {
    console.log('No users found, setting default users')
    db.set('users', { 'admin': 'admin' })
  } else {
    console.log('Using old users', db.get('users'))
  }

  app.use(basicAuth({
    users: db.get('users'),
    challenge: true,
    realm: 'apio-jobs-list'
  }))
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index)
app.use('/api/jobs', require('./routes/jobs.router.js'))
app.use('/api/hosts', require('./routes/hosts.router.js'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  console.log(err)
  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
