const express  = require('express')
const path     = require('path')
const fs       = require('fs')
const http     = require('http')
const socketio = require('socket.io')

const { generateMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT

app.use( express.static( path.join(__dirname, '../public') ) )

app.use((req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}`;

    console.log(log);
    fs.appendFileSync('server.log', log + '\n');
    next();
});


io.on('connection', (socket) => {
    console.log('new websocket connection')

    socket.emit('message', generateMessage('Welcome to Sanity Chat!'))
    socket.broadcast.emit('message', generateMessage('A new user has joined'))

    socket.on('sendMessage', (msg, callback) => {

        if (msg.length === 0) {
            return callback('Rejected: please enter text to send')
        }

        io.emit('message', generateMessage(msg))
        callback('Delivered')
    })

    socket.on('sendLocation', (coords, callback) => {
        const locationMsg = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
        io.emit('locationMessage', locationMsg)
        callback('Location shared!')
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left the chat'))
    })
})

server.listen(port, () => {
    console.log(`Sanity Chat Server is up on port ${port}`);
});