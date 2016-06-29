const Timer = require('./timer')
const Mobbers = require('./mobbers')

let mainTimer
let alertsTimer
let callback

let mobbers = new Mobbers()

let secondsPerTurn = 600
let millisecondsPerSecond = 1000

function createTimers() {
  if (mainTimer) {
    mainTimer.pause()
  }
  mainTimer = new Timer({countDown: true, time: secondsPerTurn, rateMilliseconds: millisecondsPerSecond}, secondsRemaining => {
    callback('timerChange', secondsRemaining)
    if (secondsRemaining < 0) {
      pause()
      rotate()
      callback('turnEnded')
      startAlerts()
    }
  })

  if (alertsTimer) {
    alertsTimer.pause()
  }
  alertsTimer = new Timer({countDown: false, rateMilliseconds: millisecondsPerSecond}, alertSeconds => {
    callback('alert', alertSeconds)
  })
}

function reset() {
  mainTimer.reset(secondsPerTurn)
  callback('timerChange', secondsPerTurn)
}

function startAlerts() {
  alertsTimer.reset(0)
  alertsTimer.start()
}

function stopAlerts() {
  alertsTimer.pause()
  callback('stopAlerts')
}

function start() {
  mainTimer.start()
  callback('started')
  stopAlerts()
}

function pause() {
  mainTimer.pause()
  callback('paused')
  stopAlerts()
}

function rotate() {
  reset()
  mobbers.rotate()
  callback('rotated', mobbers.getCurrentAndNextMobbers())
}

function initialize() {
  rotate()
  callback('turnEnded')
}

function publishConfig() {
  callback('configUpdated', {
    mobbers: mobbers.getAll(),
    secondsPerTurn
  })
  callback('rotated', mobbers.getCurrentAndNextMobbers())
}

function addMobber(mobber) {
  mobbers.addMobber(mobber)
  publishConfig()
  callback('rotated', mobbers.getCurrentAndNextMobbers())
}

function removeMobber(mobber) {
  let currentMobber = mobbers.getCurrentAndNextMobbers().current
  let isRemovingCurrentMobber = currentMobber ? currentMobber.name == mobber.name : false

  mobbers.removeMobber(mobber)

  if (isRemovingCurrentMobber) {
    pause()
    reset()
    callback('turnEnded')
  }

  publishConfig()
  callback('rotated', mobbers.getCurrentAndNextMobbers())
}

function setSecondsPerTurn(value) {
  secondsPerTurn = value
  publishConfig()
  reset()
}

function setTestingSpeed(value) {
  millisecondsPerSecond = value
  createTimers()
}

function getState() {
  return {
    mobbers: mobbers.getAll(),
    secondsPerTurn: secondsPerTurn
  }
}

function loadState(state) {
  if(state.mobbers) {
    for(var i=0;i<state.mobbers.length;i++){
      addMobber(state.mobbers[i])
    }
  }

  setSecondsPerTurn(state.secondsPerTurn || secondsPerTurn)
}

createTimers()

module.exports = {
  setCallback(cb) {
    callback = cb
  },
  reset,
  start,
  pause,
  rotate,
  initialize,
  publishConfig,
  addMobber,
  removeMobber,
  setSecondsPerTurn,
  setTestingSpeed,
  getState,
  loadState
}
