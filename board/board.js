function Board() {
    this.tileData = {}
    this.adjList = {}
}

Board.prototype.addTile = function(id) {
    this.adjList[id] = []
}

Board.prototype.addEdge = function(id1, id2) {
    if(!id2) return;
    
    this.adjList[id1].push(id2)
}

Board.prototype.fromArray = function(array) {
    // Create a simple 2D grid
    // This helps
    var grid = []
    var size = 10
    for(var i=0; i<size; i++) {
        grid[i] = []
    }
    
    // Coordinates stack to save iterating over the entire 2D grid
    var coordinates = []
    
    for(var id in array) {
        var t = array[id]
        var x = t[0]
        var y = t[1]
        
        // Register tile data in object
        this.addTile(id)
        this.tileData[id] = {x: x, y: y}
        
        // Add to grid for checking later
        coordinates.push([x, y])
        grid[x][y] = id
    }
    
    // Check the connected tiles for each coordinate
    while(coord = coordinates.pop()) {
        var xx = coord[0]
        var yy = coord[1]
        
        // For some reason without this these variables hang around
        var tUp = undefined
        var tDown = undefined
        var tLeft = undefined
        var tRight = undefined
        
        // Find any tiles connected to this tile
        // Careful not to check negative indexes!
        var tile = grid[xx][yy]
        if(xx > 0) tLeft = grid[xx-1][yy]
        if(yy > 0) tUp = grid[xx][yy-1]
        tRight = grid[xx+1][yy]
        tDown = grid[xx][yy+1]
        
        // Add any found tiles as edges
        this.addEdge(tile, tUp)
        this.addEdge(tile, tDown)
        this.addEdge(tile, tLeft)
        this.addEdge(tile, tRight)
    }
}

Board.prototype.shuffleTileTypes = function() {
    for(var i in this.tileData) {
        var tile = this.tileData[i]
        if(Math.random() > 0.8) {
            // Choose a special tile
            var options = ['battle', 'draw', 'shop']
            tile.type = options[Math.floor(Math.random() * options.length)]
        } else {
            // Choose a standard tile
            var options = ['dollar', 'heart', 'mystery', 'star']
            tile.type = options[Math.floor(Math.random() * options.length)]
        }
    }
}

module.exports = Board