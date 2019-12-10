function createTile(texture) {
    var geom = new THREE.CubeGeometry(1, 0.2, 1)
    var base_mat = new THREE.MeshLambertMaterial({color: "#d1d8e0"})
    var top_mat = new THREE.MeshLambertMaterial({map: texture})
    
    var tile = new THREE.Mesh(geom, [base_mat, base_mat, top_mat, base_mat, base_mat, base_mat])
    scene.add(tile)
    tile.position.y = 0.1
    
    tile.castShadow = true
    tile.receiveShadow = true
    
    return tile
}