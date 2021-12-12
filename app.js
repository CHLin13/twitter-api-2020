if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const cors = require('cors')
const passport = require('./config/passport')
const app = express()
const port = process.env.PORT || 3000
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())
app.use(cors())

const server = require('http').createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:8080',
  }
})

server.listen(port, () => console.log(`Example app listening on port ${port}!`))
require('./routes')(app)
require('./config/socketio')(io)
module.exports = app