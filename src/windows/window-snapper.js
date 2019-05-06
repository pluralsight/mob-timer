let getEdges = bounds => {
  return {
    top: bounds.y,
    bottom: bounds.y + bounds.height,
    left: bounds.x,
    right: bounds.x + bounds.width
  }
}

let isCloseTo = (a, b, snapThreshold) => {
  return Math.abs(a - b) <= snapThreshold
}

module.exports = (windowBounds, screenBounds, snapThreshold) => {
  if (snapThreshold <= 0) {
    return { x: windowBounds.x, y: windowBounds.y }
  }

  let windowEdges = getEdges(windowBounds)
  let screenEdges = getEdges(screenBounds)
  let snapTo = { x: windowBounds.x, y: windowBounds.y }

  if (isCloseTo(windowEdges.left, screenEdges.left, snapThreshold)) {
    snapTo.x = screenEdges.left
  }

  if (isCloseTo(windowEdges.right, screenEdges.right, snapThreshold)) {
    snapTo.x = screenEdges.right - windowBounds.width
  }

  if (isCloseTo(windowEdges.top, screenEdges.top, snapThreshold)) {
    snapTo.y = screenEdges.top
  }

  if (isCloseTo(windowEdges.bottom, screenEdges.bottom, snapThreshold)) {
    snapTo.y = screenEdges.bottom - windowBounds.height
  }

  return snapTo
}
