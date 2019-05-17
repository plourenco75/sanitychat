const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message-input')
const $messageFormButton = $messageForm.querySelector('button')
const $shareLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

// Listeners
socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        message: msg.text,
        createdAt: moment(msg.createdAt).format('D MMM YY - h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (msg) => {
    console.log(msg)
    const html = Mustache.render(locationTemplate, {
        location: msg
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()   // prevents browser default behavior likeauto-refresh after submit

    // disable the form once its been submitted
    $messageFormButton.setAttribute('disabled', 'disabled')

    const msg = $messageFormInput.value

    socket.emit('sendMessage', msg, (ackMsg) => {
        // re-enable the message form button
        $messageFormButton.removeAttribute('disabled')
        // clear the input after sending
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        console.log('message ... ', ackMsg)
    })
})

$shareLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $shareLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (ackMsg) => {
            // re-enable the share button after acknowledgment from server
            $shareLocationButton.removeAttribute('disabled')
            console.log(ackMsg)
        })
    })
})
