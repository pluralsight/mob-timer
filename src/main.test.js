const { ipcMain } = require("electron");
let TimerState = require("./state/timer-state");
let timerState = new TimerState();

jest.mock("./state/timer-state", () => {
  const fakeSingletonInitialize = () => {};
  const fakeSingletonPublishConfig = () => {};
  const fakeSingletonPause = () => {};
  const fakeSingletonStart = () => {};
  const fakeSingletonRotate = () => {};
  const fakeSingletonShuffleMobbers = () => {};
  return function FakeTimerStateConstructor() {
    return {
      initialize: fakeSingletonInitialize,
      publishConfig: fakeSingletonPublishConfig,
      pause: fakeSingletonPause,
      start: fakeSingletonStart,
      rotate: fakeSingletonRotate,
      shuffleMobbers: fakeSingletonShuffleMobbers
    };
  };
});

describe("main", () => {
  it("should register main process listeners", () => {
    require("./main");
    expect(ipcMain.on.mock.calls).toEqual(
      expect.arrayContaining([
        ["setShuffleMobbersOnStartup", expect.any(Function)],
        ["timerWindowReady", timerState.initialize],
        ["configWindowReady", timerState.publishConfig],
        ["fullscreenWindowReady", timerState.publishConfig],
        ["pause", timerState.pause],
        ["unpause", timerState.start],
        ["skip", timerState.rotate],
        ["startTurn", timerState.start],
        ["configure", expect.any(Function)],
        ["shuffleMobbers", timerState.shuffleMobbers],
        ["addMobber", expect.any(Function)],
        ["removeMobber", expect.any(Function)],
        ["updateMobber", expect.any(Function)],
        ["setSecondsPerTurn", expect.any(Function)],
        ["setSecondsUntilFullscreen", expect.any(Function)],
        ["setSnapThreshold", expect.any(Function)],
        ["setAlertSoundTimes", expect.any(Function)],
        ["setAlertSound", expect.any(Function)],
        ["setTimerAlwaysOnTop", expect.any(Function)],
        ["setShuffleMobbersOnStartup", expect.any(Function)]
      ])
    );
  });
});
