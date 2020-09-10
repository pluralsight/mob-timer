class Timer {
  constructor(options, callback) {
    this.rateMilliseconds = options.rateMilliseconds || 1000;
    this.time = options.time || 0;
    this.timeDelta = 0;
    this.countDown = options.countDown === true;
    this.callback = callback;
    this.startingTime = null;
  }

  start(now = Date.now) {
    this.startingTime = now();

    if (!this.interval) {
      this.interval = setInterval(() => {
        const secondsPassed = Math.floor((now() - this.startingTime) / 1000);
        this.timeDelta = secondsPassed;
        const secondsRemaining = this.time - secondsPassed;

        this.callback(
          this.countDown ? secondsRemaining : secondsPassed + this.time
        );
      }, this.rateMilliseconds);
    }
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.countDown
      ? (this.time = this.time - this.timeDelta)
      : (this.time += this.timeDelta);
    this.timeDelta = 0;
  }

  reset(value, now = Date.now) {
    this.time = value;
    this.timeDelta = 0;
    this.startingTime = now();
  }
}

module.exports = Timer;
