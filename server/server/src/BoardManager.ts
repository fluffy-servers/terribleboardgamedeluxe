import * as fs from 'fs'
import { Board } from '../../shared/dist'

export class BoardManager {
    private static boardData: any = {}

    public static loadBoardData() {
        this.boardData = {}
        for (const filename of fs.readdirSync('./boards/')) {
            fs.readFile('./boards/' + filename, (err, content) => {
                if (err) {
                    console.error(err)
                    return
                } else {
                    const name = filename.replace('.json', '')
                    const board = JSON.parse(content.toString())
                    this.boardData[name] = board
                }
            })
        }
    }

    public static getBoardNames() {
        return Object.keys(this.boardData)
    }

    public static createBoard(nameRequest: string = 'Random') {
        let name
        if (nameRequest == 'Random') {
            const boardNames = Object.keys(this.boardData)
            name = boardNames[boardNames.length * Math.random() << 0]
        } else {
            name = nameRequest
        }

        return Board.createBoard(this.boardData[name])
    }
}