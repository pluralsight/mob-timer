let Timer = require('../../src/state/timer')
let assert = require('assert')

describe('Timer', () => {
  let timer
  let timerOptions
  let callbacks

  let createTimer = () => {
    timer = new Timer(timerOptions, x => callbacks.push(x))
  }

  beforeEach(() => {
    callbacks = []
    timerOptions = {rateMilliseconds: 20, time: 50, countDown: true}
    createTimer()
  })

  afterEach(() => {
    timer.pause()
  })

  describe('on construction', () => {
    describe('with specified options', () => {
      it('should have the specified rateMilliseconds value', () => {
        assert.equal(timer.rateMilliseconds, timerOptions.rateMilliseconds)
      })

      it('should have the specified value', () => {
        assert.equal(timer.time, timerOptions.time)
      })

      it('should have a change value based on the specified countDown', () => {
        assert.equal(timer.change, -1)
      })
    })

    describe('with default options', () => {
      beforeEach(() => {
        timerOptions = {}
        createTimer()
      })

      it('should have the default rateMilliseconds value', () => {
        assert.equal(timer.rateMilliseconds, 1000)
      })

      it('should have the default time value', () => {
        assert.equal(timer.time, 0)
      })

      it('should have the default change value', () => {
        assert.equal(timer.change, 1)
      })
    })
  })

  describe('start', () => {
    it('should generate callbacks when counting down', done => {
      timer.start()
      setTimeout(() => {
        assert.equal(callbacks.join(','), '49,48')
        done()
      }, 50)
    })

    it('should generate callbacks when counting up', done => {
      timerOptions.countDown = false
      createTimer()

      timer.start()
      setTimeout(() => {
        assert.equal(callbacks.join(','), '51,52')
        done()
      }, 50)
    })
  })

  describe('pause', () => {
    it('should stop further callbacks from occuring', done => {
      timer.start()
      setTimeout(() => timer.pause(), 50)
      setTimeout(() => {
        assert.equal(callbacks.join(','), '49,48')
        done()
      }, 60)
    })
  })

  describe('reset', () => {
    it('should set a new time value when the timer is not running', () => {
      timer.reset(42)
      assert.equal(timer.time, 42)
    })

    it('should set a new time value when the timer is running', done => {
      timer.start()
      setTimeout(() => timer.reset(20), 50)
      setTimeout(() => {
        assert.equal(callbacks.join(','), '49,48,19,18')
        done()
      }, 90)
    })
  })
})
