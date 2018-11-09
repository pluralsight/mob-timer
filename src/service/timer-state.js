const config = require('./config')
const { ServiceEvents } = require('../common/constants')
const Mobbers = require('./mobbers')
const Timer = require('./timer')

class TimerState {
  constructor() {
    this.loadState()
    this.createTimers()
  }

  loadState() {
    this.state = config.read()

    this.mobbers = new Mobbers()
    this.state.mobbers && this.state.mobbers.forEach(m => this.mobbers.add(m))
  }

  getState() {
    return { ...this.state, mobbers: this.mobbers.getAll() }
  }

  createTimers() {
    this.mainTimer = new Timer({
      countDown: true,
      time: this.state.secondsPerTurn,
      onTick: secondsRemaining => {
        if (secondsRemaining >= 0) {
          this.emitTimerChange(secondsRemaining)
        } else {
          this.pause()
          this.rotate()
          this.emit(ServiceEvents.TurnEnded)
          this.startAlerts()
        }
      }
    })

    this.alertsTimer = new Timer({
      countDown: false,
      onTick: alertSeconds => {
        this.emit(ServiceEvents.Alert, alertSeconds)
      }
    })
  }

  onEvent(eventEmitter) {
    this.emit = eventEmitter
  }

  persist() {
    config.write(this.getState())
    this.publish()
  }

  publish() {
    this.emit(ServiceEvents.StateUpdated, this.getState())
    this.emit(ServiceEvents.Rotated, this.mobbers.getCurrentAndNextMobbers())
  }

  publishInitial() {
    this.reset()
    this.emit(ServiceEvents.TurnEnded)
    this.publish()
  }

  reset() {
    this.mainTimer.reset(this.state.secondsPerTurn)
    this.emitTimerChange(this.state.secondsPerTurn)
  }

  emitTimerChange(secondsRemaining) {
    this.emit(ServiceEvents.TimerChange, { secondsRemaining, secondsPerTurn: this.state.secondsPerTurn })
  }

  startAlerts() {
    this.alertsTimer.reset(0)
    this.alertsTimer.start()
    this.emit(ServiceEvents.Alert, 0)
  }

  stopAlerts() {
    this.alertsTimer.pause()
    this.emit(ServiceEvents.StopAlerts)
  }

  start() {
    this.mainTimer.start()
    this.emit(ServiceEvents.Started)
    this.stopAlerts()
  }

  pause() {
    this.mainTimer.pause()
    this.emit(ServiceEvents.Paused)
    this.stopAlerts()
  }

  rotate() {
    this.reset()
    this.mobbers.rotate()
    this.emit(ServiceEvents.Rotated, this.mobbers.getCurrentAndNextMobbers())
  }

  addMobber(mobber) {
    this.mobbers.add(mobber)
    this.persist()
  }

  removeMobber(id) {
    const currentMobber = this.mobbers.getCurrentAndNextMobbers().current
    const isRemovingCurrentMobber = currentMobber && currentMobber.id === id

    this.mobbers.remove(id)

    if (isRemovingCurrentMobber) {
      this.pause()
      this.reset()
      this.emit(ServiceEvents.TurnEnded)
    }

    this.persist()
  }

  updateMobber(mobber) {
    this.mobbers.update(mobber)
    this.persist()
  }

  setSecondsPerTurn(value) {
    this.state.secondsPerTurn = value
    this.persist()
    this.reset()
  }

  setSecondsUntilFullscreen(value) {
    this.state.secondsUntilFullscreen = value
    this.persist()
  }

  setSnapThreshold(value) {
    this.state.snapThreshold = value
    this.persist()
  }

  setAlertSound(soundFile) {
    this.state.alertSound = soundFile
    this.persist()
  }

  setAlertSoundTimes(secondsArray) {
    this.state.alertSoundTimes = secondsArray
    this.persist()
  }

  setTimerAlwaysOnTop(value) {
    this.state.timerAlwaysOnTop = value
    this.persist()
  }
}

module.exports = new TimerState()
