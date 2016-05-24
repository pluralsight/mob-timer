let timerInterval
let alertInterval
let secondsRemaining
let alertSeconds
let callback

let mobbers = []

let currentMobber = 0
let secondsPerTurn = 600
let millisecondsPerSecond = 1000

function reset() {
  secondsRemaining = secondsPerTurn
  callback('timerChange', secondsRemaining)
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
  if (!alertInterval) {
    alertSeconds = 0
    alertInterval = setInterval(() => {
      alertSeconds++
      callback('alert', alertSeconds)
    }, millisecondsPerSecond)
  }
}

function stopAlerts() {
  if (alertInterval) {
    clearInterval(alertInterval)
    alertInterval = null
  }
  callback('stopAlerts')
}

function start() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      secondsRemaining--
      callback('timerChange', secondsRemaining)
      if (secondsRemaining < 0) {
        pause()
        rotate()
        callback('turnEnded')
        startAlerts()
      }
    }, millisecondsPerSecond)
  }
  callback('started')
  stopAlerts()
}

function pause() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
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
}

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
  setTestingSpeed
}
