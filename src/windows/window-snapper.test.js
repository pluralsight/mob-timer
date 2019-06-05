const { snapCheck } = require("./window-snapper");

describe("window-snapper snapCheck", () => {
  const fullHdScreen = { x: 0, y: 0, width: 1920, height: 1080 };

  it("should throw if threshold is 0 since it should not even be called", () => {
    const windowBounds = { x: 13, y: 37, width: 220, height: 90 };
    const screenBounds = fullHdScreen;
    const snapThreshold = 0;
    const act = () => snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(act).toThrow();
  });

  it("should not snap if far from edges", () => {
    const windowBounds = {
      x: 11,
      y: 11,
      width: 200 - 11 - 11,
      height: 200 - 11 - 11
    };
    const screenBounds = { x: 0, y: 0, width: 200, height: 200 };
    const snapThreshold = 10;
    const result = snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(result).toEqual({
      x: 11,
      y: 11,
      width: 178,
      height: 178,
      shouldSnap: false
    });
  });

  it("should snap to the left if close to the left screen edge", () => {
    const windowBounds = { x: 9, y: 11, width: 220, height: 90 };
    const screenBounds = fullHdScreen;
    const snapThreshold = 10;
    const result = snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(result).toEqual({
      x: 0,
      y: 11,
      width: 220,
      height: 90,
      shouldSnap: true
    });
  });

  it("should snap to the top and left if close to the top left screen corner", () => {
    const windowBounds = { x: 5, y: 8, width: 220, height: 90 };
    const screenBounds = fullHdScreen;
    const snapThreshold = 10;
    const result = snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(result).toEqual({
      x: 0,
      y: 0,
      width: 220,
      height: 90,
      shouldSnap: true
    });
  });

  it("should snap to the top if close to the top screen edge", () => {
    const windowBounds = { x: 14, y: 8, width: 220, height: 90 };
    const screenBounds = fullHdScreen;
    const snapThreshold = 10;
    const result = snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(result).toEqual({
      x: 14,
      y: 0,
      width: 220,
      height: 90,
      shouldSnap: true
    });
  });

  it("should snap to the top and right if close to the top right screen corner", () => {
    const windowBounds = { x: 1708, y: 2, width: 220, height: 90 };
    const screenBounds = fullHdScreen;
    const snapThreshold = 10;
    const result = snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(result).toEqual({
      x: 1700,
      y: 0,
      width: 220,
      height: 90,
      shouldSnap: true
    });
  });

  it("should snap to the right if close to the right screen edge", () => {
    const windowBounds = { x: 1708, y: 13, width: 220, height: 90 };
    const screenBounds = fullHdScreen;
    const snapThreshold = 10;
    const result = snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(result).toEqual({
      x: 1700,
      y: 13,
      width: 220,
      height: 90,
      shouldSnap: true
    });
  });

  it("should snap to the right and bottom if close to the right bottom screen corner", () => {
    const windowBounds = { x: 1708, y: 995, width: 220, height: 90 };
    const screenBounds = fullHdScreen;
    const snapThreshold = 10;
    const result = snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(result).toEqual({
      x: 1700,
      y: 990,
      width: 220,
      height: 90,
      shouldSnap: true
    });
  });

  it("should snap to the bottom if close to the bottom screen edge", () => {
    const windowBounds = { x: 1685, y: 985, width: 220, height: 90 };
    const screenBounds = fullHdScreen;
    const snapThreshold = 10;
    const result = snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(result).toEqual({
      x: 1685,
      y: 990,
      width: 220,
      height: 90,
      shouldSnap: true
    });
  });

  it("should snap to the bottom and left if close to the bottom left screen corner", () => {
    const windowBounds = { x: 9, y: 985, width: 220, height: 90 };
    const screenBounds = fullHdScreen;
    const snapThreshold = 10;
    const result = snapCheck(windowBounds, screenBounds, snapThreshold);
    expect(result).toEqual({
      x: 0,
      y: 990,
      width: 220,
      height: 90,
      shouldSnap: true
    });
  });
});
