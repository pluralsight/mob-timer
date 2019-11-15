let TimerState = require("./timer-state");
let TestTimer = require("./test-timer");

describe("timer-state", () => {
  let timerState;
  let events;

  let assertEvent = eventName => {
    var event = events.find(x => x.event === eventName);
    var failureMessage = event ? undefined : eventName + " event not found";
    expect(failureMessage).toBeUndefined();
    return event;
  };

  beforeEach(() => {
    events = [];
    timerState = new TimerState({ Timer: TestTimer });
    timerState.setCallback((event, data) => {
      events.push({ event, data });
    });
  });

  describe("initialize", () => {
    beforeEach(() => timerState.initialize());

    it("should publish a timerChange event", () => {
      var event = assertEvent("timerChange");
      expect(event.data).toEqual({
        secondsRemaining: 600,
        secondsPerTurn: 600
      });
    });

    it("should publish a rotated event", () => {
      var event = assertEvent("rotated");
      expect(event.data).toEqual({ current: null, next: null });
    });

    it("should publish a turnEnded event", () => {
      assertEvent("turnEnded");
    });

    it("should publish a configUpdated event", () => {
      assertEvent("configUpdated");
    });
  });

  describe("reset", () => {
    beforeEach(() => timerState.reset());

    it("should publish a timerChange event", () => {
      var event = assertEvent("timerChange");
      expect(event.data).toEqual({
        secondsRemaining: 600,
        secondsPerTurn: 600
      });
    });
  });

  describe("start", () => {
    beforeEach(() => timerState.start());

    it("should start the mainTimer", function() {
      expect(timerState.mainTimer.isRunning).toBe(true);
    });

    it("should publish a started event", () => {
      assertEvent("started");
    });

    it("should publish a stopAlerts event", () => {
      assertEvent("stopAlerts");
    });

    it("should publish a timerChange event when the timer calls back", () => {
      timerState.mainTimer.callback(599);
      var event = assertEvent("timerChange");
      expect(event.data).toEqual({
        secondsRemaining: 599,
        secondsPerTurn: 600
      });
    });

    it("should publish events when the time is up", () => {
      timerState.mainTimer.callback(-1);
      assertEvent("turnEnded");
      assertEvent("paused");
      assertEvent("rotated");
      var alertEvent = assertEvent("alert");
      expect(alertEvent.data).toBe(0);
    });

    it("should start the alertsTimer after the timer is up", () => {
      expect(timerState.alertsTimer.isRunning).toBe(false);
      timerState.mainTimer.callback(-1);
      expect(timerState.alertsTimer.isRunning).toBe(true);
    });

    it("should publish alert events after the time is up", () => {
      timerState.alertsTimer.callback(1);
      var event = assertEvent("alert");
      expect(event.data).toBe(1);
    });
  });

  describe("pause", () => {
    beforeEach(() => timerState.pause());

    it("should publish a paused event", () => {
      assertEvent("paused");
    });

    it("should publish a stopAlerts event", () => {
      assertEvent("stopAlerts");
    });

    it("should stop the mainTimer", () => {
      timerState.start();
      expect(timerState.mainTimer.isRunning).toBe(true);

      timerState.pause();
      expect(timerState.mainTimer.isRunning).toBe(false);
    });
  });

  describe("rotate", () => {
    beforeEach(() => {
      timerState.addMobber({ name: "A" });
      timerState.addMobber({ name: "B" });
      timerState.addMobber({ name: "C" });
      events = [];
      timerState.rotate();
    });

    it("should publish a rotated event", () => {
      var event = assertEvent("rotated");

      const actual = {
        currentName: event.data.current.name,
        nextName: event.data.next.name
      };

      const expectations = {
        currentName: "B",
        nextName: "C"
      };
      expect(actual).toEqual(expectations);
    });

    it("should publish a timerChange event", () => {
      var event = assertEvent("timerChange");
      expect(event.data).toEqual({
        secondsRemaining: 600,
        secondsPerTurn: 600
      });
    });

    it("should wrap around at the end of the list", () => {
      events = [];
      timerState.rotate();
      var event = assertEvent("rotated");
      const actual = {
        currentName: event.data.current.name,
        nextName: event.data.next.name
      };

      const expectations = {
        currentName: "C",
        nextName: "A"
      };
      expect(actual).toEqual(expectations);
    });
  });

  describe("publishConfig", () => {
    beforeEach(() => timerState.publishConfig());

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.mobbers).toEqual([]);
      expect(event.data.secondsPerTurn).toBe(600);
      expect(event.data.secondsUntilFullscreen).toBe(30);
      expect(event.data.snapThreshold).toBe(25);
      expect(event.data.alertSound).toBe(null);
      expect(event.data.alertSoundTimes).toEqual([]);
      expect(event.data.timerAlwaysOnTop).toBe(true);
      expect(event.data.shuffleMobbersOnStartup).toBe(false);
    });

    it("should contain the mobbers if there are some", () => {
      timerState.addMobber({ name: "A" });
      timerState.addMobber({ name: "B" });
      events = [];

      timerState.publishConfig();
      var event = assertEvent("configUpdated");
      expect(event.data.mobbers[0].name).toBe("A");
      expect(event.data.mobbers[1].name).toBe("B");

      timerState.removeMobber({ name: "A" });
      timerState.removeMobber({ name: "B" });
    });

    it("should publish a rotated event", () => {
      assertEvent("rotated");
    });
  });

  describe("addMobber", () => {
    beforeEach(() => timerState.addMobber({ name: "A" }));

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.mobbers[0].name).toBe("A");
      expect(event.data.secondsPerTurn).toBe(600);
    });

    it("should publish a rotated event", () => {
      var event = assertEvent("rotated");
      const actual = {
        currentName: event.data.current.name,
        nextName: event.data.next.name
      };

      const expectations = {
        currentName: "A",
        nextName: "A"
      };
      expect(actual).toEqual(expectations);
    });
  });

  describe("removeMobber", () => {
    beforeEach(() => {
      timerState.addMobber({ name: "A", id: "a" });
      timerState.addMobber({ name: "B", id: "b" });
      timerState.addMobber({ name: "C", id: "c" });
      events = [];
      timerState.removeMobber({ name: "B", id: "b" });
    });

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.mobbers[0].name).toBe("A");
      expect(event.data.mobbers[1].name).toBe("C");
      expect(event.data.secondsPerTurn).toBe(600);
    });

    it("should publish a rotated event", () => {
      var event = assertEvent("rotated");
      const actual = {
        currentName: event.data.current.name,
        nextName: event.data.next.name
      };

      const expectations = {
        currentName: "A",
        nextName: "C"
      };
      expect(actual).toEqual(expectations);
    });

    it("should NOT publish a turnEnded event if the removed user was NOT current", () => {
      var event = events.find(x => x.event === "turnEnded");
      expect(event).toBe(undefined);
    });

    it("should publish a turnEnded event if the removed user was current", () => {
      timerState.removeMobber({ name: "A" });
      assertEvent("turnEnded");
    });

    it("should publish a timerChange event if the removed user was current", () => {
      timerState.removeMobber({ name: "A" });
      assertEvent("timerChange");
    });

    it("should publish a paused event if the removed user was current", () => {
      timerState.removeMobber({ name: "A" });
      assertEvent("paused");
    });

    it("should update correctly if the removed user was current", () => {
      timerState.rotate();
      events = [];
      timerState.removeMobber({ name: "C", id: "c" });
      var event = assertEvent("rotated");
      expect(event.data.current.name).toBe("A");
      expect(event.data.next.name).toBe("A");
    });
  });

  describe("updateMobber", () => {
    beforeEach(() => {
      timerState.addMobber({ id: "a", name: "A1" });
      events = [];
      timerState.updateMobber({ id: "a", name: "A2" });
    });

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.mobbers[0].name).toBe("A2");
      expect(event.data.secondsPerTurn).toBe(600);
    });

    it("should update correctly if the update disabled the current mobber", () => {
      timerState.addMobber({ id: "b", name: "B" });
      timerState.addMobber({ id: "c", name: "C" });
      timerState.rotate();
      events = [];

      timerState.updateMobber({ id: "b", name: "B", disabled: true });

      assertEvent("paused");
      assertEvent("turnEnded");
      assertEvent("configUpdated");
      var rotatedEvent = assertEvent("rotated");
      expect(rotatedEvent.data.current.name).toBe("C");
      expect(rotatedEvent.data.next.name).toBe("A2");
      var timerChangeEvent = assertEvent("timerChange");
      expect(timerChangeEvent.data).toEqual({
        secondsRemaining: 600,
        secondsPerTurn: 600
      });
    });

    it("should update correctly if the update enabled a mobber in list of only disabled mobbers", () => {
      timerState.updateMobber({ id: "a", name: "A2", disabled: true });
      timerState.addMobber({ id: "b", name: "B", disabled: true });
      timerState.addMobber({ id: "c", name: "C", disabled: true });
      timerState.rotate();
      events = [];

      timerState.updateMobber({ id: "b", name: "B", disabled: false });

      assertEvent("configUpdated");
      var rotatedEvent = assertEvent("rotated");
      expect(rotatedEvent.data.current.name).toBe("B");
      expect(rotatedEvent.data.next.name).toBe("B");
    });
  });

  describe("shuffleMobbers", () => {
    beforeEach(() => {
      const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
      letters.forEach(x => timerState.addMobber({ id: x }));
      events = [];
      timerState.shuffleMobbers();
    });

    it("should publish a configUpdated event", () => {
      assertEvent("configUpdated");
    });

    it("should publish a rotated event", () => {
      assertEvent("rotated");
    });

    it("should shuffle the mobbers", () => {
      const mobbers = timerState
        .getState()
        .mobbers.map(x => x.id)
        .join("");
      expect(mobbers).not.toBe("abcdefghij");
    });
  });

  describe("setSecondsPerTurn", () => {
    beforeEach(() => timerState.setSecondsPerTurn(300));

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.secondsPerTurn).toBe(300);
    });

    it("should publish a timerChange event", () => {
      var event = assertEvent("timerChange");
      expect(event.data).toEqual({
        secondsRemaining: 300,
        secondsPerTurn: 300
      });
    });
  });

  describe("setSecondsUntilFullscreen", () => {
    beforeEach(() => timerState.setSecondsUntilFullscreen(5));

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.secondsUntilFullscreen).toBe(5);
    });
  });

  describe("when setting snap threshold", () => {
    beforeEach(() => timerState.setSnapThreshold(100));

    it("should publish configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.snapThreshold).toBe(100);
    });
  });

  describe("when setting the alert sound file", () => {
    beforeEach(() => timerState.setAlertSound("new-sound.mp3"));

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.alertSound).toBe("new-sound.mp3");
    });
  });

  describe("when setting the alert sound times", () => {
    beforeEach(() => timerState.setAlertSoundTimes([1, 2, 3]));

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.alertSoundTimes).toEqual([1, 2, 3]);
    });
  });

  describe("when setting the timer always on top", () => {
    beforeEach(() => timerState.setTimerAlwaysOnTop(false));

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.timerAlwaysOnTop).toEqual(false);
    });
  });

  describe("when setting shuffle mobbers on startup", () => {
    beforeEach(() => timerState.setShuffleMobbersOnStartup(true));

    it("should publish a configUpdated event", () => {
      var event = assertEvent("configUpdated");
      expect(event.data.shuffleMobbersOnStartup).toEqual(true);
    });
  });

  describe("getState", () => {
    describe("when getting non-default state", () => {
      beforeEach(() => {
        timerState.addMobber(expectedJack);
        timerState.addMobber(expectedJill);
        timerState.setSecondsPerTurn(expectedSecondsPerTurn);
        timerState.setSecondsUntilFullscreen(expectedSecondsUntilFullscreen);
        timerState.setSnapThreshold(expectedSnapThreshold);
        timerState.setAlertSound(expectedAlertSound);
        timerState.setAlertSoundTimes(expectedAlertSoundTimes);
        timerState.setTimerAlwaysOnTop(expectedTimerAlwaysOnTop);
        timerState.setShuffleMobbersOnStartup(expectedShuffleMobbersOnStartup);

        result = timerState.getState();
      });

      it("should get correct mobbers", () => {
        var actualJack = result.mobbers.find(x => x.name === expectedJack.name);
        var actualJill = result.mobbers.find(x => x.name === expectedJill.name);

        expect(expectedJack).toEqual(actualJack);
        expect(expectedJill).toEqual(actualJill);
      });

      it("should get correct seconds per turn", () => {
        expect(result.secondsPerTurn).toBe(expectedSecondsPerTurn);
      });

      it("should get the correct seconds until fullscreen", () => {
        expect(result.secondsUntilFullscreen).toBe(
          expectedSecondsUntilFullscreen
        );
      });

      it("should get the correct snap threshold", () => {
        expect(result.snapThreshold).toBe(expectedSnapThreshold);
      });

      it("should get the correct alert sound", () => {
        expect(result.alertSound).toBe(expectedAlertSound);
      });

      it("should get the correct alert sound times", () => {
        expect(result.alertSoundTimes).toBe(expectedAlertSoundTimes);
      });

      it("should get the correct timer always on top", () => {
        expect(result.timerAlwaysOnTop).toBe(expectedTimerAlwaysOnTop);
      });

      it("should get the correct shuffle mobbers on startup", () => {
        expect(result.shuffleMobbersOnStartup).toBe(
          expectedShuffleMobbersOnStartup
        );
      });

      let result = {};
      let expectedJack = { name: "jack" };
      let expectedJill = { name: "jill" };
      let expectedSecondsPerTurn = 599;
      let expectedSecondsUntilFullscreen = 3;
      let expectedSnapThreshold = 42;
      let expectedAlertSound = "alert.mp3";
      let expectedAlertSoundTimes = [0, 15];
      let expectedTimerAlwaysOnTop = false;
      let expectedShuffleMobbersOnStartup = true;
    });

    describe("when getting default state", () => {
      beforeEach(() => (result = timerState.getState()));

      it("should get no mobbers", () =>
        expect(result.mobbers.length).toEqual(0));
      it("should have a default secondsPerTurn greater than zero", () =>
        expect(result.secondsPerTurn).toBeGreaterThan(0));
      it("should have a default snapThreshold greater than zero", () =>
        expect(result.snapThreshold).toBeGreaterThan(0));
      it("should have a null alert sound", () =>
        expect(result.alertSound).toBeNull());
      it("should have an empty array of alert sound times", () =>
        expect(result.alertSoundTimes).toEqual([]));
      it("should have a default timerAlwaysOnTop", () =>
        expect(result.timerAlwaysOnTop).toEqual(true));
      it("should have a default shuffleMobbersOnStartup", () =>
        expect(result.shuffleMobbersOnStartup).toBe(false));

      let result = {};
    });

    describe("when there is one mobber", () => {
      beforeAll(() => {
        timerState.addMobber(expectedJack);

        result = timerState.getState();
      });

      it("should get correct mobber", () => {
        var actualJack = result.mobbers.find(x => x.name === expectedJack.name);

        expect(expectedJack).toEqual(actualJack);
      });

      let result = {};
      let expectedJack = { name: "jack" };
    });
  });

  describe("loadState", () => {
    describe("when loading state data", () => {
      beforeAll(() => {
        state = {
          mobbers: [{ name: "jack" }, { name: "jill" }],
          secondsPerTurn: 400,
          secondsUntilFullscreen: 0,
          snapThreshold: 22,
          alertSound: "bell.mp3",
          alertSoundTimes: [2, 3, 5, 8],
          timerAlwaysOnTop: false,
          shuffleMobbersOnStartup: true
        };

        timerState.loadState(state);

        result = timerState.getState();
      });

      it("should load mobbers", () =>
        expect(result.mobbers).toEqual(state.mobbers));
      it("should load secondsPerTurn", () =>
        expect(result.secondsPerTurn).toBe(state.secondsPerTurn));
      it("should load secondsUntilFullscreen", () =>
        expect(result.secondsUntilFullscreen).toBe(
          state.secondsUntilFullscreen
        ));
      it("should load snapThreshold", () =>
        expect(result.snapThreshold).toBe(state.snapThreshold));
      it("should load alertSound", () =>
        expect(result.alertSound).toBe(state.alertSound));
      it("should load alertSoundTimes", () =>
        expect(result.alertSoundTimes).toEqual([2, 3, 5, 8]));
      it("should load timerAlwaysOnTop", () =>
        expect(result.timerAlwaysOnTop).toBe(state.timerAlwaysOnTop));
      it("should load shuffleMobbersOnStartup", () =>
        expect(result.shuffleMobbersOnStartup).toBe(
          state.shuffleMobbersOnStartup
        ));

      let result = {};
      let state = {};
    });

    describe("when loading an empty state", () => {
      beforeAll(() => {
        timerState.loadState({});

        result = timerState.getState();
      });

      it("should NOT load any mobbers", () =>
        expect(result.mobbers.length).toBe(0));
      it("should have a default secondsPerTurn greater than zero", () =>
        expect(result.secondsPerTurn).toBeGreaterThan(0));
      it("should have a default secondsUntilFullscreen greater than zero", () =>
        expect(result.secondsUntilFullscreen).toBeGreaterThan(0));
      it("should have a default snapThreshold greater than zero", () =>
        expect(result.snapThreshold).toBeGreaterThan(0));
      it("should have a null alertSound", () =>
        expect(result.alertSound).toBe(null));
      it("should have an empty array of alertSoundTimes", () =>
        expect(result.alertSoundTimes).toEqual([]));
      it("should have a default timerAlwaysOnTop", () =>
        expect(result.timerAlwaysOnTop).toBe(true));
      it("should have a default shuffleMobbersOnStartup", () =>
        expect(result.shuffleMobbersOnStartup).toBe(false));

      let result = {};
    });

    describe("when loading state with one mobber", () => {
      beforeAll(() => {
        state = {
          mobbers: [{ name: "jack" }]
        };

        timerState.loadState(state);

        result = timerState.getState();
      });

      it("should load one mobber", () =>
        expect(state.mobbers).toEqual(result.mobbers));

      let result = {};
      let state = {};
    });
  });
});
