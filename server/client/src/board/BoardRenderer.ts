// Not to be confused with the Board types file
// This file is used for rendering the Board
import * as THREE from 'three'
import { Scene, Sprite, Camera } from 'three'
import { request } from 'express'
import { Board, Tile } from '../../../shared'
import { GameController } from '../GameController'

interface BoardAssets {
    [name: string]: THREE.Texture
}

export default class BoardRenderer {
    private static assets: BoardAssets = {
        fox0: new THREE.TextureLoader().load("assets/board/sprite/fox_hr0.png"),
        fox1: new THREE.TextureLoader().load("assets/board/sprite/fox_hr1.png"),
        fox2: new THREE.TextureLoader().load("assets/board/sprite/fox_hr2.png"),
        fox3: new THREE.TextureLoader().load("assets/board/sprite/fox_hr3.png"),
        fox4: new THREE.TextureLoader().load("assets/board/sprite/fox_hr4.png"),
        fox5: new THREE.TextureLoader().load("assets/board/sprite/fox_hr5.png"),
        fox6: new THREE.TextureLoader().load("assets/board/sprite/fox_hr6.png"),

        tile_go: new THREE.TextureLoader().load("assets/board/tile/go.png"),
        tile_battle: new THREE.TextureLoader().load("assets/board/tile/battle.png"),
        tile_dollar: new THREE.TextureLoader().load("assets/board/tile/dollar.png"),
        tile_draw: new THREE.TextureLoader().load("assets/board/tile/draw.png"),
        tile_heart: new THREE.TextureLoader().load("assets/board/tile/heart.png"),
        tile_mystery: new THREE.TextureLoader().load("assets/board/tile/mystery.png"),
        tile_shop: new THREE.TextureLoader().load("assets/board/tile/shop.png"),
        tile_star: new THREE.TextureLoader().load("assets/board/tile/star.png"),

        ground: new THREE.TextureLoader().load("assets/board/ground.png")
    }

    private static zoom = 5

    /**
     * Load a single texture and save to the BoardRenderer class
     * @param name Key to store asset as
     * @param path File path to load
     */
    public static loadAsset(name: string, path: string) {
        this.assets[name] = new THREE.TextureLoader().load(path)
    }

    /**
     * Translate a grid coordinate to a THREE.js tile coordinate
     * Tiles have a small gap between them, leading to this offset
     * @param x 'Grid' x coordinate (measured in tiles)
     * @param y 'Grid' y coordinate (measured in tiles)
     */
    public static translateTileCoordinate(x: number, y: number) {
        return [x * 1.25, y * 1.25]
    }

    public scene: THREE.Scene
    public camera: THREE.OrthographicCamera
    public renderer: THREE.WebGLRenderer

    public animations: any[] = []
    public playerSprites: any[] = []

    /**
     * Create the ground plane for the scene
     */
    private createGround(): THREE.Mesh {
        // Set texture scale
        const scale = 24
        const texture = BoardRenderer.assets['ground']
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(scale, scale)

        // Create ground geometry
        const material = new THREE.MeshLambertMaterial({ map: texture })
        const geom = new THREE.PlaneGeometry(50, 50)
        const plane = new THREE.Mesh(geom, material)
        plane.rotation.x = -Math.PI / 2
        plane.receiveShadow = true
        this.scene.add(plane)
        return plane
    }

    /**
     * Create the board tiles from an array
     * @param boardData Array of tiles
     */
    private createBoardFromData(boardData: Tile[]) {
        // Generate the tiles
        for (let id in boardData) {
            const tile = boardData[id]
            const texture = BoardRenderer.assets['tile_' + tile.tileType]

            const [xx, yy] = BoardRenderer.translateTileCoordinate(tile.x, tile.y)

            const t = this.createTile(texture)
            t.position.x = xx
            t.position.z = yy
        }
    }

    /**
     * Create a single tile on the board
     * @param texture Texture for the top face of the tile
     */
    private createTile(texture: THREE.Texture): THREE.Mesh {
        const geom = new THREE.BoxGeometry(1, 0.2, 1)
        const base_mat = new THREE.MeshLambertMaterial({ color: "#d1d8e0" })
        const top_mat = new THREE.MeshLambertMaterial({ map: texture })

        const tile = new THREE.Mesh(geom, [base_mat, base_mat, top_mat, base_mat, base_mat, base_mat])
        tile.position.y = 0.1
        tile.castShadow = true
        tile.receiveShadow = true
        this.scene.add(tile)
        return tile
    }

