const path = require('path')

const DefaultMobber = {
  name: 'Add a mobber',
  image: path.join(__dirname, '..', 'client', 'img', 'sad-cyclops.png')
}

const ConfigWindowConfig = {
  width: 420,
  height: 500,
  icon: path.join(__dirname, '..', 'client', 'img', 'icon.png'),
  autoHideMenuBar: true
}

const FullscreenWindowConfig = {
  alwaysOnTop: true,
  frame: false,
  resizable: false
}

const TimerWindowConfig = {
  frame: false,
  height: 90,
  icon: path.join(__dirname, '..', 'client', 'img', 'icon.png'),
  resizable: false,
  width: 220
}

const ServiceEvents = {
  Alert: 'alert',
  Paused: 'paused',
  Rotated: 'rotated',
  Started: 'started',
  StateUpdated: 'stateUpdated',
  StopAlerts: 'stopAlerts',
  TimerChange: 'timerChange',
  TurnEnded: 'turnEnded'
}

const ClientEvents = {
  AddMobber: 'addMobber',
  Configure: 'configure',
  ConfigWindowReady: 'configWindowReady',
  FullscreenWindowReady: 'fullscreenWindowReady',
  Pause: 'pause',
  RemoveMobber: 'removeMobber',
  SetAlertSound: 'setAlertSound',
  SetAlertSoundTimes: 'setAlertSoundTimes',
  SetSecondsPerTurn: 'setSecondsPerTurn',
  SetSecondsUntilFullscreen: 'setSecondsUntilFullscreen',
  SetSnapThreshold: 'setSnapThreshold',
  SetTimerAlwaysOnTop: 'setTimerAlwaysOnTop',
  Skip: 'skip',
  StartTurn: 'startTurn',
  TimerWindowReady: 'timerWindowReady',
  Unpause: 'unpause',
  UpdateMobber: 'updateMobber'
}

module.exports = {
  ClientEvents,
  ConfigWindowConfig,
  FullscreenWindowConfig,
  DefaultMobber,
  ServiceEvents,
  TimerWindowConfig
}
