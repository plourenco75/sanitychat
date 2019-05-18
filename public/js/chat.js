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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

// autoscrolling logic
const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
        // ps - all this code is to provide nice feature of scrolling
        // to bottom only if the user is looking at last message.
        // ie - if user is browsing chat history, then it won't 
        // autoscroll to the bottom. If we weren't providing the feature
        // we would simply use the above single line of code only!
    }
}

// Listeners
socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('D MMM YY - h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (msg) => {
    console.log(msg)
    const html = Mustache.render(locationTemplate, {
        username: msg.username,
        location: msg.text,
        createdAt: moment(msg.createdAt).format('D MMM YY - h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'  // redirect
    }
})