const { ServiceEvents } = require('../common/constants')
const Mobbers = require('./mobbers')
const Timer = require('./timer')

class TimerState {
  constructor() {
    this.secondsPerTurn = 600
    this.mobbers = new Mobbers()
    this.secondsUntilFullscreen = 30
    this.snapThreshold = 25
    this.alertSound = null
    this.alertSoundTimes = []
    this.timerAlwaysOnTop = true

    this.createTimers()
  }

  setEventHandler(handler) {
    this.handleEvent = handler
  }

  createTimers() {
    this.mainTimer = new Timer({
      countDown: true,
      time: this.secondsPerTurn,
      onTick: secondsRemaining => {
        this.dispatchTimerChange(secondsRemaining)
        if (secondsRemaining < 0) {
          this.pause()
          this.rotate()
          this.handleEvent(ServiceEvents.TurnEnded)
          this.startAlerts()
        }
      }
    })

    this.alertsTimer = new Timer({
      countDown: false,
      onTick: alertSeconds => {
        this.handleEvent(ServiceEvents.Alert, alertSeconds)
      }
    })
  }

  dispatchTimerChange(secondsRemaining) {
    this.handleEvent(ServiceEvents.TimerChange, {
      secondsRemaining,
      secondsPerTurn: this.secondsPerTurn
    })
  }

  reset() {
    this.mainTimer.reset(this.secondsPerTurn)
    this.dispatchTimerChange(this.secondsPerTurn)
  }

  startAlerts() {
    this.alertsTimer.reset(0)
    this.alertsTimer.start()
    this.handleEvent(ServiceEvents.Alert, 0)
  }

  stopAlerts() {
    this.alertsTimer.pause()
    this.handleEvent(ServiceEvents.StopAlerts)
  }

  start() {
    this.mainTimer.start()
    this.handleEvent(ServiceEvents.Started)
    this.stopAlerts()
  }

  pause() {
    this.mainTimer.pause()
    this.handleEvent(ServiceEvents.Paused)
    this.stopAlerts()
  }

  rotate() {
    this.reset()
    this.mobbers.rotate()
    this.handleEvent(ServiceEvents.Rotated, this.mobbers.getCurrentAndNextMobbers())
  }

  initialize() {
    this.rotate()
    this.handleEvent(ServiceEvents.TurnEnded)
    this.publishConfig()
  }

  publishConfig() {
    this.handleEvent(ServiceEvents.ConfigUpdated, this.getState())
    this.handleEvent(ServiceEvents.Rotated, this.mobbers.getCurrentAndNextMobbers())
  }

  addMobber(mobber) {
    this.mobbers.addMobber(mobber)
    this.publishConfig()
    this.handleEvent(ServiceEvents.Rotated, this.mobbers.getCurrentAndNextMobbers())
  }

  removeMobber(id) {
    const currentMobber = this.mobbers.getCurrentAndNextMobbers().current
    const isRemovingCurrentMobber = currentMobber && currentMobber.id === id

    this.mobbers.removeMobber(id)

    if (isRemovingCurrentMobber) {
      this.pause()
      this.reset()
      this.handleEvent(ServiceEvents.TurnEnded)
    }

    this.publishConfig()
    this.handleEvent(ServiceEvents.Rotated, this.mobbers.getCurrentAndNextMobbers())
  }

  updateMobber(mobber) {
    this.mobbers.updateMobber(mobber)
    this.publishConfig()
  }

  setSecondsPerTurn(value) {
    this.secondsPerTurn = value
    this.publishConfig()
    this.reset()
  }

  setSecondsUntilFullscreen(value) {
    this.secondsUntilFullscreen = value
    this.publishConfig()
  }

  setSnapThreshold(value) {
    this.snapThreshold = value
    this.publishConfig()
  }

  setAlertSound(soundFile) {
    this.alertSound = soundFile
    this.publishConfig()
  }

  setAlertSoundTimes(secondsArray) {
    this.alertSoundTimes = secondsArray
    this.publishConfig()
  }

  setTimerAlwaysOnTop(value) {
    this.timerAlwaysOnTop = value
    this.publishConfig()
  }

  getState() {
    return {
      alertSound: this.alertSound,
      alertSoundTimes: this.alertSoundTimes,
      mobbers: this.mobbers.getAll(),
      secondsPerTurn: this.secondsPerTurn,
      secondsUntilFullscreen: this.secondsUntilFullscreen,
      snapThreshold: this.snapThreshold,
      timerAlwaysOnTop: this.timerAlwaysOnTop
    }
  }

  loadState(state) {
    if (state.mobbers) {
      state.mobbers.forEach(x => this.addMobber(x))
    }

    this.setSecondsPerTurn(state.secondsPerTurn || this.secondsPerTurn)
    if (typeof state.secondsUntilFullscreen === 'number') {
      this.setSecondsUntilFullscreen(state.secondsUntilFullscreen)
    }
    if (typeof state.snapThreshold === 'number') {
      this.setSnapThreshold(state.snapThreshold)
    }
    this.alertSound = state.alertSound || null
    this.alertSoundTimes = state.alertSoundTimes || []
    if (typeof state.timerAlwaysOnTop === 'boolean') {
      this.timerAlwaysOnTop = state.timerAlwaysOnTop
    }
  }
}

module.exports = TimerState
