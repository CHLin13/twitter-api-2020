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
  
io.on('connection', (socket) => {
  socket.on('getCurrentUserId', (id) => {
    return Promise.all([
      User.findByPk(id, {
        attributes: [
          'id',
          'name',
          'account',
          'avatar'
        ]
      }),
      Chatroom.findAll({
        include: [{
          model: User,
          as: 'User2',
          attributes: [
            'id',
            'name',
            'account',
            'avatar'
          ]
        }]
      })
    ])
      .then(([user, chatroom]) => {
        socket.emit('historyTexts',chatroom)
        io.emit('onlineUsers', user)
      })
  })

  socket.on('emit_method', (msg) => {
      Chatroom.create({
        User1Id: 999,
        User2Id: msg.userId,
        message: msg.msg
      })
        .then(() => {
          Chatroom.findAll({
            where: { User2Id: msg.userId },
            include: [{
              model: User,
              as: 'User2',
              attributes: [
                'id',
                'name',
                'account',
                'avatar'
              ]
            }],
            order: [['createdAt', 'DESC']],
            limit: 1
          })
            .then(chatroom => {
              return io.emit('single_thread', chatroom)
            })
        })
  })
})

server.listen(port, () => console.log(`Example app listening on port ${port}!`))
require('./routes')(app)
require('./config/socketio')(io)
module.exports = app