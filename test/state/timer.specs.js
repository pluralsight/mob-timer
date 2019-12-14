let Timer = require('../../src/state/timer')
let assert = require('assert')
const sinon = require('sinon')

describe('Timer', () => {
  let timer
  let timerOptions
  let callbacks
  let clock

  const mockDateNow = () => {
    let calls = 0
    return () => { calls++; return calls * 1000 }
  }

  let createTimer = () => {
    timer = new Timer(timerOptions, x => callbacks.push(x))
  }

  beforeEach(() => {
    callbacks = []
    timerOptions = { rateMilliseconds: 20, time: 50, countDown: true }
    createTimer()
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    timer.pause()
    clock.restore()
  })

  describe('on construction', () => {
    describe('with specified options', () => {
      it('should have the specified rateMilliseconds value', () => {
        assert.strictEqual(timer.rateMilliseconds, timerOptions.rateMilliseconds)
      })

      it('should have the specified value', () => {
        assert.strictEqual(timer.time, timerOptions.time)
      })

      it('should know if it is counting up or down based on the specified countDown', () => {
        assert.strictEqual(timer.countDown, true)
      })
    })

    describe('with default options', () => {
      beforeEach(() => {
        timerOptions = {}
        createTimer()
      })

      it('should have the default rateMilliseconds value', () => {
        assert.strictEqual(timer.rateMilliseconds, 1000)
      })

      it('should have the default time value', () => {
        assert.strictEqual(timer.time, 0)
      })

      it('should have the default countDown value', () => {
        assert.strictEqual(timer.countDown, false)
      })
    })
  })

  describe('start', () => {
    it('should generate callbacks when counting down', () => {
      timer.start(mockDateNow())
      clock.tick(50)
      assert.strictEqual(callbacks.join(','), '49,48')
    })

    it('should generate callbacks when counting up', () => {
      timerOptions.countDown = false
      createTimer()
      timer.start(mockDateNow())
      clock.tick(50)
      assert.strictEqual(callbacks.join(','), '51,52')
    })
  })

  describe('pause', () => {
    it('should stop further callbacks from occuring', () => {
      timer.start(mockDateNow())
      clock.tick(50)
      timer.pause()
      clock.tick(100)
      assert.strictEqual(callbacks.join(','), '49,48')
    })
  })

  describe('reset', () => {
    it('should set a new time value when the timer is not running', () => {
      timer.reset(42)
      assert.strictEqual(timer.time, 42)
    })

    it('should set a new time value when the timer is running', () => {
      const mockedNow = mockDateNow()
      timer.start(mockedNow)
      clock.tick(50)
      timer.reset(20, mockedNow)
      clock.tick(40)
      assert.strictEqual(callbacks.join(','), '49,48,19,18')
    })
  })
})
