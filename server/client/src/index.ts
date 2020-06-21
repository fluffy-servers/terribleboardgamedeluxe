import io from 'socket.io-client';
import * as menu from './Menu'
import * as chat from './Chat'
import { GameController } from './GameController'
import { Board, RoomState } from '../../shared/dist'
import BoardRenderer from './board/BoardRenderer';

GameController.socket = io()
menu.bindSocketEvents()
chat.bindSocketEvents()

GameController.socket.on('create board', (board: Board) => {
    console.log(board)
    GameController.board = new BoardRenderer(board.tileData)
    console.log(GameController.board.camera)
})

// Send movement commands when arrow keys are pressed
window.addEventListener('keydown', e => {
    console.log(GameController.state, RoomState.Board)
    if (GameController.state != RoomState.Board) return

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
    GameController.socket.emit('board movement', direction)
})

GameController.socket.on('update player positions', function (positions: any[]) {
    for (var id in positions) {
        const position = positions[id]
        GameController.board.makeFox(position.x, position.y, 0)
    }
})

GameController.socket.on('animate fox', function (foxID, x, y, tileType) {
    GameController.board.foxMovement(foxID, x, y)
})