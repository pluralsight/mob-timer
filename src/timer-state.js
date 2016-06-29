const Timer = require('./state/timer')

let mainTimer
let alertsTimer
let callback

let mobbers = []

let currentMobber = 0
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

function getCurrentAndNextMobbers() {
  if (!mobbers.length) {
    return { current: null, next: null }
  }
  return {
    current: mobbers[currentMobber],
    next: mobbers[(currentMobber + 1) % mobbers.length]
  }
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
  currentMobber = mobbers.length ? (currentMobber + 1) % mobbers.length : 0
  callback('rotated', getCurrentAndNextMobbers())
}

function initialize() {
  rotate()
  callback('turnEnded')
}

function publishConfig() {
  callback('configUpdated', {
    mobbers,
    secondsPerTurn
  })
  callback('rotated', getCurrentAndNextMobbers())
}

function addMobber(mobber) {
  mobbers.push(mobber)
  publishConfig()
  callback('rotated', getCurrentAndNextMobbers())
}

function removeMobber(mobber) {
  let removedMobberIndex = mobbers.findIndex(x => x.name === mobber.name)
  mobbers = mobbers.filter(m => m.name !== mobber.name)

  if (currentMobber === removedMobberIndex) {
    pause()
    reset()
    callback('turnEnded')
  }

  if (currentMobber >= mobbers.length) {
    currentMobber = 0
  }

  publishConfig()
  callback('rotated', getCurrentAndNextMobbers())
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
    mobbers: mobbers,
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
