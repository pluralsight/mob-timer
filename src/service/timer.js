class Timer {
  constructor(options) {
    this.rateMilliseconds = options.rateMilliseconds || 1000
    this.time = options.time || 0
    this.change = options.countDown ? -1 : 1
    this.onTick = options.onTick

    if (!this.onTick) {
      throw new Error('onTick is required for Timer')
    }

    this.isRunning = false
    this.tickInterval = null
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true
      this.tickInterval = setInterval(() => {
        this.tick()
      }, this.rateMilliseconds)
    }
  }

  pause() {
    if (this.isRunning) {
      this.isRunning = false
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
  }

  reset(value) {
    this.time = value
  }

  tick(value) {
    this.time = value || this.time + this.change
    this.onTick(this.time)
  }
}

module.exports = Timer
