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
  ServiceEvents
}
