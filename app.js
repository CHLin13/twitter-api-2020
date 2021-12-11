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
// socket.io
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:8080'],
  },
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
// -------------------------------
server.listen(port, () => console.log(`Example app listening on port ${port}!`))
require('./routes')(app)
require('./config/socketio')(io)
module.exports = app

// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config()
// }
//
// const express = require('express')
// const cors = require('cors')
// const { createServer } = require('http')
// const { Server } = require('socket.io')
//
// const passport = require('./config/passport')
//
// const app = express()
// const port = process.env.PORT || 3000
//
// const db = require('./models')
// const Chatroom = db.Chatroom
// const User = db.User
//
// const http = createServer(app)
// const io = new Server(http, {
//   cors: {
//     origin: "http://localhost:8080",
//     methods: ["GET", "POST"],
//     credentials: true
//   },
//   allowEIO3: true
// })
//
// app.use(cors())
// app.use(express.urlencoded({ extended: true }))
// app.use(express.json())
// app.use(passport.initialize())
// app.use(passport.session())
//
// io.on('connection', (socket) => {
//   socket.on('connection', (id) => {
//     return Promise.all([
//       User.findByPk(id, {
//         attributes: [
//           'id',
//           'name',
//           'account',
//           'avatar'
//         ]
//       }),
//       Chatroom.findAll({
//         include: [{
//           model: User,
//           as: 'User2',
//           attributes: [
//             'id',
//             'name',
//             'account',
//             'avatar'
//           ]
//         }]
//       })
//     ])
//       .then(([user, chatroom]) => {
//         return io.emit('self',[user, chatroom])
//       })
//   })
//
//   socket.on('emit_method', (msg) => {
//       Chatroom.create({
//         User1Id: 999,
//         User2Id: msg.userId,
//         message: msg.msg
//       })
//         .then(() => {
//           Chatroom.findAll({
//             where: { User2Id: msg.userId },
//             include: [{
//               model: User,
//               as: 'User2',
//               attributes: [
//                 'id',
//                 'name',
//                 'account',
//                 'avatar'
//               ]
//             }],
//             order: [['createdAt', 'DESC']],
//             limit: 1
//           })
//             .then(chatroom => {
//               return io.emit('self', chatroom)
//             })
//         })
//   })
// })
//
// http.listen(port, () => console.log(`Example app listening on port ${port}!`))
//
// require('./routes')(app)
//
// module.exports = app
