import io from 'socket.io-client';
import * as menu from './Menu'
import * as chat from './Chat'
import { GameController } from './GameController'
import { Board } from '../../shared/dist'

GameController.socket = io()
menu.bindSocketEvents()
chat.bindSocketEvents()

GameController.socket.on('create board', (board: Board) => {
    console.log(board)
    console.log(board.tileData[0].tileType)
})