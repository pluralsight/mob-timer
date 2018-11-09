const { app, ipcMain: ipc } = require('electron')

const client = require('./client')
const config = require('./service/config')
const { ClientEvents } = require('./common/constants')
const TimerState = require('./service/timer-state')

config.init()
const timerState = new TimerState()

app.on('ready', () => {
  timerState.onEvent(client.dispatchEvent)
  client.setState(timerState.getState())

  client.createTimerWindow()
})

ipc.on(ClientEvents.TimerWindowReady, () => timerState.initialize())
ipc.on(ClientEvents.ConfigWindowReady, () => timerState.persist())
ipc.on(ClientEvents.FullscreenWindowReady, () => timerState.persist())

ipc.on(ClientEvents.Pause, () => timerState.pause())
ipc.on(ClientEvents.Unpause, () => timerState.start())
ipc.on(ClientEvents.Skip, () => timerState.rotate())
ipc.on(ClientEvents.StartTurn, () => timerState.start())
ipc.on(ClientEvents.Configure, () => {
  client.showConfigWindow()
  client.closeFullscreenWindow()
})
ipc.on(ClientEvents.ShuffleMobbers, () => timerState.shuffleMobbers());
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
