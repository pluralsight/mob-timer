const electron = require('electron')
const { app, ipcMain: ipc } = electron

let windows = require('./windows/windows')
let TimerState = require('./state/timer-state')
let writeState = require('./state/write-state')
let readState = require('./state/read-state')

let timerState = new TimerState()

app.on('ready', () => {
  windows.createTimerWindow()
  timerState.setCallback(onTimerEvent)
  timerState.loadState(readState.read())
})

function onTimerEvent(event, data) {
  windows.dispatchEvent(event, data)
  if (event === 'alert' && data === 30) {
    windows.createFullscreenWindow()
  }
  if (event === 'stopAlerts') {
    windows.closeFullscreenWindow()
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
  windows.showConfigWindow()
  windows.closeFullscreenWindow()
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
    windows.createTimerWindow()
  }
})
