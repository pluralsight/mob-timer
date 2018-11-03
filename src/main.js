const electron = require('electron')
const { app, ipcMain: ipc } = electron

let windows = require('./windows/windows')
let TimerState = require('./state/timer-state')
let writeState = require('./state/write-state')
let readState = require('./state/read-state')

let timerState = new TimerState()

app.on('ready', () => {
  timerState.setCallback(onTimerEvent)
  timerState.loadState(readState.read())
  windows.setConfigState(timerState.getState())
  windows.createTimerWindow()
})

function onTimerEvent(event, data) {
  windows.dispatchEvent(event, data)
  if (event === 'configUpdated') {
    writeState.write(timerState.getState())
  }
}

ipc.on('timerWindowReady', () => timerState.initialize())
ipc.on('configWindowReady', () => timerState.publishConfig())
ipc.on('fullscreenWindowReady', () => timerState.publishConfig())

ipc.on('pause', () => timerState.pause())
ipc.on('unpause', () => timerState.start())
ipc.on('skip', () => timerState.rotate())
ipc.on('startTurn', () => timerState.start())
ipc.on('configure', () => {
  windows.showConfigWindow()
  windows.closeFullscreenWindow()
})
ipc.on('addMobber', (event, mobber) => timerState.addMobber(mobber))
ipc.on('removeMobber', (event, mobber) => timerState.removeMobber(mobber))
ipc.on('updateMobber', (event, mobber) => timerState.updateMobber(mobber))
ipc.on('setSecondsPerTurn', (event, secondsPerTurn) => timerState.setSecondsPerTurn(secondsPerTurn))
ipc.on('setSecondsUntilFullscreen', (event, secondsUntilFullscreen) => timerState.setSecondsUntilFullscreen(secondsUntilFullscreen))
ipc.on('setSnapThreshold', (event, threshold) => timerState.setSnapThreshold(threshold))
ipc.on('setAlertSoundTimes', (event, alertSoundTimes) => timerState.setAlertSoundTimes(alertSoundTimes))
ipc.on('setAlertSound', (event, alertSound) => timerState.setAlertSound(alertSound))
ipc.on('setTimerAlwaysOnTop', (event, value) => timerState.setTimerAlwaysOnTop(value))

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  windows.createTimerWindow()
})
