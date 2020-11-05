module.exports = server => {
    const io = require('socket.io')(server)

    io.on('connection', socket => {
        console.log('socketio connected')
        socket.on('sendMsg', data => {
            console.log('服务器接受浏览器发送的消息', data)

            io.emit('receiveMsg', data.name + '_' + data.date)
            console.log('服务器向浏览器发送消息', data);
        })
    })
}