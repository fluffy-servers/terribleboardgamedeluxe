// Show the join room form
function joinRoomScreen() {
    document.getElementById('mainroom').style.display = 'none'
    document.getElementById('joinroom').style.display = 'block'
}

// Show the create a room form
function createRoomScreen() {
    document.getElementById('mainroom').style.display = 'none'
    document.getElementById('createroom').style.display = 'block'
}

// Show the main menu
function mainRoomScreen() {
    document.getElementById('createroom').style.display = 'none'
    document.getElementById('joinroom').style.display = 'none'
    document.getElementById('mainroom').style.display = 'block'
}

// Show the lobby
function lobbyScreen() {
    document.getElementById('createroom').style.display = 'none'
    document.getElementById('joinroom').style.display = 'none'
    document.getElementById('mainroom').style.display = 'none'
    document.getElementById('lobby').style.display = 'block'
}

// Attempt to join an existing room
function attemptLogin() {
    var roomcode = document.getElementById('join-roomcode').value
    var username = document.getElementById('join-username').value
    socket.emit('join game', roomcode, username)
}

// Attempt to create a new room
function attemptCreate() {
    var username = document.getElementById('create-username').value
    socket.emit('create game', username)
}

// Attempt to start the game
function attemptStart() {
    socket.emit('start game')
}

// Build the list of players displayed in the lobby
function lobbyPlayersList(players) {
    var list = document.getElementById('lobby-players-list')
    list.innerHTML = ''

    // Create a row in the list for each player
    for (var id in players) {
        var player = players[id]
        if (!player) continue

        var item = document.createElement('li')
        var avatar = document.createElement('img')
        avatar.src = 'assets/board/sprite/fox_hr' + id + '.png'

        var text = document.createElement('span')
        text.innerHTML = player.username

        item.appendChild(avatar)
        item.appendChild(text)
        list.appendChild(item)
    }
}

// Display login errors
socket.on('login error', function (text) {
    var msg = document.getElementById('loginmessage-join')
    msg.innerHTML = text
    msg.classList.add('loginerror')
})

// Handle successful joins
socket.on('joined lobby', function (roomcode, id) {
    console.log('Connected to room:', roomcode)
    gameController.roomcode = roomcode
    gameController.state = 'lobby'
    gameController.playerID = id
    lobbyScreen()

    document.getElementById('lobby-roomcode').innerHTML = roomcode
})

// Update the list of lobby players
socket.on('update players', function (players) {
    if (gameController.state == 'lobby') {
        lobbyPlayersList(players)
    }
})

// Join game on username enter
document.getElementById('join-username').addEventListener('keyup', function (e) {
    if (gameController.state == 'login' && e.keyCode == 13) {
        e.preventDefault()
        attemptLogin()
    }
})

// Create room on username enter
document.getElementById('create-username').addEventListener('keyup', function (e) {
    if (gameController.state == 'login' && e.keyCode == 13) {
        e.preventDefault()
        attemptCreate()
    }
})