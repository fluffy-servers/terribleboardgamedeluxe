var scene, camera, renderer, starttime
const zoomd = 5

var player_sprites = {}
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

// Resize handler to keep the board steady
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

// Translate a grid coordinate to a world space coordinate
// Tiles are spaced about 1.25 units apart
function translateCoordinate(x, y) {
    var x = x * 1.25
    var y = y * 1.25
    return [x, y]
}

// Create a fox on a given grid tile
function makeFox(x, y, id = 0) {
    // Add a fox sprite
    var foxTexture = textures['fox' + id]
    var foxMaterial = new THREE.SpriteMaterial({ map: foxTexture })
    var sprite = new THREE.Sprite(foxMaterial)
    scene.add(sprite)

    // Position the fox
    var position = translateCoordinate(x, y)
    sprite.position.y = 0.6
    sprite.position.x = position[0] //- 0.125
    sprite.position.z = position[1] //- 0.125

    // Store the sprite (for moving later)
    player_sprites[id] = sprite

    // Update camera
    if (id == gameController.playerID) {
        camera.position.set(zoomd + sprite.position.x, zoomd, zoomd + sprite.position.z)
    }
}

// Generate an animation object for a fox
function startFoxMovement(id = 0, newX, newY) {
    let sprite = player_sprites[id]
    if (!sprite) return

    const position = translateCoordinate(newX, newY)
    const oldX = sprite.position.x
    const oldY = sprite.position.z

    const jumpStrength = 5

    function animationCallback(delta) {
        const currentX = oldX + (position[0] - oldX) * delta
        const currentY = oldY + (position[1] - oldY) * delta
        const jumpZ = jumpStrength * (0.25 - Math.pow(delta - 0.5, 2))

        sprite.position.x = currentX
        sprite.position.y = 0.6 + jumpZ
        sprite.position.z = currentY

        // Update camera
        if (id == gameController.playerID) {
            camera.position.set(zoomd + sprite.position.x, zoomd, zoomd + sprite.position.z)
        }
    }

    pending_animations.push({
        startTime: performance.now(),
        duration: 500,
        callback: animationCallback
    })
}

// Animation function
// Runs at approximately 60fps
function animate(timestamp) {
    // Iterate animations backward so we can remove wihtout conflicts
    for (var i = pending_animations.length - 1; i >= 0; i--) {
        const animation = pending_animations[i]
        var animation_delta = Math.min((timestamp - animation.startTime) / animation.duration, 1)
        animation.callback(animation_delta)

        // Remove any completed animations
        if (animation_delta >= 1) {
            pending_animations.splice(i, 1)

            // Run finishing function (if applicale)
            if (animation.onFinish) {
                animation.onFinish()
            }
        }
    }

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}