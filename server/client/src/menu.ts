import { GameController } from './GameController'
import { RoomState, Room } from '../../shared'
import * as discord from './discord'

/**
 * Display the join room screen
 */
export function joinRoomScreen(): void {
    document.getElementById('mainroom').style.display = 'none'
    document.getElementById('joinroom').style.display = 'block'
}

/**
 * Display the create room screen
 */
export function createRoomScreen(): void {
    document.getElementById('mainroom').style.display = 'none'
    document.getElementById('createroom').style.display = 'block'
}

/**
 * Display the main menu
 */
export function mainRoomScreen(): void {
    document.getElementById('createroom').style.display = 'none'
    document.getElementById('joinroom').style.display = 'none'
    document.getElementById('mainroom').style.display = 'block'
}

/**
 * Display the lobby screen
 */
export function lobbyScreen(): void {
    document.getElementById('createroom').style.display = 'none'
    document.getElementById('joinroom').style.display = 'none'
    document.getElementById('mainroom').style.display = 'none'
    document.getElementById('lobby').style.display = 'block'

    document.getElementById('chat').style.display = 'block'
}

/**
 * Attempt connection to a game
 */
export function attemptLogin(): void {
    const roomcode = (<HTMLInputElement>document.getElementById('join-roomcode')).value
    const username = (<HTMLInputElement>document.getElementById('join-username')).value
    GameController.socket.emit('join game', roomcode, username)
}

/**
 * Attempt to create a new game
 */
export function attemptCreate(): any {
    const username = (<HTMLInputElement>document.getElementById('create-username')).value
    const boardType = (<HTMLInputElement>document.getElementById('map-select')).value
    GameController.socket.emit('create game', username, boardType)
}

/**
 * Attempt to start a new game
 */
export function attemptStart() {
    GameController.socket.emit('start game')
}

/**
 * Build up a list of players to display in the lobby info screen
 * @param players array of player objects
 */
export function lobbyPlayersList(players: any[]) {
    const list = document.getElementById('lobby-players-list')
    list.innerHTML = ''

    for (const id in players) {
        const player = players[id]
        if (!player) continue

        const item = document.createElement('li')
        const avatar = document.createElement('img')
        avatar.src = 'assets/board/sprite/fox_hr' + id + '.png'

        const text = document.createElement('span')
        text.innerHTML = player.username

        item.appendChild(avatar)
        item.appendChild(text)
        list.appendChild(item)
    }
}

/**
 * Bind menu events to the global socket
 */
export function bindSocketEvents(): void {
    const socket = GameController.socket

    // Display login errors
    socket.on('login error', (text: string) => {
        const message = document.getElementById('loginmessage-join')
        message.innerHTML = text
        message.classList.add('loginerror')
    })

    // Handle successful game joins
    socket.on('joined lobby', (roomcode: string, id: number) => {
        console.log('Connected to room:', roomcode)
        GameController.roomcode = roomcode
        GameController.state = RoomState.Lobby
        GameController.playerID = id

        lobbyScreen()
        discord.joinLobby(roomcode, 1, 8)
        document.getElementById('lobby-roomcode').innerHTML = roomcode
    })

    // Update the list of lobby players
    socket.on('update players', (players: any[]) => {
        if (GameController.state == RoomState.Lobby) {
            lobbyPlayersList(players)
        }

        discord.updatePlayers(players.length, 8)
    })

    // Update the list of board types
    socket.on('boards list', (boards: string[]) => {
        const dropdown = (<HTMLSelectElement>document.getElementById('map-select'))
        for (let board of boards) {
            let option = document.createElement('option')
            option.text = board
            dropdown.add(option)
        }
    })

    // Display the start button if lobby owner
    socket.on('lobby owner', () => {
        document.getElementById('startbutton').style.display = 'block'
    })

    // Close up the menu once the game starts
    socket.on('start game', () => {
        document.getElementById('lobby').style.display = 'none'
        GameController.state = RoomState.Board
        document.getElementById('background').style.display = 'none'

        this.unbindSocketEvents()
        discord.onBoard()
    })
}

/**
 * Unbind menu events from the global socket
 */
export function unbindSocketEvents(): void {
    const socket = GameController.socket

    socket.off('login error')
    socket.off('joined lobby')
    socket.off('update players')
    socket.off('boards list')
    socket.off('lobby owner')
    socket.off('start game')
}

/**
 * Bind menu buttons to the above functions
 */
document.getElementById('main-createroom-button').addEventListener('click', () => {
    createRoomScreen()
})

document.getElementById('main-joinroom-button').addEventListener('click', () => {
    joinRoomScreen()
})

document.getElementById('createbutton').addEventListener('click', () => {
    attemptCreate()
})

document.getElementById('joinbutton').addEventListener('click', () => {
    attemptLogin()
})

document.getElementById('startbutton').addEventListener('click', () => {
    attemptStart()
})

document.getElementById('backbutton-create').addEventListener('click', () => {
    mainRoomScreen()
})

document.getElementById('backbutton-join').addEventListener('click', () => {
    mainRoomScreen()
})