const { Op } = require('sequelize')
const helpers = require('../_helpers')
const { sequelize } = require('../models')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const Message = db.message

const messageController = {
    getMessage:(req,res) =>{
        return Message.findAll( {
            where: { targetChannel: req.body.targetChannel }
        }).then(messages =>{
            return res.json(messages)
        })
    },
    postMessage: (req, res) => {
        Message.create({
            SenderId: helpers.getUser(req).id,
            ReceiverId: req.body.id,
            message: req.body.message,
            targetChannel: req.body.targetChannel
        })
            .then(() => {
            res.json({ status: 'success', message: '成功發送私訊' })
        })
    }
}

module.exports = messageController

