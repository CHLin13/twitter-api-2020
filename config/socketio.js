const db = require('../models')
const User = db.User
const Chat = db.Chat
const Message = db.Message
const Subscribe = db.Subscribe
const Notification = db.Notification
const Reply = db.Reply
const Tweet = db.Tweet
module.exports = (io) => {
    io.on('connection', socket => {
        console.log('user connected...')
        socket.on('private message', (msg) => {
            console.log('private_msg====>', msg)
            socket.broadcast.emit('unread_msg', msg)
            const UserId = msg.UserId
            return Promise.all([
                Message.create({
                    ReceiverId: msg.receiverId,
                    message: msg.message,
                    SenderId: UserId,
                    targetChannel: msg.targetChannel
                })
            ])
                .then(
                    socket.join(msg.targetChannel),
                    io.to(msg.targetChannel).emit('private_msg_from_backend', msg)
                ).catch(error => {
                    console.log(error)
                })
        })
        socket.on('private chatroom', (channel) => {
            socket.join(channel)
        })
        socket.on('leave private chatroom', (channel) => {
            socket.leave(channel)
        })
        socket.on('leave', (id) => {
            console.log('user disconnected')
        })
    })
}