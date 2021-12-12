const db = require('../models')
const Message = db.Message
const Chatroom = db.Chatroom
const User = db.User

module.exports = (io) => {
    io.on('connection', socket => {
        console.log('user connected...')
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
                    socket.emit('historyTexts', chatroom)
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

        socket.on('private message', (msg) => {
            console.log('private_msg====>', msg)
            socket.broadcast.emit('unread_msg', msg)
            Message.create({
                ReceiverId: msg.ReceiverId,
                message: msg.message,
                SenderId: msg.SenderId,
                targetChannel: msg.targetChannel
            })
                .then(
                    socket.join(msg.targetChannel),
                    io.to(msg.targetChannel).emit('private_msg_from_backend', msg)
                ).catch(error => {
                    console.log(error)
                })
        })
        socket.on('leave', () => {
            console.log('user disconnected')
        })
    })
}