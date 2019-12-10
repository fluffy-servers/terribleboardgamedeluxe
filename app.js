var express = require('express');
var http = require('http');
var socket = require('socket.io');
var sanitize = require('sanitize-html');
var port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socket(server);


server.listen(port, function() {
   console.log('Server started on *:3000'); 
});

app.use(express.static('public'));

const MAX_PLAYERS = 8

var rooms = {
    TEST: {
        roomcode: 'TEST',
        gamestate: 'lobby',
        players: [],
    }
}

function encodeRoomPlayers(players) {
    var output = []
    for(var i=0; i<MAX_PLAYERS; i++) {
        var player = players[i]
        if(!player) {
            output.push(false)
        } else {
            output.push({username: player.username})
        }
    }
    
    return output
}

function addNewPlayer(roomcode, player, update=true) {
    console.log('Adding new player')
    var room = rooms[roomcode]
    for(var i=0; i<MAX_PLAYERS; i++) {
        if(!room.players[i]) {
            room.players[i] = player
            if(update) {
                io.to(roomcode).emit('update players', encodeRoomPlayers(room.players))
            }
            return i
        }
    }
    
    return -1
}

function removePlayer(roomcode, playerid, update=true) {
    var room = rooms[roomcode]
    room.players[playerid] = false
    if(update) {
        io.to(roomcode).emit('update players', encodeRoomPlayers(room.players))
    }
}

io.on('connection', (socket) => {
    socket.on('join game', function(roomcode, username) {
        roomcode = roomcode.toUpperCase()
        username = sanitize(username).trim()
        
        // Ignore logins from people already in rooms
        if(socket.gameRoom) {
            console.log('Discarding login from', username)
            return
        }
        
        console.log(username, 'trying to join room:', roomcode);
        
        // Verify that the game room exists
        if(!rooms[roomcode]) {
            socket.emit('login error', 'Room is invalid')
            return
        }
        var room = rooms[roomcode]
        
        // Don't let people join games that are in progress
        // Might change this later
        if(room.gamestate != 'lobby') {
            socket.emit('login error', 'Room is already in game')
            return
        }
        
        // Verify that the username is valid
        if(username.length > 20 || username.length < 1) {
            socket.emit('login error', 'Username is too long')
            return
        }
        
        // Verify that the username isn't taken
        for(var player of room.players) {
            if(player.username == username) {
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
        if(id < 0) {
            socket.emit('login error', 'Room is full')
            return
        }
        console.log(username, 'assigned to', id)
        
        // Player is successfully in the room!
        socket.gameRoom = roomcode
        socket.playerID = id
        socket.join(roomcode)
        console.log(username, 'has joined room:', roomcode);
        
        socket.emit('joined lobby', roomcode)
        io.to(roomcode).emit('update players', encodeRoomPlayers(room.players))
    })
    
    socket.on('chat message', function(text) {
        if(!socket.gameRoom) return;
        var roomcode = socket.gameRoom
        var username = rooms[roomcode].players[socket.playerID].username
        text = sanitize(text).trim()
        
        // Check some basic anti spam stuff
        if(socket.lastChat && (Date.now() - socket.lastChat) < 500) return;
        if(text.length < 1) return;
        
        socket.lastChat = Date.now()
        io.to(roomcode).emit('chat message', username, text)
    })
    
    socket.on('disconnect', function() {
        if(socket.gameRoom) {
            removePlayer(socket.gameRoom, socket.playerID)
        }
    })
})