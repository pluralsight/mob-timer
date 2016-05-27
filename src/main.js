const electron = require('electron')
const { app, ipcMain: ipc } = electron

let timerWindow, configWindow, fullscreenWindow
let timerState = require('./timer-state')

let writeState = require('./write-state')

app.on('ready', () => {
  createTimerWindow()
  timerState.setCallback(onTimerEvent)
})

function createTimerWindow() {
  let {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  timerWindow = new electron.BrowserWindow({
    x: width - 200,
    y: height - 100,
    width: 200,
    height: 100,
    resizable: false,
    alwaysOnTop: true,
    frame: false
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
    width: 380,
    height: 500,
    autoHideMenuBar: true
  });

  configWindow.loadURL(`file://${__dirname}/config/index.html`)
  configWindow.on('closed', _ => configWindow = null)
}

function createFullscreenWindow() {
  let {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  fullscreenWindow = new electron.BrowserWindow({
    width,
    height,
    resizable: false,
    alwaysOnTop: true,
    frame: false
  });

  fullscreenWindow.loadURL(`file://${__dirname}/fullscreen/index.html`)
  fullscreenWindow.on('closed', _ => fullscreenWindow = null)
}

function closeFullscreenWindow() {
  if (fullscreenWindow) {
    fullscreenWindow.close()
  }
}

function onTimerEvent(event, data) {
  if (timerWindow) {
    timerWindow.webContents.send(event, data)
  }
  if (configWindow) {
    configWindow.webContents.send(event, data)
  }
  if (fullscreenWindow) {
    fullscreenWindow.webContents.send(event, data)
  }
  if (event === 'alert' && data === 30) {
    createFullscreenWindow()
  }
  if (event === 'stopAlerts') {
    closeFullscreenWindow()
  }
  if(event === 'configUpdated') {
    writeState.write(timerState.getState())
  }
}

ipc.on('timerWindowReady', _ => timerState.initialize())
ipc.on('configWindowReady', _ => timerState.publishConfig())
ipc.on('fullscreenWindowReady', _ => timerState.publishConfig())

ipc.on('pause', _ => timerState.pause())
ipc.on('unpause', _ => timerState.start())
ipc.on('skip', _ => timerState.rotate())
ipc.on('startTurn', _ => timerState.start())
ipc.on('configure', _ => {
  showConfigWindow()
  closeFullscreenWindow()
})
ipc.on('addMobber', (event, mobber) => timerState.addMobber(mobber))
ipc.on('removeMobber', (event, mobber) => timerState.removeMobber(mobber))
ipc.on('setSecondsPerTurn', (event, secondsPerTurn) => timerState.setSecondsPerTurn(secondsPerTurn))

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