    /**
     * Create the lighting for a board
     * This has a simple directional shadow light and a hemisphere ambient light
     */
    private createLighting(): void {
        const distance = 25
        const sun = new THREE.DirectionalLight(0xffffff, 1)
        sun.position.set(-0.9 * distance, 1 * distance, 0.5 * distance)

        // Shadows for the sun
        // I have no idea how shadows work so this needs work
        sun.castShadow = true
        sun.shadow.camera.left = -distance
        sun.shadow.camera.right = distance
        sun.shadow.camera.top = distance
        sun.shadow.camera.bottom = -distance
        sun.shadow.mapSize.width = 4096
        sun.shadow.mapSize.height = 4096
        this.scene.add(sun)

        const hemisphere = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.4)
        this.scene.add(hemisphere)
    }

    /**
     * Create a fox sprite on a given tile
     * @param x Tile X coordinate
     * @param y Tile Y coordinate
     * @param id Player ID of the fox
     */
    public makeFox(x: number, y: number, id: number = 0) {
        // Add a fox sprite
        const foxTexture = BoardRenderer.assets['fox' + id]
        const foxMaterial = new THREE.SpriteMaterial({ map: foxTexture })
        const sprite = new THREE.Sprite(foxMaterial)
        this.scene.add(sprite)
        this.playerSprites[id] = sprite

        // Position the fox
        const position = BoardRenderer.translateTileCoordinate(x, y)
        sprite.position.y = 0.6
        sprite.position.x = position[0]
        sprite.position.y = position[1]

        // Update camera
        if (id == GameController.playerID) {
            const zoom = BoardRenderer.zoom
            this.camera.position.set(zoom + sprite.position.x, zoom, zoom + sprite.position.z)
        }
    }

    public foxMovement(id: number = 0, newX: number, newY: number) {
        const sprite = this.playerSprites[id]
        if (!sprite) return

        const position = BoardRenderer.translateTileCoordinate(newX, newY)
        const oldX = sprite.position.x
        const oldY = sprite.position.z
        const jumpStrength = 5
        const camera = this.camera

        function animationCallback(delta) {
            console.log(delta, position)
            const currentX = oldX + (position[0] - oldX) * delta
            const currentY = oldY + (position[1] - oldY) * delta
            const jumpZ = jumpStrength * (0.25 - Math.pow(delta - 0.5, 2))

            sprite.position.x = currentX
            sprite.position.y = 0.6 + jumpZ
            sprite.position.z = currentY

            // Update camera (if applicable)
            if (id == GameController.playerID) {
                const zoom = BoardRenderer.zoom
                camera.position.set(zoom + sprite.position.x, zoom, zoom + sprite.position.z)
            }
        }

        this.animations.push({
            startTime: performance.now(),
            duration: 500,
            callback: animationCallback
        })
    }

    /**
     * Constructor for a BoardRenderer object
     * @param boardData Array of tiles to render on the board
     */
    public constructor(boardData: Tile[]) {
        this.scene = new THREE.Scene()

        // Setup a lovely isometric camera
        const aspect = window.innerWidth / window.innerHeight
        const zoom = BoardRenderer.zoom
        this.camera = new THREE.OrthographicCamera(-zoom * aspect, zoom * aspect, zoom, -zoom, 0.1, 100)
        this.camera.position.set(zoom, zoom, zoom)
        this.camera.lookAt(this.scene.position)

        // Create the renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: (<HTMLCanvasElement>document.getElementById('boardcanvas')) })
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)

        // Add window event listener for resizing
        window.addEventListener('resize', () => { this.resize() }, false)

        // Build the rest of the board
        this.createGround()
        this.createLighting()
        this.createBoardFromData(boardData)
        requestAnimationFrame(this.animate.bind(this))
    }

    /**
     * Update the camera + renderer dimensions on window resize
     */
    public resize() {
        const aspect = window.innerWidth / window.innerHeight
        const zoom = BoardRenderer.zoom

        this.camera.left = -zoom * aspect
        this.camera.right = zoom * aspect
        this.camera.top = zoom
        this.camera.bottom = -zoom
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        console.log(this.scene)
    }

    /**
     * Run an animation step
     * This will process through the animations list
     * @param timestamp Milliseconds since time origin
     */
    public animate(timestamp: DOMHighResTimeStamp) {
        // Handle the pending animations
        // We iterate backwards so we can cleanup without conflicts
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const animation = this.animations[i]
            const animation_delta = Math.min((timestamp - animation.startTime) / animation.duration, 1)
            animation.callback(animation_delta)

            // Remove any completed animations
            if (animation_delta >= 1) {
                this.animations.splice(i, 1)

                if (animation.onFinish) {
                    animation.onFinish()
                }
            }
        }

        // Render loop
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.animate.bind(this))
    }
}