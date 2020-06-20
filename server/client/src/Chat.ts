import { GameController } from './GameController'
import { RoomState, Room } from '../../shared'

// Open the chatbox
function openChatBox() {
    if (GameController.chatOpen && GameController.chatTransitionComplete) {
        document.getElementById('chatinput').focus()
    } else {
        document.getElementById('chat').style.bottom = '0px'
        GameController.chatOpen = true
        GameController.chatTransitionComplete = false
    }
}

// Close the chatbox
function closeChatBox() {
    document.getElementById('chatinput').blur()
    document.getElementById('chat').style.bottom = '-418px'
    GameController.chatOpen = false
}

// Handle sending of chat messages
function sendChatMessage() {
    if (GameController.state == RoomState.Menu || !GameController.chatOpen) return

    const chatin = (<HTMLInputElement>document.getElementById('chatinput'))
    const text = chatin.value
    chatin.value = ''

    GameController.socket.emit('chat message', text)
}

/**
 * Bind menu events to the global socket
 */
export function bindSocketEvents(): void {
    const socket = GameController.socket

    // Display messages sent by other players
    GameController.socket.on('chat message', (username: string, text: string) => {
        const body = document.getElementById('chatmessages')
        const msg = document.createElement('p')
        const name = document.createElement('b')
        name.innerHTML = username + ': '
        const content = document.createTextNode(text)

        msg.appendChild(name)
        msg.appendChild(content)
        body.appendChild(msg)
        body.scrollTop = body.scrollHeight
    })
}

/**
 * Global key handlers to open/close chat box
 */
window.addEventListener('keydown', e => {
    if (GameController.state == RoomState.Menu) return

    if (e.keyCode == 84 && document.activeElement.id != 'chatinput') {
        e.preventDefault()
        openChatBox()
    } else if (e.keyCode == 27 && GameController.chatOpen) {
        e.preventDefault()
        closeChatBox()
    }
})

/**
 * Helpful functionalities for chat ease of use
 */
document.getElementById('chatinput').addEventListener('keyup', e => {
    if (GameController.state != RoomState.Menu && e.keyCode == 13) {
        e.preventDefault()
        sendChatMessage()
    }
})

document.getElementById('chat').addEventListener("transitionend", e => {
    if (GameController.chatOpen) {
        document.getElementById('chatinput').focus()
        GameController.chatTransitionComplete = true
    }
})