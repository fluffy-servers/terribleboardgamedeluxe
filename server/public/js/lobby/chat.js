// Open the chatbox
function openChatBox() {
    if (gameController.chatOpen && gameController.chatTransitionComplete) {
        document.getElementById('chatinput').focus()
    } else {
        document.getElementById('chat').style.bottom = '0px'
        gameController.chatOpen = true
        gameController.chatTransitionComplete = false
    }
}

// Close the chatbox
function closeChatBox() {
    document.getElementById('chatinput').blur()
    document.getElementById('chat').style.bottom = '-418px'
    gameController.chatOpen = false
}

// Handle sending of chat messages
function sendChatMessage() {
    if (gameController.state == 'login' || !gameController.chatOpen) return

    var text = document.getElementById('chatinput').value
    socket.emit('chat message', text)
    document.getElementById('chatinput').value = ''
}

// Receive and display chat messages
socket.on('chat message', function (username, text) {
    var body = document.getElementById('chatmessages')
    var msg = document.createElement('p')
    var name = document.createElement('b')
    name.innerHTML = username + ': '
    var content = document.createTextNode(text)

    msg.appendChild(name)
    msg.appendChild(content)
    body.appendChild(msg)
    body.scrollTop = body.scrollHeight
})

// Global key handlers to open and close chat
window.addEventListener('keydown', e => {
    if (gameController.state == 'login') return

    e = e || window.event
    if (e.keyCode == 84 && document.activeElement.id != 'chatinput') {
        e.preventDefault()
        openChatBox()
    } else if (e.keyCode == 27 && gameController.chatOpen) {
        e.preventDefault()
        closeChatBox()
    }
})

// Send message on chat enter
document.getElementById('chatinput').addEventListener('keyup', function (e) {
    if (gameController.state != 'login' && e.keyCode == 13) {
        e.preventDefault()
        sendChatMessage()
    }
})

document.getElementById('chat').addEventListener("transitionend", function (e) {
    if (gameController.chatOpen) {
        document.getElementById('chatinput').focus()
        gameController.chatTransitionComplete = true
    }
});