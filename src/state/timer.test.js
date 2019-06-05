let Timer = require("./timer");
const sinon = require("sinon");

describe("Timer", () => {
  let timer;
  let timerOptions;
  let callbacks;
  let clock;

  let createTimer = () => {
    timer = new Timer(timerOptions, x => callbacks.push(x));
  };

  beforeEach(() => {
    callbacks = [];
    timerOptions = { rateMilliseconds: 20, time: 50, countDown: true };
    createTimer();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    timer.pause();
    clock.restore();
  });

  describe("on construction", () => {
    describe("with specified options", () => {
      it("should have the specified rateMilliseconds value", () => {
        expect(timer.rateMilliseconds).toBe(timerOptions.rateMilliseconds);
      });

      it("should have the specified value", () => {
        expect(timer.time).toBe(timerOptions.time);
      });

      it("should have a change value based on the specified countDown", () => {
        expect(timer.change).toBe(-1);
      });
    });

    describe("with default options", () => {
      beforeEach(() => {
        timerOptions = {};
        createTimer();
      });

      it("should have the default rateMilliseconds value", () => {
        expect(timer.rateMilliseconds).toBe(1000);
      });

      it("should have the default time value", () => {
        expect(timer.time).toBe(0);
      });

      it("should have the default change value", () => {
        expect(timer.change).toBe(1);
      });
    });
  });

  describe("start", () => {
    it("should generate callbacks when counting down", () => {
      timer.start();
      clock.tick(50);
      expect(callbacks.join(",")).toBe("49,48");
    });

    it("should generate callbacks when counting up", () => {
      timerOptions.countDown = false;
      createTimer();
      timer.start();
      clock.tick(50);
      expect(callbacks.join(",")).toBe("51,52");
    });
  });

  describe("pause", () => {
    it("should stop further callbacks from occuring", () => {
      timer.start();
      clock.tick(50);
      timer.pause();
      clock.tick(100);
      expect(callbacks.join(",")).toBe("49,48");
    });
  });

  describe("reset", () => {
    it("should set a new time value when the timer is not running", () => {
      timer.reset(42);
      expect(timer.time).toBe(42);
    });

    it("should set a new time value when the timer is running", () => {
      timer.start();
      clock.tick(50);
      timer.reset(20);
      clock.tick(40);
      expect(callbacks.join(",")).toBe("49,48,19,18");
    });
  });
});
