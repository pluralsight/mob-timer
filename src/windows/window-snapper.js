const snapCheck = (windowBounds, screenBounds, snapThreshold) => {
  if (snapThreshold <= 0) {
    throw new Error(
      "Not supported, not supposed to call window-snapper if threshold <= 0!"
    );
  }

  const noSnap = { ...windowBounds, shouldSnap: false };
  const isWithinThreshold = setupThresholdCheck(snapThreshold);

  return {
    ...noSnap,
    ...snapLeftCheck(windowBounds, screenBounds, isWithinThreshold),
    ...snapRightCheck(windowBounds, screenBounds, isWithinThreshold),
    ...snapTopCheck(windowBounds, screenBounds, isWithinThreshold),
    ...snapBottomCheck(windowBounds, screenBounds, isWithinThreshold)
  };
};

const setupThresholdCheck = snapThreshold => (a, b) => {
  return Math.abs(a - b) <= snapThreshold;
};

const snapLeftCheck = (windowBounds, screenBounds, isWithinThreshold) =>
  isWithinThreshold(windowBounds.x, screenBounds.x)
    ? {
        x: screenBounds.x,
        shouldSnap: true
      }
    : undefined;

const snapRightCheck = (windowBounds, screenBounds, isWithinThreshold) => {
  const rightWindowEdge = windowBounds.x + windowBounds.width;
  const rightScreenEdge = screenBounds.x + screenBounds.width;
  return isWithinThreshold(rightWindowEdge, rightScreenEdge)
    ? {
        x: rightScreenEdge - windowBounds.width,
        shouldSnap: true
      }
    : undefined;
};

const snapTopCheck = (windowBounds, screenBounds, isWithinThreshold) =>
  isWithinThreshold(windowBounds.y, screenBounds.y)
    ? {
        y: screenBounds.y,
        shouldSnap: true
      }
    : undefined;

const snapBottomCheck = (windowBounds, screenBounds, isWithinThreshold) => {
  const bottomWindowEdge = windowBounds.y + windowBounds.height;
  const bottomScreenEdge = screenBounds.y + screenBounds.height;
  return isWithinThreshold(bottomWindowEdge, bottomScreenEdge)
    ? {
        y: bottomScreenEdge - windowBounds.height,
        shouldSnap: true
      }
    : undefined;
};

module.exports = { snapCheck };
