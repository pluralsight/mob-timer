class Timer {
  constructor(options, callback) {
    this.rateMilliseconds = options.rateMilliseconds || 1000;
    this.time = options.time || 0;
    this.change = options.countDown ? -1 : 1;
    this.callback = callback;
  }

  start() {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.time += this.change;
        this.callback(this.time);
      }, this.rateMilliseconds);
    }
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  reset(value) {
    this.time = value;
  }
}

module.exports = Timer;
