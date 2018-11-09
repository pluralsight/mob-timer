const { app, ipcMain: ipc } = require('electron')

const windows = require('./windows')
const config = require('./service/config')
const { ClientEvents } = require('./common/constants')
const state = require('./service/timer-state')

config.init()

const handleReady = () => {
  state.onEvent(windows.dispatchEvent)
  windows.showTimerWindow()
}

app.on('ready', handleReady)
app.on('activate', handleReady)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipc.on(ClientEvents.TimerWindowReady, () => state.publishInitial())
ipc.on(ClientEvents.ConfigWindowReady, () => state.publish())
ipc.on(ClientEvents.FullscreenWindowReady, () => state.publish())

ipc.on(ClientEvents.Pause, () => state.pause())
ipc.on(ClientEvents.Unpause, () => state.start())
ipc.on(ClientEvents.Skip, () => state.rotate())
ipc.on(ClientEvents.StartTurn, () => state.start())

ipc.on(ClientEvents.Configure, () => windows.showConfigWindow())
ipc.on(ClientEvents.AddMobber, (event, mobber) => state.addMobber(mobber))
ipc.on(ClientEvents.RemoveMobber, (event, id) => state.removeMobber(id))
ipc.on(ClientEvents.UpdateMobber, (event, mobber) => state.updateMobber(mobber))
ipc.on(ClientEvents.SetSecondsPerTurn, (event, secondsPerTurn) => state.setSecondsPerTurn(secondsPerTurn))
ipc.on(ClientEvents.SetSecondsUntilFullscreen, (event, secondsUntilFullscreen) => state.setSecondsUntilFullscreen(secondsUntilFullscreen))
ipc.on(ClientEvents.SetSnapThreshold, (event, threshold) => state.setSnapThreshold(threshold))
ipc.on(ClientEvents.SetAlertSoundTimes, (event, alertSoundTimes) => state.setAlertSoundTimes(alertSoundTimes))
ipc.on(ClientEvents.SetAlertSound, (event, alertSound) => state.setAlertSound(alertSound))
ipc.on(ClientEvents.SetTimerAlwaysOnTop, (event, value) => state.setTimerAlwaysOnTop(value))
