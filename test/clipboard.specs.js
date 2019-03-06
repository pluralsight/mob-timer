const clipboard = require('../src/clipboard')
const clipboardy = require('clipboardy')
let assert = require('assert')

describe('clipboard', () => {
  describe('clearClipboardHistory', () => {
    beforeEach(() => {
      clipboardy.writeSync('general kenboi')
      clipboard.clearClipboardHistory()
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
