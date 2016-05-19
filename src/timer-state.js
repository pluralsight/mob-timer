let timerInterval
let secondsRemaining
let callback

let mobbers = []

let currentMobber = 0
let secondsPerTurn = 600

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

function start() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      secondsRemaining--
      callback('timerChange', secondsRemaining)
      if (secondsRemaining < 0) {
        pause()
        rotate()
        callback('turnEnded')
      }
    }, 1000)
  }
  callback('started')
}

function pause() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  callback('paused')
}

function rotate() {
  reset()
  currentMobber = mobbers.length ? (currentMobber + 1) % mobbers.length : 0
  callback('rotated', getCurrentAndNextMobbers())
}

function initialize() {
  reset()
  rotate()
  callback('turnEnded')
}

function publishConfig() {
  callback('configUpdated', {
    mobbers,
    secondsPerTurn
  })
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

  publishConfig()
  callback('rotated', getCurrentAndNextMobbers())
}

function setSecondsPerTurn(value) {
  secondsPerTurn = value
  publishConfig()
  reset()
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
  setSecondsPerTurn
}
