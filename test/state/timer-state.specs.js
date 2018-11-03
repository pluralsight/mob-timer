let TimerState = require('../../src/state/timer-state')
let TestTimer = require('./test-timer')
let assert = require('assert')

describe('timer-state', () => {
  let timerState
  let events

  let assertEvent = (eventName) => {
    var event = events.find(x => x.event == eventName)
    assert(event, eventName + ' event not found')
    return event
  }

  beforeEach(() => {
    events = []
    timerState = new TimerState({ Timer: TestTimer })
    timerState.setCallback((event, data) => {
      events.push({event, data})
    })
  })

  describe('initialize', () => {
    beforeEach(() => timerState.initialize())

    it('should publish a timerChange event', () => {
      var event = assertEvent('timerChange')
      assert.deepEqual(event.data, {
        secondsRemaining: 600,
        secondsPerTurn: 600
      })
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.deepEqual(event.data, { current: null, next: null })
    })

    it('should publish a turnEnded event', () => {
      assertEvent('turnEnded')
    })

    it('should publish a configUpdated event', () => {
      assertEvent('configUpdated')
    })
  })

  describe('reset', () => {
    beforeEach(() => timerState.reset())

    it('should publish a timerChange event', () => {
      var event = assertEvent('timerChange')
      assert.deepEqual(event.data, {
        secondsRemaining: 600,
        secondsPerTurn: 600
      })
    })
  })

  describe('start', () => {
    beforeEach(() => timerState.start())

    it('should start the mainTimer', function () {
      assert.equal(timerState.mainTimer.isRunning, true)
    })

    it('should publish a started event', () => {
      assertEvent('started')
    })

    it('should publish a stopAlerts event', () => {
      assertEvent('stopAlerts')
    })

    it('should publish a timerChange event when the timer calls back', () => {
      timerState.mainTimer.callback(599)
      var event = assertEvent('timerChange')
      assert.deepEqual(event.data, {
        secondsRemaining: 599,
        secondsPerTurn: 600
      })
    })

    it('should publish events when the time is up', () => {
      timerState.mainTimer.callback(-1)
      assertEvent('turnEnded')
      assertEvent('paused')
      assertEvent('rotated')
      var alertEvent = assertEvent('alert')
      assert.equal(alertEvent.data, 0)
    })

    it('should start the alertsTimer after the timer is up', () => {
      assert.equal(timerState.alertsTimer.isRunning, false)
      timerState.mainTimer.callback(-1)
      assert.equal(timerState.alertsTimer.isRunning, true)
    })

    it('should publish alert events after the time is up', () => {
      timerState.alertsTimer.callback(1)
      var event = assertEvent('alert')
      assert.equal(event.data, 1)
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

    it('should stop the mainTimer', () => {
      timerState.start()
      assert.equal(timerState.mainTimer.isRunning, true)

      timerState.pause()
      assert.equal(timerState.mainTimer.isRunning, false)
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
      assert.deepEqual(event.data, {
        secondsRemaining: 600,
        secondsPerTurn: 600
      })
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
      assert.equal(event.data.secondsUntilFullscreen, 30)
      assert.equal(event.data.snapThreshold, 25)
      assert.equal(event.data.alertSound, null)
      assert.deepEqual(event.data.alertSoundTimes, [])
    })

    it('should contain the mobbers if there are some', () => {
      timerState.addMobber({name: 'A'})
      timerState.addMobber({name: 'B'})
      events = []

      timerState.publishConfig()
      var event = assertEvent('configUpdated')
      assert.equal(event.data.mobbers[0].name, 'A')
      assert.equal(event.data.mobbers[1].name, 'B')

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
      assert.equal(event.data.mobbers[0].name, 'A')
      assert.equal(event.data.secondsPerTurn, 600)
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.equal(event.data.current.name, 'A')
      assert.equal(event.data.next.name, 'A')
    })
  })

  describe('removeMobber', () => {
    beforeEach(() => {
      timerState.addMobber({name: 'A', id: 'a'})
      timerState.addMobber({name: 'B', id: 'b'})
      timerState.addMobber({name: 'C', id: 'c'})
      events = []
      timerState.removeMobber({name: 'B', id: 'b'})
    })

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.equal(event.data.mobbers[0].name, 'A')
      assert.equal(event.data.mobbers[1].name, 'C')
      assert.equal(event.data.secondsPerTurn, 600)
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.equal(event.data.current.name, 'A')
      assert.equal(event.data.next.name, 'C')
    })

    it('should NOT publish a turnEnded event if the removed user was NOT current', () => {
      var event = events.find(x => x.event == 'turnEnded')
      assert.equal(event, null)
    })

    it('should publish a turnEnded event if the removed user was current', () => {
      timerState.removeMobber({name: 'A'})
      assertEvent('turnEnded')
    })

    it('should publish a timerChange event if the removed user was current', () => {
      timerState.removeMobber({name: 'A'})
      assertEvent('timerChange')
    })

    it('should publish a paused event if the removed user was current', () => {
      timerState.removeMobber({name: 'A'})
      assertEvent('paused')
    })

    it('should update correctly if the removed user was current', () => {
      timerState.rotate()
      events = []
      timerState.removeMobber({name: 'C', id: 'c'})
      var event = assertEvent('rotated')
      assert.equal(event.data.current.name, 'A')
      assert.equal(event.data.next.name, 'A')
    })
  })

  describe('updateMobber', () => {
    beforeEach(() => {
      timerState.addMobber({id: 'a', name: 'A1'})
      events = []
      timerState.updateMobber({id: 'a', name: 'A2'})
    })

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.equal(event.data.mobbers[0].name, 'A2')
      assert.equal(event.data.secondsPerTurn, 600)
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
        assert.deepEqual(event.data, {
          secondsRemaining: 300,
          secondsPerTurn: 300
        })
    })
  })

  describe('setSecondsUntilFullscreen', () => {
    beforeEach(() => timerState.setSecondsUntilFullscreen(5))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.equal(event.data.secondsUntilFullscreen, 5)
    })
  })

  describe('when setting snap threshold', () => {
    beforeEach(() => timerState.setSnapThreshold(100))

    it('should publish configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.equal(event.data.snapThreshold, 100)
    })
  })

  describe('when setting the alert sound file', () => {
    beforeEach(() => timerState.setAlertSound('new-sound.mp3'))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.equal(event.data.alertSound, 'new-sound.mp3')
    })
  })

  describe('when setting the alert sound times', () => {
    beforeEach(() => timerState.setAlertSoundTimes([1, 2, 3]))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepEqual(event.data.alertSoundTimes, [1, 2, 3])
    })
  })

  describe('when setting the timer always on top', () => {
    beforeEach(() => timerState.setTimerAlwaysOnTop(false))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepEqual(event.data.timerAlwaysOnTop, false)
    })
  })

  describe('getState', () => {
    describe('when getting non-default state', () => {
      before(() => {

        timerState.addMobber(expectedJack)
        timerState.addMobber(expectedJill)
        timerState.setSecondsPerTurn(expectedSecondsPerTurn)
        timerState.setSecondsUntilFullscreen(expectedSecondsUntilFullscreen)
        timerState.setSnapThreshold(expectedSnapThreshold)
        timerState.setAlertSound(expectedAlertSound)
        timerState.setAlertSoundTimes(expectedAlertSoundTimes)
        timerState.setTimerAlwaysOnTop(expectedTimerAlwaysOnTop)

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

      it('should get the correct seconds until fullscreen', () => {
        assert.equal(result.secondsUntilFullscreen, expectedSecondsUntilFullscreen)
      })

      it('should get the correct seconds until fullscreen', () => {
        assert.equal(result.snapThreshold, expectedSnapThreshold)
      })

      it('should get the correct alert sound', () => {
        assert.equal(result.alertSound, expectedAlertSound)
      })

      it('should get the correct alert sound times', () => {
        assert.equal(result.alertSoundTimes, expectedAlertSoundTimes)
      })

      it('should get the correct timer always on top', () => {
        assert.equal(result.timerAlwaysOnTop, expectedTimerAlwaysOnTop)
      })

      let result = {}
      let expectedJack = {name: 'jack'}
      let expectedJill = {name: 'jill'}
      let expectedSecondsPerTurn = 599
      let expectedSecondsUntilFullscreen = 3
      let expectedSnapThreshold = 42
      let expectedAlertSound = 'alert.mp3'
      let expectedAlertSoundTimes = [0, 15]
      let expectedTimerAlwaysOnTop = false
    })

    describe('when getting default state', () => {
      before(() => result = timerState.getState())

      it('should get no mobbers', () => assert(result.mobbers.length === 0))
      it('should have a default secondsPerTurn greater than zero', () => assert(result.secondsPerTurn > 0))
      it('should have a default snapThreshold greater than zero', () => assert(result.snapThreshold > 0))
      it('should have a null alert sound', () => assert(result.alertSound === null))
      it('should have an empty array of alert sound times', () => assert.deepEqual(result.alertSoundTimes, []))
      it('should have a default timerAlwaysOnTop', () => assert.deepEqual(result.timerAlwaysOnTop, true))

      let result = {}
    })

    describe('when there is one mobber', () => {
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
    })
  })

  describe('loadState', () => {
    describe('when loading state data', () => {
      before(() => {
        state = {
          mobbers: [{name: 'jack'}, {name: 'jill'}],
          secondsPerTurn: 400,
          secondsUntilFullscreen: 0,
          snapThreshold: 22,
          alertSound: 'bell.mp3',
          alertSoundTimes: [2, 3, 5, 8],
          timerAlwaysOnTop: false
        }

        timerState.loadState(state)

        result = timerState.getState()
      })

      it('should load mobbers', () => assert.deepEqual(result.mobbers, state.mobbers))
      it('should load secondsPerTurn', () => assert.equal(result.secondsPerTurn, state.secondsPerTurn))
      it('should load secondsUntilFullscreen', () => assert.equal(result.secondsUntilFullscreen, state.secondsUntilFullscreen))
      it('should load snapThreshold', () => assert.equal(result.snapThreshold, state.snapThreshold))
      it('should load alertSound', () => assert.equal(result.alertSound, state.alertSound))
      it('should load alertSoundTimes', () => assert.deepEqual(result.alertSoundTimes, [2, 3, 5, 8]))
      it('should load timerAlwaysOnTop', () => assert.equal(result.timerAlwaysOnTop, state.timerAlwaysOnTop))

      let result = {}
      let state = {}
    })

    describe('when loading an empty state', () => {
      before(() => {
        timerState.loadState({})

        result = timerState.getState()
      })

      it('should NOT load any mobbers', () => assert.equal(result.mobbers.length, 0))
      it('should have a default secondsPerTurn greater than zero', () => assert(result.secondsPerTurn > 0))
      it('should have a default secondsUntilFullscreen greater than zero', () => assert(result.secondsUntilFullscreen > 0))
      it('should have a default snapThreshold greater than zero', () => assert(result.snapThreshold > 0))
      it('should have a null alertSound', () => assert.strictEqual(result.alertSound, null))
      it('should have an empty array of alertSoundTimes', () => assert.deepEqual(result.alertSoundTimes, []))
      it('should have a default timerAlwaysOnTop', () => assert.equal(result.timerAlwaysOnTop, true))

      let result = {}
    })

    describe('when loading state with one mobber', () => {
      before(() => {
        state = {
          mobbers: [{name: 'jack'}],
        }

        timerState.loadState(state)

        result = timerState.getState()
      })

      it('should load one mobber', () => assert.deepEqual(state.mobbers, result.mobbers))

      let result = {}
      let state = {}
    })
  })
})
