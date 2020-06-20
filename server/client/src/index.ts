import io from 'socket.io-client';
import * as menu from './menu'
import { GameController } from './GameController'

// Setup the GameController for the menu screen
GameController.socket = io()
menu.bindSocketMenuEvents()