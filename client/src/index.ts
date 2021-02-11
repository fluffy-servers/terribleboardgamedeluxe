import { app, BrowserWindow } from 'electron'
import * as path from 'path'

function createWindow(): BrowserWindow {
    let win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false
        }
    })
    win.setTitle('Terrible Board Game Deluxe Edition [Beta!]')
    win.setMenuBarVisibility(false)

    // Load error if any issues happen with the main page
    win.webContents.on('did-finish-load', () => {
        if (win.title != "Terrible Board Game Deluxe Edition") {
            win.loadFile(path.join(__dirname, 'assets/error.html'))
        }
    })

    win.webContents.on('did-fail-load', () => {
        win.loadFile(path.join(__dirname, 'assets/error.html'))
    })

    // Display a loading screen first of all
    win.loadFile(path.join(__dirname, 'assets/loading.html')).then(() => {
        // Attempt to connect to the boardgame provider
        win.loadURL('https://boardgame.fluffyservers.com')
    })
    return win
}

app.whenReady().then(createWindow)