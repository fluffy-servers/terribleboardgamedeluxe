import { app, BrowserWindow } from 'electron'

function createWindow(): BrowserWindow {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
    })

    win.setTitle('Terrible Board Game Deluxe Edition [Beta!]')
    win.setMenuBarVisibility(false)
    win.loadURL('https://boardgame.fluffyservers.com') // security stonks
    return win
}

app.whenReady().then(createWindow)