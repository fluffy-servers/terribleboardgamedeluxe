import { app, BrowserWindow } from 'electron'
import * as path from 'path'

function createWindow(): BrowserWindow {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false
        }
    })

    win.setTitle('Terrible Board Game Deluxe Edition [Beta!]')
    win.setMenuBarVisibility(false)
    win.loadURL('https://boardgame.fluffyservers.com') // security stonks
    return win
}

app.whenReady().then(createWindow)