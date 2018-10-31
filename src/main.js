const { app, ipcMain: ipc } = require('electron')

const client = require('./client')
const config = require('./service/config')
const { ClientEvents, ServiceEvents } = require('./common/constants')
const TimerState = require('./service/timer-state')

config.init()
const timerState = new TimerState()

app.on('ready', () => {
  timerState.setEventHandler(onTimerEvent)
  timerState.loadState(config.read())
  client.setConfigState(config.read())
  client.createTimerWindow()
})

const onTimerEvent = (event, data) => {
  client.dispatchEvent(event, data)
  if (event === ServiceEvents.ConfigUpdated) {
    config.write(data)
  }
}

ipc.on(ClientEvents.TimerWindowReady, _ => timerState.initialize())
ipc.on(ClientEvents.ConfigWindowReady, _ => timerState.publishConfig())
ipc.on(ClientEvents.FullscreenWindowReady, _ => timerState.publishConfig())

ipc.on(ClientEvents.Pause, _ => timerState.pause())
ipc.on(ClientEvents.Unpause, _ => timerState.start())
ipc.on(ClientEvents.Skip, _ => timerState.rotate())
ipc.on(ClientEvents.StartTurn, _ => timerState.start())
ipc.on(ClientEvents.Configure, _ => {
  client.showConfigWindow()
  client.closeFullscreenWindow()
})
ipc.on(ClientEvents.AddMobber, (event, mobber) => timerState.addMobber(mobber))
ipc.on(ClientEvents.RemoveMobber, (event, id) => timerState.removeMobber(id))
ipc.on(ClientEvents.UpdateMobber, (event, mobber) => timerState.updateMobber(mobber))
ipc.on(ClientEvents.SetSecondsPerTurn, (event, secondsPerTurn) => timerState.setSecondsPerTurn(secondsPerTurn))
ipc.on(ClientEvents.SetSecondsUntilFullscreen, (event, secondsUntilFullscreen) => timerState.setSecondsUntilFullscreen(secondsUntilFullscreen))
ipc.on(ClientEvents.SetSnapThreshold, (event, threshold) => timerState.setSnapThreshold(threshold))
ipc.on(ClientEvents.SetAlertSoundTimes, (event, alertSoundTimes) => timerState.setAlertSoundTimes(alertSoundTimes))
ipc.on(ClientEvents.SetAlertSound, (event, alertSound) => timerState.setAlertSound(alertSound))
ipc.on(ClientEvents.SetTimerAlwaysOnTop, (event, value) => timerState.setTimerAlwaysOnTop(value))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  client.createTimerWindow()
})
