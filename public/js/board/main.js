var scene, camera, renderer
const zoomd = 5

// Initialise the ThreeJS environment
// This creates the scene, camera, and renderer
function init() {
    scene = new THREE.Scene()
    
    // Set up the isometric camera
    var aspect = window.innerWidth / window.innerHeight
    camera = new THREE.OrthographicCamera(-zoomd * aspect, zoomd * aspect, zoomd, -zoomd, 0.1, 100)
    camera.position.set(zoomd, zoomd, zoomd)
    camera.lookAt(scene.position)
    
    // Create the renderer
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById('boardcanvas')})
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    
    // Start the rest of the board functions
    lighting()
    animate()
}

function resize() {
    if(!scene) return;
    
    var aspect = window.innerWidth / window.innerHeight
    camera.left = -zoomd * aspect
    camera.right = zoomd * aspect
    camera.top = zoomd
    camera.bottom = -zoomd
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', resize, false)

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

function translateCoordinate(x, y) {
    var x = x * 1.25
    var y = y * 1.25
    return [x, y]
}

// Generate the board tiles
function generate_board(boardData) {
    // Add the ground
    var geom = new THREE.PlaneGeometry(50, 50)
    var material = new THREE.MeshLambertMaterial({color: "#20bf6b"})
    var plane = new THREE.Mesh(geom, material)
    plane.rotation.x = -Math.PI/2
    plane.receiveShadow = true
    scene.add(plane)
    
    // Generate the tiles
    for(var id in boardData) {
        var tile = boardData[id]
        var texture = textures['tile_' + tile.type] 
        
        var [xx, yy] = translateCoordinate(tile.x, tile.y)
        
        var t = createTile(texture)
        t.position.x = xx
        t.position.z = yy
    }
    
    // Add a fox
    var foxTexture = textures.fox1
    var foxMaterial = new THREE.SpriteMaterial({map: foxTexture})
    var sprite = new THREE.Sprite(foxMaterial)
    scene.add(sprite)
    sprite.position.y = 0.6
    sprite.position.x = (0) - 0.125
    sprite.position.z = (0) - 0.125
}

// Setup lighting for the scene
function lighting() {
    var sun = new THREE.DirectionalLight(0xffffff, 1)
    sun.position.set(-0.9, 1, 0.5)
    scene.add(sun)
    
    // Shadows for the sun - to do
    sun.castShadow = true
    sun.shadow.mapSize.width = 512
    sun.shadow.mapSize.height = 512
    sun.shadow.camera.top = zoomd
    sun.shadow.camera.bottom = zoomd
    sun.shadow.camera.left = zoomd
    sun.shadow.camera.right = zoomd
    
    // Ambient hemisphere light
    var hemisphere = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.4)
    scene.add(hemisphere)
}

// Animation function
// Runs at approximately 60fps
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}