var express = require('express')
var http = require('http')
var socket = require('socket.io')
var sanitize = require('sanitize-html')
var port = process.env.PORT || 3000

var app = express()
var server = http.createServer(app)
var io = socket(server)

var Board = require('./board/board.js')

server.listen(port, function () {
    console.log('Server started on *:3000')
})

app.use(express.static('public'))

const MAX_PLAYERS = 8
var rooms = {}

// Encode the list of players into a format that can be sent through sockets
// This leaves gaps for players that are not currently in the game
function encodeRoomPlayers(players) {
    var output = []
    for (var i = 0; i < MAX_PLAYERS; i++) {
        var player = players[i]
        if (!player) {
            output.push(false)
        } else {
            output.push({ username: player.username })
        }
    }

    return output
}

// Register a new player into a room
function addNewPlayer(roomcode, player, update = true) {
    var room = rooms[roomcode]
    for (var i = 0; i < MAX_PLAYERS; i++) {
        if (!room.players[i]) {
            room.players[i] = player
            if (update) {
                io.to(roomcode).emit('update players', encodeRoomPlayers(room.players))
            }
            return i
        }
    }

    return -1
}

// Remove a player from a room
function removePlayer(roomcode, playerid, update = true) {
    var room = rooms[roomcode]
    room.players[playerid] = false
    if (update) {
        io.to(roomcode).emit('update players', encodeRoomPlayers(room.players))
    }
}

// Generate a new board for a room
function createBoard() {
    var b = new Board()
    b.fromArray(require('./board/shapes/shape1.js'))
    b.shuffleTileTypes()
    return b
}

// Generate a random string of n characters
// This is a recursive function
function randomString(n, base = '') {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'
    var char = letters[Math.floor(Math.random() * letters.length)]

    if (n <= 1) {
        return base + char
    } else {
        return randomString(n - 1, base + char)
    }
}

// Create and register a new room
// This generates a board and random roomcode
function createRoom() {
    // Generate a random room code
    let roomcode = randomString(4)
    if (rooms[roomcode]) {
        roomcode = randomString(4)
    }

    // Create and register the new room
    const room = {
        roomcode: roomcode,
        gamestate: 'lobby',
        players: [],
        board: createBoard(),
        ownerID: 0
    }
    rooms[roomcode] = room

    return roomcode
}

io.on('connection', (socket) => {
    socket.on('join game', function (roomcode, username) {
        roomcode = roomcode.toUpperCase()
        username = sanitize(username).trim()

        // Ignore logins from people already in rooms
        if (socket.gameRoom) {
            console.log('Discarding login from', username)
            return
        }

        console.log(username, 'trying to join room:', roomcode)

        // Verify that the game room exists
        if (!rooms[roomcode]) {
            socket.emit('login error', 'Room is invalid')
            return
        }
        var room = rooms[roomcode]

        // Don't let people join games that are in progress
        // Might change this later
        if (room.gamestate != 'lobby') {
            socket.emit('login error', 'Room is already in game')
            return
        }

        // Verify that the username is valid
        if (username.length > 20 || username.length < 1) {
            socket.emit('login error', 'Username is invalid')
            return
        }

        // Verify that the username isn't taken
        for (var player of room.players) {
            if (player.username == username) {
                socket.emit('login error', 'Username is already taken')
                return
            }
        }

        // Add the player if there is space
        var player = {
            username: username,
            socket: socket
        }
        var id = addNewPlayer(roomcode, player, false)
        if (id < 0) {
            socket.emit('login error', 'Room is full')
            return
        }
        console.log(username, 'assigned to', id)

        // Player is successfully in the room!
        socket.gameRoom = roomcode
        socket.playerID = id
        socket.join(roomcode)
        console.log(username, 'has joined room:', roomcode)

        socket.emit('joined lobby', roomcode)
        socket.emit('create board', room.board)
        io.to(roomcode).emit('update players', encodeRoomPlayers(room.players))
    })

    socket.on('create game', function (username) {
        // Verify that the username is valid
        if (username.length > 20 || username.length < 1) {
            socket.emit('login error', 'Username is invalid')
            return
        }

        // Create a new room
        const roomcode = createRoom()
        var room = rooms[roomcode]

        // Add the player to the room
        var player = {
            username: username,
            socket: socket
        }
        var id = addNewPlayer(roomcode, player, false)

        // Player has successfully created a room
        socket.gameRoom = roomcode
        socket.playerID = id
        socket.join(roomcode)
        console.log(username, 'has created room:', roomcode)

        socket.emit('joined lobby', roomcode)
        socket.emit('create board', room.board)
        socket.emit('lobby owner')
        io.to(roomcode).emit('update players', encodeRoomPlayers(room.players))
    })

    socket.on('start game', function () {
        if (!socket.gameRoom) return
        var roomcode = socket.gameRoom
        var room = rooms[roomcode]

        if (room.ownerID == socket.playerID) {
            // Start the game
            room.gamestate = 'board'
            io.to(roomcode).emit('start game')

            // Place the foxes on the board
            for (const player of room.players) {
                if (!player) continue
                const id = player.socket.playerID

                const tile = room.board.getRandomEmptyTile()
                room.board.updatePlayer(id, tile.x, tile.y)
            }

            // Network all positions
            io.to(roomcode).emit('update player positions', room.board.players)
        }
    })

    socket.on('chat message', function (text) {
        if (!socket.gameRoom) return
        var roomcode = socket.gameRoom
        var username = rooms[roomcode].players[socket.playerID].username
        text = sanitize(text).trim()

        // Check some basic anti spam stuff
        if (socket.lastChat && (Date.now() - socket.lastChat) < 500) return
        if (text.length < 1) return

        socket.lastChat = Date.now()
        io.to(roomcode).emit('chat message', username, text)
    })

    socket.on('disconnect', function () {
        if (socket.gameRoom) {
            removePlayer(socket.gameRoom, socket.playerID)
        }
    })
})