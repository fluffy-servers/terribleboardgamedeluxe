import * as socketio from 'socket.io'
import sanitize from 'sanitize-html'
import { performance } from 'perf_hooks'
import { server } from './Server'
import { Board, Room, RoomState } from '../../shared/dist'
import { BoardManager } from './BoardManager'

const io = socketio.listen(server)

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

        // Check if the room exists
        let room = Room.findRoom(roomcode)
        if (!room) {
            socket.emit('login error', 'Room does not exist')
            return
        }

        // Don't let players join games that are already started
        if (room.gamestate != RoomState.Lobby) {
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
            if (player && player.username == username) {
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
        const room = new Room()
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
        socket.join(room.roomcode)
        console.log(username, 'has created room:', room.roomcode)

        socket.emit('joined lobby', room.roomcode, id)
        socket.emit('create board', room.board)
        socket.emit('lobby owner')
        io.to(room.roomcode).emit('update players', room.encodePlayers())
    })

    socket.on('start game', () => {
        if (!socket.gameRoom) return
        let room = socket.gameRoom as Room

        if (room.ownerID == socket.playerID) {
            // Start the game
            room.gamestate = RoomState.Board
            io.to(room.roomcode).emit('start game')

            // Place the foxes on the board
            for (const player of room.players) {
                if (!player) continue
                const id = player.socket.playerID

                const tile = room.board.getRandomEmptyTile()
                room.board.updatePlayer(id, tile.x, tile.y)
            }

            // Network all positions
            io.to(room.roomcode).emit('update player positions', room.board.players)
        }
    })

    socket.on('chat message', (text: string) => {
        if (!socket.gameRoom) return
        const room = socket.gameRoom as Room
        const username = room.players[socket.playerID].username
        text = sanitize(text).trim()

        // Check some basic anti-spam stuff
        if (socket.lastChat && (performance.now() - socket.lastChat) < 500) return
        if (text.length < 1) return

        socket.lastChat = performance.now()
        io.to(room.roomcode).emit('chat message', username, text)
    })

    socket.on('board movement', (direction) => {
        if (performance.now() - socket.lastMove < 500) return
        const room = socket.gameRoom as Room

        let reverse = Board.reverseDirection(direction)
        if (socket.lastDirection && socket.lastDirection[0] == reverse[0] && socket.lastDirection[1] == reverse[1]) return

        // Update player movement (if valid)
        const newTile = room.board.attemptMove(socket.playerID, direction)
        if (newTile) {
            socket.lastMove = performance.now()
            socket.lastDirection = direction
            io.to(room.roomcode).emit('animate fox', socket.playerID, newTile.x, newTile.y, newTile.tileType)
        }
    })

    socket.on('disconnect', () => {
        if (socket.gameRoom) {
            const room = socket.gameRoom as Room
            room.removePlayer(socket.playerID)
            io.to(room.roomcode).emit('update players', room.encodePlayers())
        }
    })
})