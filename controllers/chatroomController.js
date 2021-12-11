const db = require('../models')
const User = db.User
const Chatroom = db.Chatroom

const chatroomController = {
  getIn: (req, res) => {
    Chatroom.findOne({ where: { User2Id: req.body.id } })
      .then(user => {
        if (user) {
          return res.json({ status: 'error', message: '已經加入聊天室' })
        } else {
          Chatroom.create({
            User1Id: 999,
            User2Id: req.body.id
          })
            .then(() => {
              return res.json({ status: 'success', message: '成功加入聊天室' })
            })
        }
      })
  },

  getOut: (req, res) => {
    return Chatroom.destroy({ where: { User2Id: req.params.id } })
      .then(() => {
        return res.json({ status: 'success', message: '成功離開聊天室' })
      })
  },

  getOnlineUsers: (req, res) => {
    return Chatroom.findAll({
      where: { User1Id: 999 },
      include: [{
        model: User,
        as: 'User2',
        attributes: [
          'id',
          'name',
          'avatar',
          'account'
        ]
      }]
    })
      .then(users => {
        return res.json(users)
      })
  }
}

module.exports = chatroomController