const electron = require('electron')
const { app, ipcMain: ipc } = electron

let timerWindow
let timerState = require('./timer-state')

app.on('ready', () => {
  createTimerWindow()
  timerState.setCallback(onTimerEvent)
  timerState.reset()
  timerState.start()
})

function createTimerWindow() {
  timerWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    //resizable: false,
    //alwaysOnTop: true,
    //frame: false
  });

  timerWindow.loadURL(`file://${__dirname}/timer/index.html`)
}

function onTimerEvent(event, data) {
  timerWindow.webContents.send(event, data)
}

ipc.on('pause', _ => {
  console.log('paused')
  timerState.pause()
})
