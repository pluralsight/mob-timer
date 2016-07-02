const Timer = require('./timer')
const Mobbers = require('./mobbers')

class TimerState {
  constructor(options) {
    this.millisecondsPerSecond = 1000
    this.secondsPerTurn = 600
    this.mobbers = new Mobbers();
    this.Timer = options.Timer || Timer

    this.createTimers()
  }

  setCallback(callback) {
    this.callback = callback
  }

  createTimers() {
    if (this.mainTimer) {
      this.mainTimer.pause()
    }
    this.mainTimer = new this.Timer({countDown: true, time: this.secondsPerTurn, rateMilliseconds: this.millisecondsPerSecond}, secondsRemaining => {
      this.callback('timerChange', secondsRemaining)
      if (secondsRemaining < 0) {
        this.pause()
        this.rotate()
        this.callback('turnEnded')
        this.startAlerts()
      }
    })

    if (this.alertsTimer) {
      this.alertsTimer.pause()
    }
    this.alertsTimer = new this.Timer({countDown: false, rateMilliseconds: this.millisecondsPerSecond}, alertSeconds => {
      this.callback('alert', alertSeconds)
    })
  }

  reset() {
    this.mainTimer.reset(this.secondsPerTurn)
    this.callback('timerChange', this.secondsPerTurn)
  }

  startAlerts() {
    this.alertsTimer.reset(0)
    this.alertsTimer.start()
  }

  stopAlerts() {
    this.alertsTimer.pause()
    this.callback('stopAlerts')
  }

  start() {
    this.mainTimer.start()
    this.callback('started')
    this.stopAlerts()
  }

  pause() {
    this.mainTimer.pause()
    this.callback('paused')
    this.stopAlerts()
  }

  rotate() {
    this.reset()
    this.mobbers.rotate()
    this.callback('rotated', this.mobbers.getCurrentAndNextMobbers())
  }

  initialize() {
    this.rotate()
    this.callback('turnEnded')
  }

  publishConfig() {
    this.callback('configUpdated', {
      mobbers: this.mobbers.getAll(),
      secondsPerTurn: this.secondsPerTurn
    })
    this.callback('rotated', this.mobbers.getCurrentAndNextMobbers())
  }

  addMobber(mobber) {
    this.mobbers.addMobber(mobber)
    this.publishConfig()
    this.callback('rotated', this.mobbers.getCurrentAndNextMobbers())
  }

  removeMobber(mobber) {
    let currentMobber = this.mobbers.getCurrentAndNextMobbers().current
    let isRemovingCurrentMobber = currentMobber ? currentMobber.name == mobber.name : false

    this.mobbers.removeMobber(mobber)

    if (isRemovingCurrentMobber) {
      this.pause()
      this.reset()
      this.callback('turnEnded')
    }

    this.publishConfig()
    this.callback('rotated', this.mobbers.getCurrentAndNextMobbers())
  }

  setSecondsPerTurn(value) {
    this.secondsPerTurn = value
    this.publishConfig()
    this.reset()
  }

  setTestingSpeed(value) {
    this.millisecondsPerSecond = value
    this.createTimers()
  }

  getState() {
    return {
      mobbers: this.mobbers.getAll(),
      secondsPerTurn: this.secondsPerTurn
    }
  }

  loadState(state) {
    if(state.mobbers) {
      for(var i=0;i<state.mobbers.length;i++){
        this.addMobber(state.mobbers[i])
      }
    }

    this.setSecondsPerTurn(state.secondsPerTurn || this.secondsPerTurn)
  }
}

module.exports = TimerState
