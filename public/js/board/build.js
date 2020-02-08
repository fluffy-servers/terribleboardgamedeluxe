// Generate the board tiles
function generate_board(boardData) {
    // Add the ground
    const texScale = 24

    let texture = textures['ground']
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(texScale, texScale)

    const material = new THREE.MeshLambertMaterial({ map: texture })
    const geom = new THREE.PlaneGeometry(50, 50)

    let plane = new THREE.Mesh(geom, material)
    plane.rotation.x = -Math.PI / 2
    plane.receiveShadow = true
    scene.add(plane)

    // Generate the tiles
    for (let id in boardData) {
        let tile = boardData[id]
        let texture = textures['tile_' + tile.type]

        let [xx, yy] = translateCoordinate(tile.x, tile.y)

        let t = createTile(texture)
        t.position.x = xx
        t.position.z = yy
    }
}

// Create a tile object on the board
function createTile(texture) {
    const geom = new THREE.CubeGeometry(1, 0.2, 1)
    const base_mat = new THREE.MeshLambertMaterial({ color: "#d1d8e0" })
    const top_mat = new THREE.MeshLambertMaterial({ map: texture })

    let tile = new THREE.Mesh(geom, [base_mat, base_mat, top_mat, base_mat, base_mat, base_mat])
    scene.add(tile)
    tile.position.y = 0.1

    tile.castShadow = true
    tile.receiveShadow = true

    return tile
}

// Setup lighting for the scene
function lighting() {
    const distance = 25
    var sun = new THREE.DirectionalLight(0xffffff, 1)
    sun.position.set(-0.9 * distance, 1 * distance, 0.5 * distance)

    // Shadows for the sun - to do
    sun.castShadow = true
    sun.shadow.camera.left = -distance
    sun.shadow.camera.right = distance
    sun.shadow.camera.top = distance
    sun.shadow.camera.bottom = -distance

    sun.shadow.mapSize.width = 4096
    sun.shadow.mapSize.height = 4096
    scene.add(sun)

    // Ambient hemisphere light
    var hemisphere = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.4)
    scene.add(hemisphere)
}