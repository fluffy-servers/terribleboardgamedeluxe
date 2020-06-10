const { app, BrowserWindow } = require('electron')

function createWindow() {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
    })

    win.setTitle('Terrible Board Game Deluxe Edition [Beta!]')
    win.setMenuBarVisibility(false)
    win.loadURL('http://localhost:3000') // security stonks
}

app.whenReady().then(createWindow)