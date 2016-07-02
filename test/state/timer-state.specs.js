let TimerState = require('../../src/state/timer-state')
let assert = require('assert')

describe('timer-state', () => {
  let timerState
  let events

  let assertEvent = (eventName) => {
    var event = events.find(x => x.event == eventName);
    assert(event, eventName + ' event not found')
    return event
  }

  beforeEach(() => {
    events = []
    timerState = new TimerState()
    timerState.setCallback((event, data) => {
      events.push({event, data})
    })
    timerState.setTestingSpeed(10)
  })

  afterEach(() => timerState.pause())

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

    it('should publish a started event', () => {
      assertEvent('started')
    })

    it('should publish a stopAlerts event', () => {
      assertEvent('stopAlerts')
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

    it('should publish alert events after the time is up', done => {
      timerState.setSecondsPerTurn(0)
      setTimeout(() => {
        timerState.setSecondsPerTurn(600)
        var event = assertEvent('alert')
        assert.equal(event.data, 1)
        done()
      }, 24)
    })
  })

  describe('pause', () => {
    beforeEach(() => timerState.pause())

    it('should publish a paused event', () => {
      assertEvent('paused')
    })

    it('should publish a stopAlerts event', () => {
      assertEvent('stopAlerts')
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

    it('should publish a rotated event', () => {
      assertEvent('rotated')
    })
  })

  describe('addMobber', () => {
    beforeEach(() => timerState.addMobber({name: 'A'}))

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

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.equal(event.data.secondsPerTurn, 300)
    })

    it('should publish a timerChange event', () => {
        var event = assertEvent('timerChange')
        assert.equal(event.data, 300)
    })
  })

  describe('when getting state', () => {
    before(() => {

      timerState.addMobber(expectedJack)
      timerState.addMobber(expectedJill)
      timerState.setSecondsPerTurn(expectedSecondsPerTurn)

      result = timerState.getState()
    })

    it('should get correct mobbers', () => {
      var actualJack = result.mobbers.find(x => x.name === expectedJack.name)
      var actualJill = result.mobbers.find(x => x.name === expectedJill.name)

      assert.deepEqual(expectedJack, actualJack)
      assert.deepEqual(expectedJill, actualJill)
    })

    it('should get correct seconds per turn', () => {
      assert.equal(result.secondsPerTurn, expectedSecondsPerTurn)
    })

    let result = {}
    let expectedJack = {name: 'jack'}
    let expectedJill = {name: 'jill'}
    let expectedSecondsPerTurn = 599
  })

  describe('when getting state and there are no mobbers', () => {
    before(() => result = timerState.getState())

    it('should get no mobbers', () => assert(result.mobbers.length === 0))

    let result = {}
  })

  describe('when getting state and there is one mobber', () => {
    before(() => {
      timerState.addMobber(expectedJack)

      result = timerState.getState()
    })

    it('should get correct mobber', () => {
      var actualJack = result.mobbers.find(x => x.name === expectedJack.name)

      assert.deepEqual(expectedJack, actualJack)
    })

    let result = {}
    let expectedJack = {name: 'jack'}
    let expectedJill = {name: 'jill'}
  })

  describe('when getting state and secondsPerTurn has not been set by user', () => {
    before(() => {
      result = timerState.getState()
    })

    it('should have a default that is greater than zero', () => assert(result.secondsPerTurn > 0))

    let result = {}
  })

  describe('when loading state', () => {
    before(() => {
      state = {
        mobbers: [jack, jill],
        secondsPerTurn: secondsPerTurn
      }

      timerState.loadState(state)

      result = timerState.getState()
    })

    it('should load mobbers', () => assert.deepEqual(state.mobbers, result.mobbers))
    it('should load secondsPerTurn', () => assert.equal(state.secondsPerTurn, result.secondsPerTurn))

    let result = {}
    let state = {}
    let jack = {name: 'jack'}
    let jill = {name: 'jill'}
    let secondsPerTurn = 400
  })

  describe('when loading state with NO mobbers', () => {
    before(() => {
      timerState.loadState(state)

      result = timerState.getState()
    })

    it('should NOT load any mobbers', () => assert.equal(result.mobbers.length, 0))

    let result = {}
    let state = {}
  })

  describe('when loading state with one mobber', () => {
    before(() => {
      state = {
        mobbers: [jack],
      }

      timerState.loadState(state)

      result = timerState.getState()
    })

    it('should load one mobber', () => assert.deepEqual(state.mobbers, result.mobbers))

    let result = {}
    let state = {}
    let jack = {name: 'jack'}
  })

  describe('when loading state with no secondsPerTurn', () => {
    before(() => {
      timerState.loadState(state)

      result = timerState.getState()
    })

    it('should have a default that is greater than zero', () => assert(result.secondsPerTurn > 0))

    let result = {}
    let state = {}
  })
})
