var scene, camera, renderer, starttime
const zoomd = 5

var player_sprites = []
var pending_animations = []

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
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('boardcanvas') })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // Start the rest of the board functions
    lighting()
    animate()
}

function resize() {
    if (!scene) return;

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
    var base_mat = new THREE.MeshLambertMaterial({ color: "#d1d8e0" })
    var top_mat = new THREE.MeshLambertMaterial({ map: texture })

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
    var material = new THREE.MeshLambertMaterial({ color: "#20bf6b" })
    var plane = new THREE.Mesh(geom, material)
    plane.rotation.x = -Math.PI / 2
    plane.receiveShadow = true
    scene.add(plane)

    // Generate the tiles
    for (var id in boardData) {
        var tile = boardData[id]
        var texture = textures['tile_' + tile.type]

        var [xx, yy] = translateCoordinate(tile.x, tile.y)

        var t = createTile(texture)
        t.position.x = xx
        t.position.z = yy
    }
}

function makeFox(x, y, id = 0) {
    // Add a fox sprite
    var foxTexture = textures['fox' + id]
    var foxMaterial = new THREE.SpriteMaterial({ map: foxTexture })
    var sprite = new THREE.Sprite(foxMaterial)
    scene.add(sprite)

    // Position the fox
    var position = translateCoordinate(x, y)
    sprite.position.y = 0.6
    sprite.position.x = position[0] - 0.125
    sprite.position.z = position[1] - 0.125

    // Store the sprite (for moving later)
    player_sprites.push(sprite)
}

function startFoxMovement(sprite, newX, newY) {
    var position = translateCoordinate(newX, newY)
    var oldX = sprite.position.x
    var oldY = sprite.position.z

    const strength = 5

    function animationCallback(delta) {
        var currentX = oldX + (position[0] - oldX) * delta
        var currentY = oldY + (position[1] - oldY) * delta
        var jumpZ = strength * (0.25 - Math.pow(delta - 0.5, 2))

        sprite.position.x = currentX
        sprite.position.y = 0.6 + jumpZ
        sprite.position.z = currentY
    }

    pending_animations.push({
        starttime: performance.now(),
        duration: 500,
        callback: animationCallback
    })
}

function animateFoxMovement(sprite, newX, newY) {
    // Position the fox
    var position = translateCoordinate(newX, newY)
    sprite.position.y = 0.6
    sprite.position.x = position[0] - 0.125
    sprite.position.z = position[1] - 0.125
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
function animate(timestamp) {
    // Iterate animations backward so we can remove wihtout conflicts
    for (var i = pending_animations.length - 1; i >= 0; i--) {
        const animation = pending_animations[i]
        var animation_delta = Math.min((timestamp - animation.starttime) / animation.duration, 1)
        animation.callback(animation_delta)

        // Remove any completed animations
        if (animation_delta >= 1) {
            pending_animations.splice(i, 1)
        }
    }

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}