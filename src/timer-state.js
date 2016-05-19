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

function reset() {
  secondsRemaining = 3
  callback('timerChange', secondsRemaining)
}

function start() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      callback('timerChange', secondsRemaining--)
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
  callback('rotated', {
    current: mobbers[currentMobber],
    next: mobbers[(currentMobber + 1) % mobbers.length]
  })
}

module.exports = {
  setCallback(cb) {
    callback = cb
  },
  reset,
  start,
  pause,
  rotate
}
