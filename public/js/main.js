const socket = io()

var gameController = {}
gameController.state = 'login'
gameController.chatOpen = false

function hideBackground() {
    document.getElementById('background').style.display = "none"
}

socket.on('create board', function (boardData) {
    init()
    generate_board(boardData.tileData)
})

socket.on('lobby owner', function () {
    document.getElementById('startbutton').style.display = 'block'
})

socket.on('start game', function () {
    document.getElementById('lobby').style.display = 'none'
    gameController.state = 'board'
    hideBackground()
})

socket.on('update player positions', function (positions) {
    for (var id in positions) {
        const position = positions[id]
        makeFox(position.x, position.y, id)
    }
})