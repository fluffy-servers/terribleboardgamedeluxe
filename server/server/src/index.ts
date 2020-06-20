import socket from 'socket.io'
import sanitize from 'sanitize-html'
import { server } from './server'
import { Room } from '../../shared'
import { BoardManager } from './BoardManager'

let rooms = {}
const io = new socket(server)

io.on('connection', (socket: any) => {
    // Send a list of game boards on connection
    socket.emit('boards list', BoardManager.getBoardNames())

    socket.on('join game', (roomcode: string, username: string) => {
        roomcode = roomcode.toUpperCase()
        username = sanitize(username).trim()

        // Ignore logins from players already in rooms
        if (socket.gameRoom) {
            console.log('Discarding login from', username)
            return
        }

        console.log(username, 'is trying to join:', roomcode)

        // Verify that the room exists
        if (!rooms[roomcode]) {
            socket.emit('login error', 'Room is invalid')
            return
        }

        // Don't let players join games that are already started
        let room = rooms[roomcode]
        if (room.gamestate != 'lobby') {
            socket.emit('login error', 'Room is already in game')
            return
        }

        // Username validation
        if (username.length > 20 || username.length < 1) {
            socket.emit('login error', 'Username is invalid')
            return
        }

        // Verify that the username isn't taken
        for (let player of room.players) {
            if (player.username == username) {
                socket.emit('login error', 'Username is already taken')
                return
            }
        }

        // Add the player if there is space
        let player = {
            username: username,
            socket: socket
        }

        let id = room.addPlayer(player)
        if (id < 0) {
            socket.emit('login error', 'Room is full')
            return
        }
        console.log(username, 'assigned #', id)

        // Successfully joined the room!
        socket.gameRoom = room
        socket.playerID = id
        socket.join(roomcode)
        console.log(username, 'has joined room:', roomcode)

        socket.emit('joined lobby', roomcode, id)
        socket.emit('create board', room.board)
        io.to(roomcode).emit('update players', room.encodePlayers())
    })

    socket.on('create game', (username: string, boardType: string) => {
        // Verify that the username is valid
        if (username.length > 20 || username.length < 1) {
            socket.emit('login error', 'Username is invalid')
            return
        }

        // Create a new room
        let roomcode = Room.randomString(4)
        while (roomcode in rooms) {
            roomcode = Room.randomString(4)
        }
        const room = new Room(roomcode)
        room.board = BoardManager.createBoard(boardType)

        // Add the player to the room
        let player = {
            username: username,
            socket: socket
        }
        let id = room.addPlayer(player)

        // Player has successfully created a room
        socket.gameRoom = room
        socket.playerID = id
        socket.join(roomcode)
        console.log(username, 'has created room:', roomcode)

        socket.emit('joined lobby', roomcode, id)
        socket.emit('create board', room.board)
        socket.emit('lobby owner')
        io.to(roomcode).emit('update players', room.encodePlayers())
    })
})