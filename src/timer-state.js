let timerInterval
let secondsRemaining
let callback

let mobbers = [
  { name: "Maik" },
  { name: "Eric" },
  { name: "Allan" },
  { name: "Kurt" },
  { name: "Jake" }
]

let currentMobber = 0
let secondsPerTurn = 3

function reset() {
  secondsRemaining = secondsPerTurn
  callback('timerChange', secondsRemaining)
}

function getCurrentAndNextMobbers() {
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
  console.log('rotate')
  reset()
  currentMobber = (currentMobber + 1) % mobbers.length
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

module.exports = {
  setCallback(cb) {
    callback = cb
  },
  reset,
  start,
  pause,
  rotate,
  initialize,
  publishConfig
}
