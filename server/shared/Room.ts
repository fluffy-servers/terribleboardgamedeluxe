import { Board } from './Board'
import * as socketio from 'socket.io'

export enum RoomState {
    Menu,
    Lobby,
    Board,
    Game
}

export class Player {
    public id: number = -1
    public username: string
    public socket?: SocketIO.Socket

    public static verifyUsername(username: string): boolean {
        if (username.length > 20 || username.length < 1) {
            return false
        } else {
            return true
        }
    }

    public constructor(username: string) {
        this.username = username
    }

    public setID(id: number) {
        this.id = id
    }
}

interface RoomList {
    [roomcode: string]: Room
}

export class Room {
    public readonly roomcode: string
    public players: any[] = []
    public gamestate: RoomState = RoomState.Lobby
    public board?: Board
    public ownerID: number = 0

    private static MAX_PLAYERS: number = 8
    private static rooms: RoomList = {}

    public static findRoom(roomcode: string) {
        if (this.rooms[roomcode]) {
            return this.rooms[roomcode]
        } else {
            return false
        }
    }

    public static randomString(n: number, base: string = ''): string {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'
        let char = letters[Math.floor(Math.random() * letters.length)]

        if (n <= 1) {
            return base + char
        } else {
            return this.randomString(n - 1, base + char)
        }
    }

    public constructor() {
        let roomcode = Room.randomString(4)
        while (roomcode in Room.rooms) {
            roomcode = Room.randomString(4)
        }

        this.roomcode = roomcode
        Room.rooms[roomcode] = this
    }

    public addPlayer(player: any): number {
        for (let i = 0; i < Room.MAX_PLAYERS; i++) {
            if (!this.players[i]) {
                this.players[i] = player
                return i
            }
        }

        return -1
    }

    public removePlayer(id: number): void {
        this.players[id] = undefined

        // Check that we have at least *some* players still in the room
        // If this room is entirely empty, we can clean it up entirely
        let count = this.players.filter(val => val != undefined).length
        if (count == 0) {
            console.log('Deleting room:', this.roomcode)
            delete Room.rooms[this.roomcode]
        }
    }

    public encodePlayers(): any[] {
        let output = []
        for (let i = 0; i < Room.MAX_PLAYERS; i++) {
            let player = this.players[i]
            if (!player) {
                output.push(undefined)
            } else {
                output.push({ username: player.username })
            }
        }

        return output
    }
}