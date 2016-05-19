const electron = require('electron')
const { app, ipcMain: ipc } = electron

let timerWindow, configWindow
let timerState = require('./timer-state')

app.on('ready', () => {
  createTimerWindow()
  timerState.setCallback(onTimerEvent)
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
  timerWindow.on('closed', _ => timerWindow = null)
}

function showConfigWindow() {
  if (configWindow) {
    configWindow.show();
    return;
  }
  createConfigWindow();
}

function createConfigWindow() {
  configWindow = new electron.BrowserWindow({
    width: 800,
    height: 600
  });

  configWindow.loadURL(`file://${__dirname}/config/index.html`)
  configWindow.on('closed', _ => configWindow = null)
}

function onTimerEvent(event, data) {
  if (timerWindow) {
    timerWindow.webContents.send(event, data)
  }
  if (configWindow) {
    configWindow.webContents.send(event, data)
  }
}

ipc.on('timerWindowReady', _ => timerState.initialize())
ipc.on('configWindowReady', _ => timerState.publishConfig())

ipc.on('pause', _ => timerState.pause())
ipc.on('unpause', _ => timerState.start())
ipc.on('skip', _ => timerState.rotate())
ipc.on('startTurn', _ => timerState.start())
ipc.on('configure', _ => showConfigWindow())
ipc.on('addMobber', (event, mobber) => timerState.addMobber(mobber))

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (timerWindow === null) {
    createTimerWindow()
  }
})
