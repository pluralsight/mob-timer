const Timer = require("./timer");
const Mobbers = require("./mobbers");

class TimerState {
  constructor(options) {
    if (!options) {
      options = {};
    }
    this.secondsPerTurn = 600;
    this.mobbers = new Mobbers();
    this.secondsUntilFullscreen = 30;
    this.snapThreshold = 25;
    this.alertSound = null;
    this.alertSoundTimes = [];
    this.timerAlwaysOnTop = true;
    this.shuffleMobbersOnStartup = false;

    this.createTimers(options.Timer || Timer);

    this.initialize = this.initialize.bind(this);
    this.publishConfig = this.publishConfig.bind(this);
    this.rotate = this.rotate.bind(this);
    this.start = this.start.bind(this);
    this.pause = this.pause.bind(this);
    this.shuffleMobbers = this.shuffleMobbers.bind(this);
  }

  setCallback(callback) {
    this.callback = callback;
  }

  createTimers(TimerClass) {
    this.mainTimer = new TimerClass(
      { countDown: true, time: this.secondsPerTurn },
      secondsRemaining => {
        this.dispatchTimerChange(secondsRemaining);
        if (secondsRemaining < 0) {
          this.pause();
          this.rotate();
          this.callback("turnEnded");
          this.startAlerts();
        }
      }
    );

    this.alertsTimer = new TimerClass({ countDown: false }, alertSeconds => {
      this.callback("alert", alertSeconds);
    });
  }

  dispatchTimerChange(secondsRemaining) {
    this.callback("timerChange", {
      secondsRemaining: secondsRemaining < 0 ? 0 : secondsRemaining,
      secondsPerTurn: this.secondsPerTurn
    });
  }

  reset() {
    this.mainTimer.reset(this.secondsPerTurn);
    this.dispatchTimerChange(this.secondsPerTurn);
  }

  startAlerts() {
    this.alertsTimer.reset(0);
    this.alertsTimer.start();
    this.callback("alert", 0);
  }

  stopAlerts() {
    this.alertsTimer.pause();
    this.callback("stopAlerts");
  }

  start() {
    this.mainTimer.start();
    this.callback("started");
    this.stopAlerts();
  }

  pause() {
    this.mainTimer.pause();
    this.callback("paused");
    this.stopAlerts();
  }

  rotate() {
    this.reset();
    this.mobbers.rotate();
    this.callback("rotated", this.mobbers.getCurrentAndNextMobbers());
  }

  initialize() {
    this.pause();
    this.rotate();
    this.callback("turnEnded");
    this.publishConfig();
  }

  publishConfig() {
    this.callback("configUpdated", this.getState());
    this.callback("rotated", this.mobbers.getCurrentAndNextMobbers());
  }

  addMobber(mobber) {
    this.mobbers.addMobber(mobber);
    this.publishConfig();
  }

  removeMobber(mobber) {
    let currentMobber = this.mobbers.getCurrentAndNextMobbers().current;
    let isRemovingCurrentMobber = currentMobber
      ? currentMobber.name === mobber.name
      : false;

    this.mobbers.removeMobber(mobber);

    if (isRemovingCurrentMobber) {
      this.pause();
      this.reset();
      this.callback("turnEnded");
    }

    this.publishConfig();
  }

  updateMobber(mobber) {
    const currentMobber = this.mobbers.getCurrentAndNextMobbers().current;

    this.mobbers.updateMobber(mobber);

    const disablingCurrentMobber =
      currentMobber && currentMobber.id === mobber.id && mobber.disabled;
    if (disablingCurrentMobber) {
      this.pause();
      this.reset();
      this.callback("turnEnded");
    }

    this.publishConfig();
  }

  setSecondsPerTurn(value) {
    this.secondsPerTurn = value;
    this.publishConfig();
    this.reset();
  }

  setSecondsUntilFullscreen(value) {
    this.secondsUntilFullscreen = value;
    this.publishConfig();
  }

  setSnapThreshold(value) {
    this.snapThreshold = value;
    this.publishConfig();
  }

  setAlertSound(soundFile) {
    this.alertSound = soundFile;
    this.publishConfig();
  }

  setAlertSoundTimes(secondsArray) {
    this.alertSoundTimes = secondsArray;
    this.publishConfig();
  }

  setTimerAlwaysOnTop(value) {
    this.timerAlwaysOnTop = value;
    this.publishConfig();
  }

  setShuffleMobbersOnStartup(value) {
    this.shuffleMobbersOnStartup = value;
    this.publishConfig();
  }

  shuffleMobbers() {
    this.mobbers.shuffleMobbers();
    this.publishConfig();
  }

  getState() {
    return {
      mobbers: this.mobbers.getAll(),
      secondsPerTurn: this.secondsPerTurn,
      secondsUntilFullscreen: this.secondsUntilFullscreen,
      snapThreshold: this.snapThreshold,
      alertSound: this.alertSound,
      alertSoundTimes: this.alertSoundTimes,
      timerAlwaysOnTop: this.timerAlwaysOnTop,
      shuffleMobbersOnStartup: this.shuffleMobbersOnStartup
    };
  }

  loadState(state) {
    if (state.mobbers) {
      state.mobbers.forEach(x => this.addMobber(x));
    }

    this.setSecondsPerTurn(state.secondsPerTurn || this.secondsPerTurn);
    if (typeof state.secondsUntilFullscreen === "number") {
      this.setSecondsUntilFullscreen(state.secondsUntilFullscreen);
    }
    if (typeof state.snapThreshold === "number") {
      this.setSnapThreshold(state.snapThreshold);
    }
    this.alertSound = state.alertSound || null;
    this.alertSoundTimes = state.alertSoundTimes || [];
    if (typeof state.timerAlwaysOnTop === "boolean") {
      this.timerAlwaysOnTop = state.timerAlwaysOnTop;
    }
    this.shuffleMobbersOnStartup = !!state.shuffleMobbersOnStartup;
  }
}

module.exports = TimerState;
