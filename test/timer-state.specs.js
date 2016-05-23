let timerState = require('../src/timer-state')
let assert = require('assert')

describe('timer-state', () => {
  let events
  timerState.setCallback((event, data) => {
    events.push({event, data})
  })
  timerState.setTestingSpeed(10)

  let assertEvent = (eventName) => {
    var event = events.find(x => x.event == eventName);
    assert(event, eventName + ' event not found')
    return event
  }

  beforeEach(() => {
    events = []
  })

  describe('initialize', () => {
    beforeEach(() => timerState.initialize())

    it('should publish a timerChange event', () => {
      var event = assertEvent('timerChange')
      assert.equal(event.data, 600)
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.deepEqual(event.data, { current: null, next: null })
    })

    it('should publish a turnEnded event', () => {
      assertEvent('turnEnded')
    })
  })

  describe('reset', () => {
    beforeEach(() => timerState.reset())

    it('should publish a timerChange event', () => {
      var event = assertEvent('timerChange')
      assert.equal(event.data, 600)
    })
  })

  describe('start', () => {
    beforeEach(() => timerState.start())
    afterEach(() => timerState.pause())

    it('should publish a started event', () => {
      assertEvent('started')
    })

    it('should publish a timerChange event after 1 second', done => {
      setTimeout(() => {
        var event = assertEvent('timerChange')
        assert.equal(event.data, 599)
        done()
      }, 12)
    })

    it('should publish events when the time is up', done => {
      timerState.setSecondsPerTurn(0)
      setTimeout(() => {
        timerState.setSecondsPerTurn(600)
        assertEvent('turnEnded')
        assertEvent('paused')
        assertEvent('rotated')
        done()
      }, 12)
    })
  })

  describe('pause', () => {
    beforeEach(() => timerState.pause())

    it('should publish a paused event', () => {
      assertEvent('paused')
    })

    it('should stop the timerChange events', done => {
      timerState.start();
      setTimeout(() => {
        timerState.pause()
      }, 12)
      setTimeout(() => {
        var count = events.filter(x => x.event == 'timerChange').length
        assert.equal(count, 1)
        done()
      }, 35)
    })
  })

  describe('rotate', () => {
    beforeEach(() => {
      timerState.addMobber({name: 'A'})
      timerState.addMobber({name: 'B'})
      timerState.addMobber({name: 'C'})
      events = []
      timerState.rotate()
    })
    afterEach(() => {
      timerState.removeMobber({name: 'A'})
      timerState.removeMobber({name: 'B'})
      timerState.removeMobber({name: 'C'})
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.equal(event.data.current.name, 'B', 'expected B to be current')
      assert.equal(event.data.next.name, 'C', 'expected C to be next')
    })

    it('should publish a timerChange event', () => {
      var event = assertEvent('timerChange')
      assert.equal(event.data, 600)
    })

    it('should wrap around at the end of the list', () => {
      events = []
      timerState.rotate()
      var event = assertEvent('rotated')
      assert.equal(event.data.current.name, 'C', 'expected C to be current')
      assert.equal(event.data.next.name, 'A', 'expected A to be next')
    })
  })

  describe('publishConfig', () => {
    beforeEach(() => timerState.publishConfig())

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepEqual(event.data.mobbers, [])
      assert.equal(event.data.secondsPerTurn, 600)
    })

    it('should contain the mobbers if there are some', () => {
      timerState.addMobber({name: 'A'})
      timerState.addMobber({name: 'B'})
      events = []
      timerState.publishConfig()
      var event = assertEvent('configUpdated')
      assert.deepEqual(event.data.mobbers, [
        {name: 'A'},
        {name: 'B'}
      ])
      timerState.removeMobber({name: 'A'})
      timerState.removeMobber({name: 'B'})
    })
  })

  describe('addMobber', () => {
    beforeEach(() => timerState.addMobber({name: 'A'}))
    afterEach(() => timerState.removeMobber({name: 'A'}))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepEqual(event.data.mobbers, [{name: 'A'}])
      assert.equal(event.data.secondsPerTurn, 600)
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.deepEqual(event.data, {
        current: {name: 'A'},
        next: {name: 'A'}
      })
    })
  })

  describe('removeMobber', () => {
    beforeEach(() => {
      timerState.addMobber({name: 'A'})
      timerState.addMobber({name: 'B'})
      timerState.addMobber({name: 'C'})
      events = []
      timerState.removeMobber({name: 'B'})
    })
    afterEach(() => {
      timerState.removeMobber({name: 'A'})
      timerState.removeMobber({name: 'C'})
    })

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepEqual(event.data.mobbers, [
        {name: 'A'},
        {name: 'C'}
      ])
      assert.equal(event.data.secondsPerTurn, 600)
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.deepEqual(event.data, {
        current: {name: 'A'},
        next: {name: 'C'}
      })
    })

    it('should NOT publish a turnEnded event if the removed user was NOT current', () => {
      var event = events.find(x => x.event == 'turnEnded');
      assert.equal(event, null)
    })

    it('should publish a turnEnded event if the removed user was current', () => {
      timerState.removeMobber({name: 'A'})
      var event = assertEvent('turnEnded')
    })

    it('should publish a timerChange event if the removed user was current', () => {
      timerState.removeMobber({name: 'A'})
      var event = assertEvent('timerChange')
    })

    it('should publish a paused event if the removed user was current', () => {
      timerState.removeMobber({name: 'A'})
      var event = assertEvent('paused')
    })

    it('should update correctly if the removed user was current', () => {
      timerState.rotate()
      events = []
      timerState.removeMobber({name: 'C'})
      var event = assertEvent('rotated')
      assert.equal(event.data.current.name, 'A');
      assert.equal(event.data.next.name, 'A');
    })
  })

  describe('setSecondsPerTurn', () => {
    beforeEach(() => timerState.setSecondsPerTurn(300))
    afterEach(() => timerState.setSecondsPerTurn(600))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.equal(event.data.secondsPerTurn, 300)
    })

    it('should publish a timerChange event', () => {
        var event = assertEvent('timerChange')
        assert.equal(event.data, 300)
    })
  })
})
