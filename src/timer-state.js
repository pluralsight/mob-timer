let timerInterval
let secondsRemaining
let callback

module.exports = {
  setCallback(cb) {
    callback = cb
  },
  reset() {
    secondsRemaining = 3
  },
  start() {
    timerInterval = setInterval(() => {
      callback('timerChange', secondsRemaining--)
    }, 1000)
  },
  pause() {
    clearInterval(timerInterval)
    callback('paused')
  }
}
