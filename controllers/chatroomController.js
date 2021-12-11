const db = require('../models')
const User = db.User
const Online = db.Online

const chatroomController = {
  getIn: (req, res) => {
    Online.findOne({ where: { UserId: req.body.id } })
      .then(user => {
        if (user) {
          return res.json({ status: 'error', message: '已經加入聊天室' })
        } else {
          Online.create({
            UserId: req.body.id
          })
          User.findByPk(req.body.id)
            .then(user => {
              return res.json({ status: 'success', message: `${user.name} 加入聊天室` })
            })
        }
      })
  },

  getOut: (req, res) => {
    return Promise.all([
      Online.destroy({ where: { UserId: req.params.id } }),
      User.findByPk(req.params.id)
    ])
      .then(([online, user]) => {
        return res.json({ status: 'success', message: `${user.name} 離開聊天室` })
      })
  },

  getOnlineUsers: (req, res) => {
    return Online.findAll({
      include: [{
        model: User, attributes: [
          'id',
          'name',
          'avatar',
          'account'
        ]
      }],
    })
      .then(users => {
        return res.json(users)
      })
  }
}

module.exports = chatroomController