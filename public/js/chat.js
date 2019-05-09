const socket = io()

socket.on('message', (msg) => {
    console.log(msg)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()   // prevents browser default behavior likeauto-refresh after submit

    const msg = document.querySelector('#message-input').value

    socket.emit('sendMessage', msg, (ackMsg) => {
        console.log('message ... ', ackMsg)
    })
})

document.querySelector('#share-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (ackMsg) => {
            console.log(ackMsg)
        })
    })
})
