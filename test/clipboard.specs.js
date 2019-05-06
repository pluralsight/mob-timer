const clipboard = require('../src/clipboard')
const clipboardy = require('clipboardy')
const sinon = require('sinon')
let assert = require('assert')

describe('clipboard', () => {
  describe('clearClipboardHistory', () => {
    before(() => {
      clipboardy.writeSync('general kenboi')
      sinon.spy(clipboardy, 'writeSync')
      clipboard.clearClipboardHistory(expectedTimesWriteSyncIsCalled)
    })

    after(() => {
      clipboardy.writeSync.restore()
    })

    it('should have cleared the clip board', function(done) {
      setTimeout(function() {
        assert.strictEqual(clipboardy.readSync(), '')
        done()
      }, 700)
    })

    it('should call writeSync the correct number of times', () => {
      sinon.assert.callCount(clipboardy.writeSync, expectedTimesWriteSyncIsCalled)
    })

    let expectedTimesWriteSyncIsCalled = 3
  })
})
