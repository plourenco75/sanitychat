const express  = require('express')
const path     = require('path')
const fs       = require('fs')
const http     = require('http')
const socketio = require('socket.io')

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

let count = 0

io.on('connection', (socket) => {
    console.log('new websocket connection')

    socket.emit('countUpdated', count)

    socket.on('increment', () => {
        count++
        // socket.emit('countUpdated', count)
        io.emit('countUpdated', count)   //emits event to all connections
    })
})

server.listen(port, () => {
    console.log(`Sanity Chat Server is up on port ${port}`);
});