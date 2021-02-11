// This file should provide linking to the client bridge functions
// See preload.ts in the electron client project
// If the window bridge does not exist (i.e. in browser), these functions will do nothing

export function startDiscord() {
    const bridge = (window as any).bridge
    if (bridge) {
        bridge.start()
    }
}

export function onJoin(callback: Function) {
    const bridge = (window as any).bridge
    if (bridge) {
        bridge.onJoin(callback)
        console.log('Bridge - on join successful')
    }
}

export function joinLobby(roomcode: string, players: number, maxsize: number) {
    const bridge = (window as any).bridge
    if (bridge) {
        bridge.joinLobby(roomcode, players, maxsize)
    }
}

export function updateJoinSecret(roomcode: string, salt: string) {
    const bridge = (window as any).bridge
    if (bridge) {
        bridge.updateJoinSecret(roomcode, salt)
    }
}

export function updatePlayers(players: number, maxsize: number) {
    const bridge = (window as any).bridge
    if (bridge) {
        bridge.updatePlayers(players, maxsize)
    }
}

export function onBoard() {
    const bridge = (window as any).bridge
    if (bridge) {
        bridge.onBoard()
    }
}