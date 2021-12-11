if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')

const passport = require('./config/passport')

const app = express()
const port = process.env.PORT || 3000

const http = createServer(app)
const io = new Server(http, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
})

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(passport.initialize())
app.use(passport.session())

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg)
  })
})

http.listen(port, () => console.log(`Example app listening on port ${port}!`))

require('./routes')(app)

module.exports = app
