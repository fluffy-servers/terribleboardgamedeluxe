import { Board } from './Board'

export class Player {

}

export class Room {
    public readonly roomcode: string
    public players: any[] = []
    public gamestate: string = 'lobby'
    public board?: Board
    public ownerID: number = 0

    private static MAX_PLAYERS: number = 8

    public static randomString(n: number, base: string = ''): string {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'
        let char = letters[Math.floor(Math.random() * letters.length)]

        if (n <= 1) {
            return base + char
        } else {
            return this.randomString(n - 1, base + char)
        }
    }

    public constructor(roomcode: string) {
        this.roomcode = roomcode
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