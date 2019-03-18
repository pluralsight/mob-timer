const windowSnapper = require('../../src/windows/window-snapper')
const assert = require('assert')

describe('window-snapper', () => {
  it('should return window coordinates if threshold is 0', () => {
    const windowBounds = { x: 0, y: 0, width: 1920, height: 1080 }
    const screenBounds = {}
    const snapThreshold = 0
    const result = windowSnapper(windowBounds, screenBounds, snapThreshold)
    assert.deepStrictEqual(result, { x: 0, y: 0 })
  })
})
