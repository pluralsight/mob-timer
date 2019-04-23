class TestTimer {
  constructor(options, callback) {
    this.options = options;
    this.callback = callback;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  reset(value) {
    this.time = value;
  }
}

module.exports = TestTimer;
