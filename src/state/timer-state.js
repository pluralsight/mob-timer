const Timer = require('./timer')
const Mobbers = require('./mobbers')
const clipboard = require('../clipboard')

class TimerState {
  constructor(options) {
    if (!options) {
      options = {}
    }
    this.secondsPerTurn = 900
    this.mobbers = new Mobbers()
    this.secondsUntilFullscreen = 90
    this.snapThreshold = 25
    this.alertSound = null
    this.alertSoundTimes = []
    this.timerAlwaysOnTop = true
    this.shuffleMobbersOnStartup = false
    this.clearClipboardHistoryOnTurnEnd = false
    this.numberOfItemsClipboardHistoryStores = 25

    this.currentMobber = 0
    this.secondsRemaining = this.secondsPerTurn
    this.createTimers(options.Timer || Timer)
  }

  setCallback(callback) {
    this.callback = callback
  }

  createTimers(TimerClass) {
    console.log('Timer state createTimers.')
    this.mainTimer = new TimerClass({ countDown: true, time: this.secondsPerTurn }, secondsRemaining => {
      this.dispatchTimerChange(secondsRemaining)
      if (secondsRemaining < 0) {
        console.log('seconds remaining < 0')
        this.pause()
        this.rotate()
        this.callback('turnEnded')
        this.startAlerts()

        if (this.clearClipboardHistoryOnTurnEnd) {
          clipboard.clearClipboardHistory(this.numberOfItemsClipboardHistoryStores)
        }
      }
    })

    this.alertsTimer = new TimerClass({ countDown: false }, alertSeconds => {
      this.callback('alert', alertSeconds)
    })
  }

  dispatchTimerChange(secondsRemaining) {
    this.secondsRemaining = secondsRemaining
    this.callback('timerChange', {
      secondsRemaining,
      timeRemaining: this.getTimeRemaining(secondsRemaining),
      secondsPerTurn: this.secondsPerTurn
    })
  }

  reset() {
    console.log('Timer state reset.')
    this.mainTimer.reset(this.secondsPerTurn)
    this.dispatchTimerChange(this.secondsPerTurn)
  }

  startAlerts() {
    this.alertsTimer.reset(0)
    this.alertsTimer.start()
    this.callback('alert', 0)
  }

  stopAlerts() {
    this.alertsTimer.pause()
    this.callback('stopAlerts')
  }

  start() {
    console.log('Timer state start.')
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
    console.log('Timer state rotate.')
    this.reset()
    this.mobbers.rotate()
    this.currentMobber = this.mobbers.currentMobber
    this.callback('rotated', this.mobbers.getCurrentAndNextMobbers())
  }

  initialize() {
    console.log('Timer state initialize.')
    let data = this.mobbers.getCurrentAndNextMobbers()
    data.timeRemaining = this.getTimeRemaining(this.secondsRemaining)
    this.callback('initialized', data)
    const isTimerRunning = this.secondsRemaining < this.secondsPerTurn
    if (isTimerRunning) {
      console.log('started')
      this.callback('started')
    }
  }

  publishConfig() {
    console.log('Timer state publishConfig.')
    this.reset()
    this.initialize()
    this.callback('configUpdated', this.getState())
    this.callback('rotated', this.mobbers.getCurrentAndNextMobbers())
  }

  addMobber(mobber) {
    this.mobbers.addMobber(mobber)
    this.publishConfig()
  }

  removeMobber(mobber) {
    let currentMobber = this.mobbers.getCurrentAndNextMobbers().current
    let isRemovingCurrentMobber = currentMobber ? currentMobber.name === mobber.name : false

    this.mobbers.removeMobber(mobber)

    if (isRemovingCurrentMobber) {
      this.pause()
      this.reset()
      this.callback('turnEnded')
    }

    this.publishConfig()
  }

  updateMobber(mobber) {
    const currentMobber = this.mobbers.getCurrentAndNextMobbers().current
    const disablingCurrentMobber = (currentMobber.id === mobber.id && mobber.disabled)

    this.mobbers.updateMobber(mobber)

    if (disablingCurrentMobber) {
      this.pause()
      this.reset()
      this.callback('turnEnded')
    }

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

  setShuffleMobbersOnStartup(value) {
    this.shuffleMobbersOnStartup = value
    this.publishConfig()
  }

  shuffleMobbers() {
    this.mobbers.shuffleMobbers()
    this.publishConfig()
  }

  setClearClipboardHistoryOnTurnEnd(value) {
    this.clearClipboardHistoryOnTurnEnd = value
    this.publishConfig()
  }

  setNumberOfItemsClipboardHistoryStores(value) {
    this.numberOfItemsClipboardHistoryStores = value
    this.publishConfig()
  }

  getState() {
    console.log('Timer state getState.')
    return {
      mobbers: this.mobbers.getAll(),
      secondsPerTurn: this.secondsPerTurn,
      secondsUntilFullscreen: this.secondsUntilFullscreen,
      snapThreshold: this.snapThreshold,
      alertSound: this.alertSound,
      alertSoundTimes: this.alertSoundTimes,
      timerAlwaysOnTop: this.timerAlwaysOnTop,
      shuffleMobbersOnStartup: this.shuffleMobbersOnStartup,
      clearClipboardHistoryOnTurnEnd: this.clearClipboardHistoryOnTurnEnd,
      numberOfItemsClipboardHistoryStores: this.numberOfItemsClipboardHistoryStores,
      currentMobber: this.currentMobber,
      secondsRemaining: this.secondsRemaining
    }
  }

  loadState(state) {
    console.log('Load state.')
    if (state.mobbers) {
      console.log('Number of mobbers: ' + state.mobbers.length)
      state.mobbers.forEach(x => this.mobbers.addMobber(x))
    }

    this.secondsPerTurn = state.secondsPerTurn || this.secondsPerTurn
    if (typeof state.secondsUntilFullscreen === 'number') {
      this.secondsUntilFullscreen = state.secondsUntilFullscreen
    }
    if (typeof state.snapThreshold === 'number') {
      this.snapThreshold = state.snapThreshold
    }
    this.alertSound = state.alertSound || null
    this.alertSoundTimes = state.alertSoundTimes || []
    if (typeof state.timerAlwaysOnTop === 'boolean') {
      this.timerAlwaysOnTop = state.timerAlwaysOnTop
    }
    this.shuffleMobbersOnStartup = !!state.shuffleMobbersOnStartup
    this.clearClipboardHistoryOnTurnEnd = !!state.clearClipboardHistoryOnTurnEnd
    this.numberOfItemsClipboardHistoryStores = Math.floor(state.numberOfItemsClipboardHistoryStores) > 0 ? Math.floor(state.numberOfItemsClipboardHistoryStores) : 1

    if (typeof state.currentMobber === 'number') {
      this.currentMobber = state.currentMobber
      this.mobbers.currentMobber = state.currentMobber
    }

    if (typeof state.secondsRemaining === 'number') {
      this.secondsRemaining = state.secondsRemaining
    }
  }

  getTimeRemaining(secondsRemaining) {
    let minutes = parseInt(secondsRemaining / 60).toString()
    if (minutes.length == 1) {
      minutes = '0' + minutes
    }
    let seconds = parseInt(secondsRemaining % 60).toString()
    if (seconds.length == 1) {
      seconds = '0' + seconds
    }
    return (minutes + ':' + seconds)
  }
}

module.exports = TimerState
