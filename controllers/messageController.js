const { Op } = require('sequelize')
const helpers = require('../_helpers')
const db = require('../models')
const Message = db.Message

const messageController = {
    getMessage:(req,res) =>{
        return Message.findAll({
            where: {
                [Op.or]: [
                    { SenderId: helpers.getUser(req).id, ReceiverId: req.params.id},
                    { SenderId: req.params.id, ReceiverId: helpers.getUser(req).id}
                ]
            },
            order: [['createdAt', 'ASC']]
        }).then(messages =>{
            return res.json(messages)
        })
    }
}

module.exports = messageController
