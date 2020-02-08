// Send movement commands when arrow keys are pressed
window.addEventListener('keydown', e => {
    if (gameController.state != 'board') return

    e = e || window.event
    let direction
    switch (e.keyCode) {
        case 37:
            direction = [-1, 0]
            break
        case 38:
            direction = [0, -1]
            break
        case 39:
            direction = [1, 0]
            break
        case 40:
            direction = [0, 1]
            break

        default:
            return
    }

    e.preventDefault()
    socket.emit('movement test', direction)
})

socket.on('animate fox', function (foxID, x, y, tileType) {
    startFoxMovement(foxID, x, y)
})