export enum TileTypes {
    Battle,
    Draw,
    Shop,
    Dollar,
    Heart,
    Mystery,
    Star
}

export class Tile {
    public readonly x: number
    public readonly y: number
    public tileType?: string

    public constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export class Board {
    public tileData: Tile[] = []
    public adjList: any[] = []
    public players: any[] = []
    public tileGrid: number[][] = []

    public static createBoard(array: any[]): Board {
        const b = new Board()
        b.fromArray(array)
        b.shuffleTileTypes()
        return b
    }

    public constructor() {
        // ain't nobody here but us potatoes
        // you'll probably want to use fromArray to make a board
        // also see the createBoard static method
    }

    public addTile(id: number, tile: Tile): void {
        this.adjList[id] = []
        this.tileData[id] = tile
    }

    public addEdge(id1: number, id2: number): void {
        if (!id2) return
        this.adjList[id1].push(id2)
    }

    public fromArray(array: any[]): void {
        // Create a simple 2D grid structure
        // This helps later
        const size = 100
        let grid: any[][] = []
        for (var i = 0; i < size; i++) {
            grid[i] = []
        }

        // Coordinates stack (save iterations)
        let coordinates = [] as any

        array.forEach((tile, id) => {
            const x = tile[0]
            const y = tile[1]

            this.addTile(id, { x: x, y: y })

            grid[x][y] = id
            coordinates.push([x, y])
        })

        let coord
        while (coord = coordinates.pop()) {
            const xx = coord[0]
            const yy = coord[1]

            const tile = grid[xx][yy]
            const tLeft = xx > 0 ? grid[xx - 1][yy] : undefined
            const tUp = yy > 0 ? grid[xx][yy - 1] : undefined
            const tRight = grid[xx + 1][yy]
            const tDown = grid[xx][yy + 1]

            // Add any found tiles as edges
            this.addEdge(tile, tUp)
            this.addEdge(tile, tDown)
            this.addEdge(tile, tLeft)
            this.addEdge(tile, tRight)
        }
        this.tileGrid = grid
    }

    public shuffleTileTypes(): void {
        for (let i in this.tileData) {
            const tile = this.tileData[i]
            if (Math.random() > 0.8) {
                const options = ['battle', 'draw', 'shop']
                tile.tileType = options[Math.floor(Math.random() * options.length)]
            } else {
                const options = ['dollar', 'heart', 'mystery', 'star']
                tile.tileType = options[Math.floor(Math.random() * options.length)]
            }
        }
    }

    public getRandomTile(): Tile {
        let id = Math.floor(this.tileData.length * Math.random())
        while (this.tileData[id] == undefined) {
            id = Math.floor(this.tileData.length * Math.random())
        }
        return this.tileData[id]
    }

    public checkTileEmpty(x: number, y: number): boolean {
        for (let id in this.players) {
            let position = this.players[id]
            if (position.x == x && position.y == y) {
                return false
            }
        }

        return true
    }

    /**
     * Get a random empty tile
     */
    public getRandomEmptyTile(): Tile {
        let tile = this.getRandomTile()
        while (!this.checkTileEmpty(tile.x, tile.y)) {
            tile = this.getRandomTile()
        }

        return tile
    }

    /**
     * Update the location of a given player on the board
     * This does not check if the player will be on a tile!
     * @param id Player ID to update
     * @param x New X coordinate
     * @param y New Y coordinate
     */
    public updatePlayer(id: number, x: number, y: number): void {
        this.players[id] = { x: x, y: y }
    }

    /**
     * Remove a given player from the board
     * @param id Player ID to remove
     */
    public removePlayer(id: number): void {
        this.players[id] = undefined
    }

    /**
     * Check if a link exists between two coordinate pairs
     * If a link exists, this will return the tile for the second position
     * If not, this will return undefined
     * @param x1 X coordinate of first tile
     * @param y1 Y coordinate of first tile
     * @param x2 X coordinate of second tile
     * @param y2 Y coordinate of second tile
     */
    public checkLink(x1: number, y1: number, x2: number, y2: number): boolean {
        const curTile = this.tileGrid[x1][y1]
        for (let link of this.adjList[curTile]) {
            const checkTile = this.tileData[link]
            if (checkTile.x == x2 && checkTile.y == y2) {
                return true
            }
        }

        return false
    }

    /**
     * Get tile data for a tile at a given position
     * @param x X coordinate
     * @param y Y coordinate
     */
    public getTile(x: number, y: number): Tile {
        const id = this.tileGrid[x][y]
        return this.tileData[id]
    }
}