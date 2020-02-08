const socket = io()

var gameController = {}
gameController.state = 'login'
gameController.chatOpen = false

socket.on('create board', function (boardData) {
    init()
    generate_board(boardData.tileData)
})

socket.on('lobby owner', function () {
    document.getElementById('startbutton').style.display = 'block'
})

socket.on('start game', function () {
    document.getElementById('lobby').style.display = 'none'
})

socket.on('update player positions', function (positions) {
    console.log(positions)
    for (var id in positions) {
        const position = positions[id]
        makeFox(position.x, position.y, id)
    }
})