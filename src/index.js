const express  = require('express')
const path     = require('path')
const fs       = require('fs')
const http     = require('http')
const socketio = require('socket.io')

const { generateMessage } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

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

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room})

        if (error) {
            return callback(error)
        }


        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome to Sanity Chat!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)

        if (msg.length === 0) {
            return callback('Rejected: please enter text to send')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback('Delivered')
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback('Location shared!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Sanity Chat Server is up on port ${port}`);
});