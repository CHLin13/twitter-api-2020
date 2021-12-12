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
    origin: 'http://localhost:8081',
  }
})
console.log("Server socket OK")
//用 api 方式建立連線
app.get('/api/messages', function (req, res) {
  const messages = 'hello world'
  res.status(200).send(messages)
})

//用 socket 方式建立連線
io.on('connection', function (socket) {
  console.log('======user connected=======', socket.id)
  // 建立一個 "sendMessage" 的監聽
  socket.on("sendMessage", function (message) {
    console.log(message)
    // 當收到事件的時候，也發送一個 "allMessage" 事件給所有的連線用戶
    io.emit("allMessage", message)
  })
})

server.listen(port, () => console.log(`Example app listening on port ${port}!`))
require('./routes')(app)
require('./config/socketio')(io)
module.exports = app