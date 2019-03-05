const ClearClipboard = require('../src/clear-clipboard')
const clipboardy = require('clipboardy')
let assert = require('assert')

describe('clear-clipboard', () => {
  describe('clearClipboardHistory', () => {
    beforeEach(() => {
      clipboardy.writeSync('general kenboi')
      ClearClipboard.clearClipboardHistory()
    })

    it('should have cleared the clip board', function(done) {
      this.timeout(6100)
      setTimeout(function() {
        assert.strictEqual(clipboardy.readSync(), '')
        done()
      }, 6000)
    })
  })
})
