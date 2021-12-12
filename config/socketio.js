const db = require('../models')
const Message = db.Message

module.exports = (io) => {
    io.on('connection', socket => {

        console.log('user connected...')
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