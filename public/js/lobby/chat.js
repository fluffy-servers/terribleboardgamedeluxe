// Open the chatbox
function openChatBox() {
    document.getElementById('chatfooter').classList.remove('hidden')
    document.getElementById('chat').style.height = '450px'
    document.getElementById('chatmessage').focus()
    gameController.chatOpen = true
}

// Close the chatbox
function closeChatBox() {
    document.getElementById('chat').style.height = '32px'
    document.getElementById('chatfooter').classList.add('hidden')
    gameController.chatOpen = false
}

// Handle sending of chat messages
function sendChatMessage() {
    if (gameController.state == 'login' || !gameController.chatOpen) return

    var text = document.getElementById('chatmessage').value
    socket.emit('chat message', text)
    document.getElementById('chatmessage').value = ''
}

// Receive and display chat messages
socket.on('chat message', function (username, text) {
    var body = document.getElementById('chatbody')
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
    if (e.keyCode == 84 && !gameController.chatOpen) {
        e.preventDefault()
        openChatBox()
    } else if (e.keyCode == 27 && gameController.chatOpen) {
        e.preventDefault()
        closeChatBox()
    }
})

// Send message on chat enter
document.getElementById('chatmessage').addEventListener('keyup', function (e) {
    if (gameController.state != 'lobby' && e.keyCode == 13) {
        e.preventDefault()
        sendChatMessage()
    }
})