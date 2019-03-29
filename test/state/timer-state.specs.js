let TimerState = require('../../src/state/timer-state')
let TestTimer = require('./test-timer')
let assert = require('assert')

describe('timer-state', () => {
  let timerState
  let events

  let assertEvent = eventName => {
    var event = events.find(x => x.event === eventName)
    assert(event, eventName + ' event not found')
    return event
  }

  beforeEach(() => {
    events = []
    timerState = new TimerState({ Timer: TestTimer })
    timerState.setCallback((event, data) => {
      events.push({ event, data })
    })
  })

  describe('initialize', () => {
    beforeEach(() => timerState.initialize())

    it('should publish a timerChange event', () => {
      var event = assertEvent('timerChange')
      assert.deepStrictEqual(event.data, {
        secondsRemaining: 600,
        secondsPerTurn: 600
      })
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.deepStrictEqual(event.data, { current: null, next: null })
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
      assert.deepStrictEqual(event.data, {
        secondsRemaining: 600,
        secondsPerTurn: 600
      })
    })
  })

  describe('start', () => {
    beforeEach(() => timerState.start())

    it('should start the mainTimer', function() {
      assert.strictEqual(timerState.mainTimer.isRunning, true)
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
      assert.deepStrictEqual(event.data, {
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
      assert.strictEqual(alertEvent.data, 0)
    })

    it('should start the alertsTimer after the timer is up', () => {
      assert.strictEqual(timerState.alertsTimer.isRunning, false)
      timerState.mainTimer.callback(-1)
      assert.strictEqual(timerState.alertsTimer.isRunning, true)
    })

    it('should publish alert events after the time is up', () => {
      timerState.alertsTimer.callback(1)
      var event = assertEvent('alert')
      assert.strictEqual(event.data, 1)
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
      assert.strictEqual(timerState.mainTimer.isRunning, true)

      timerState.pause()
      assert.strictEqual(timerState.mainTimer.isRunning, false)
    })
  })

  describe('rotate', () => {
    beforeEach(() => {
      timerState.addMobber({ name: 'A' })
      timerState.addMobber({ name: 'B' })
      timerState.addMobber({ name: 'C' })
      events = []
      timerState.rotate()
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.strictEqual(event.data.current.name, 'B', 'expected B to be current')
      assert.strictEqual(event.data.next.name, 'C', 'expected C to be next')
    })

    it('should publish a timerChange event', () => {
      var event = assertEvent('timerChange')
      assert.deepStrictEqual(event.data, {
        secondsRemaining: 600,
        secondsPerTurn: 600
      })
    })

    it('should wrap around at the end of the list', () => {
      events = []
      timerState.rotate()
      var event = assertEvent('rotated')
      assert.strictEqual(event.data.current.name, 'C', 'expected C to be current')
      assert.strictEqual(event.data.next.name, 'A', 'expected A to be next')
    })
  })

  describe('publishConfig', () => {
    beforeEach(() => timerState.publishConfig())

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepStrictEqual(event.data.mobbers, [])
      assert.strictEqual(event.data.secondsPerTurn, 600)
      assert.strictEqual(event.data.secondsUntilFullscreen, 30)
      assert.strictEqual(event.data.snapThreshold, 25)
      assert.strictEqual(event.data.alertSound, null)
      assert.deepStrictEqual(event.data.alertSoundTimes, [])
      assert.strictEqual(event.data.timerAlwaysOnTop, true)
      assert.strictEqual(event.data.shuffleMobbersOnStartup, false)
      assert.strictEqual(event.data.clearClipboardHistoryOnTurnEnd, false)
      assert.strictEqual(event.data.numberOfItemsClipboardHistoryStores, 25)
    })

    it('should contain the mobbers if there are some', () => {
      timerState.addMobber({ name: 'A' })
      timerState.addMobber({ name: 'B' })
      events = []

      timerState.publishConfig()
      var event = assertEvent('configUpdated')
      assert.strictEqual(event.data.mobbers[0].name, 'A')
      assert.strictEqual(event.data.mobbers[1].name, 'B')

      timerState.removeMobber({ name: 'A' })
      timerState.removeMobber({ name: 'B' })
    })

    it('should publish a rotated event', () => {
      assertEvent('rotated')
    })
  })

  describe('addMobber', () => {
    beforeEach(() => timerState.addMobber({ name: 'A' }))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.strictEqual(event.data.mobbers[0].name, 'A')
      assert.strictEqual(event.data.secondsPerTurn, 600)
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.strictEqual(event.data.current.name, 'A')
      assert.strictEqual(event.data.next.name, 'A')
    })
  })

  describe('removeMobber', () => {
    beforeEach(() => {
      timerState.addMobber({ name: 'A', id: 'a' })
      timerState.addMobber({ name: 'B', id: 'b' })
      timerState.addMobber({ name: 'C', id: 'c' })
      events = []
      timerState.removeMobber({ name: 'B', id: 'b' })
    })

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.strictEqual(event.data.mobbers[0].name, 'A')
      assert.strictEqual(event.data.mobbers[1].name, 'C')
      assert.strictEqual(event.data.secondsPerTurn, 600)
    })

    it('should publish a rotated event', () => {
      var event = assertEvent('rotated')
      assert.strictEqual(event.data.current.name, 'A')
      assert.strictEqual(event.data.next.name, 'C')
    })

    it('should NOT publish a turnEnded event if the removed user was NOT current', () => {
      var event = events.find(x => x.event === 'turnEnded')
      assert.strictEqual(event, undefined)
    })

    it('should publish a turnEnded event if the removed user was current', () => {
      timerState.removeMobber({ name: 'A' })
      assertEvent('turnEnded')
    })

    it('should publish a timerChange event if the removed user was current', () => {
      timerState.removeMobber({ name: 'A' })
      assertEvent('timerChange')
    })

    it('should publish a paused event if the removed user was current', () => {
      timerState.removeMobber({ name: 'A' })
      assertEvent('paused')
    })

    it('should update correctly if the removed user was current', () => {
      timerState.rotate()
      events = []
      timerState.removeMobber({ name: 'C', id: 'c' })
      var event = assertEvent('rotated')
      assert.strictEqual(event.data.current.name, 'A')
      assert.strictEqual(event.data.next.name, 'A')
    })
  })

  describe('updateMobber', () => {
    beforeEach(() => {
      timerState.addMobber({ id: 'a', name: 'A1' })
      events = []
      timerState.updateMobber({ id: 'a', name: 'A2' })
    })

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.strictEqual(event.data.mobbers[0].name, 'A2')
      assert.strictEqual(event.data.secondsPerTurn, 600)
    })

    it('should update correctly if the update disabled the current mobber', () => {
      timerState.addMobber({ id: 'b', name: 'B' })
      timerState.addMobber({ id: 'c', name: 'C' })
      timerState.rotate()
      events = []

      timerState.updateMobber({ id: 'b', name: 'B', disabled: true })

      assertEvent('paused')
      assertEvent('turnEnded')
      assertEvent('configUpdated')
      var rotatedEvent = assertEvent('rotated')
      assert.strictEqual(rotatedEvent.data.current.name, 'C')
      assert.strictEqual(rotatedEvent.data.next.name, 'A2')
      var timerChangeEvent = assertEvent('timerChange')
      assert.deepStrictEqual(timerChangeEvent.data, {
        secondsRemaining: 600,
        secondsPerTurn: 600
      })
    })
  })

  describe('shuffleMobbers', () => {
    beforeEach(() => {
      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
      letters.forEach(x => timerState.addMobber({ id: x }))
      events = []
      timerState.shuffleMobbers()
    })

    it('should publish a configUpdated event', () => assertEvent('configUpdated'))

    it('should publish a rotated event', () => assertEvent('rotated'))

    it('should shuffle the mobbers', () => {
      const mobbers = timerState.getState().mobbers.map(x => x.id).join('')
      assert.notStrictEqual(mobbers, 'abcdefghij')
    })
  })

  describe('setSecondsPerTurn', () => {
    beforeEach(() => timerState.setSecondsPerTurn(300))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.strictEqual(event.data.secondsPerTurn, 300)
    })

    it('should publish a timerChange event', () => {
      var event = assertEvent('timerChange')
      assert.deepStrictEqual(event.data, {
        secondsRemaining: 300,
        secondsPerTurn: 300
      })
    })
  })

  describe('setSecondsUntilFullscreen', () => {
    beforeEach(() => timerState.setSecondsUntilFullscreen(5))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.strictEqual(event.data.secondsUntilFullscreen, 5)
    })
  })

  describe('when setting snap threshold', () => {
    beforeEach(() => timerState.setSnapThreshold(100))

    it('should publish configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.strictEqual(event.data.snapThreshold, 100)
    })
  })

  describe('when setting the alert sound file', () => {
    beforeEach(() => timerState.setAlertSound('new-sound.mp3'))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.strictEqual(event.data.alertSound, 'new-sound.mp3')
    })
  })

  describe('when setting the alert sound times', () => {
    beforeEach(() => timerState.setAlertSoundTimes([1, 2, 3]))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepStrictEqual(event.data.alertSoundTimes, [1, 2, 3])
    })
  })

  describe('when setting the timer always on top', () => {
    beforeEach(() => timerState.setTimerAlwaysOnTop(false))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepStrictEqual(event.data.timerAlwaysOnTop, false)
    })
  })

  describe('when setting shuffle mobbers on startup', () => {
    beforeEach(() => timerState.setShuffleMobbersOnStartup(true))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepStrictEqual(event.data.shuffleMobbersOnStartup, true)
    })
  })

  describe('when setting clear clipboard history between turns', () => {
    beforeEach(() => timerState.setClearClipboardHistoryOnTurnEnd(true))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepStrictEqual(event.data.clearClipboardHistoryOnTurnEnd, true)
    })
  })

  describe('when setting number of items clipboard history stores', () => {
    beforeEach(() => timerState.setNumberOfItemsClipboardHistoryStores(10))

    it('should publish a configUpdated event', () => {
      var event = assertEvent('configUpdated')
      assert.deepStrictEqual(event.data.numberOfItemsClipboardHistoryStores, 10)
    })
  })

  describe('getState', () => {
    describe('when getting non-default state', () => {
      beforeEach(() => {
        timerState.addMobber(expectedJack)
        timerState.addMobber(expectedJill)
        timerState.setSecondsPerTurn(expectedSecondsPerTurn)
        timerState.setSecondsUntilFullscreen(expectedSecondsUntilFullscreen)
        timerState.setSnapThreshold(expectedSnapThreshold)
        timerState.setAlertSound(expectedAlertSound)
        timerState.setAlertSoundTimes(expectedAlertSoundTimes)
        timerState.setTimerAlwaysOnTop(expectedTimerAlwaysOnTop)
        timerState.setShuffleMobbersOnStartup(expectedShuffleMobbersOnStartup)
        timerState.setClearClipboardHistoryOnTurnEnd(expectedClearClipboardHistoryOnTurnEnd)
        timerState.setNumberOfItemsClipboardHistoryStores(expectedNumberOfItemsClipboardHistoryStores)

        result = timerState.getState()
      })

      it('should get correct mobbers', () => {
        var actualJack = result.mobbers.find(x => x.name === expectedJack.name)
        var actualJill = result.mobbers.find(x => x.name === expectedJill.name)

        assert.deepStrictEqual(expectedJack, actualJack)
        assert.deepStrictEqual(expectedJill, actualJill)
      })

      it('should get correct seconds per turn', () => {
        assert.strictEqual(result.secondsPerTurn, expectedSecondsPerTurn)
      })

      it('should get the correct seconds until fullscreen', () => {
        assert.strictEqual(result.secondsUntilFullscreen, expectedSecondsUntilFullscreen)
      })

      it('should get the correct seconds until fullscreen', () => {
        assert.strictEqual(result.snapThreshold, expectedSnapThreshold)
      })

      it('should get the correct alert sound', () => {
        assert.strictEqual(result.alertSound, expectedAlertSound)
      })

      it('should get the correct alert sound times', () => {
        assert.strictEqual(result.alertSoundTimes, expectedAlertSoundTimes)
      })

      it('should get the correct timer always on top', () => {
        assert.strictEqual(result.timerAlwaysOnTop, expectedTimerAlwaysOnTop)
      })

      it('should get the correct shuffle mobbers on startup', () => {
        assert.strictEqual(result.shuffleMobbersOnStartup, expectedShuffleMobbersOnStartup)
      })

      it('should get the correct clear clipboard history between turns', () => {
        assert.strictEqual(result.clearClipboardHistoryOnTurnEnd, expectedClearClipboardHistoryOnTurnEnd)
      })

      it('should get the correct number of items clipboard history stores', () => {
        assert.strictEqual(result.numberOfItemsClipboardHistoryStores, expectedNumberOfItemsClipboardHistoryStores)
      })

      let result = {}
      let expectedJack = { name: 'jack' }
      let expectedJill = { name: 'jill' }
      let expectedSecondsPerTurn = 599
      let expectedSecondsUntilFullscreen = 3
      let expectedSnapThreshold = 42
      let expectedAlertSound = 'alert.mp3'
      let expectedAlertSoundTimes = [0, 15]
      let expectedTimerAlwaysOnTop = false
      let expectedShuffleMobbersOnStartup = true
      let expectedClearClipboardHistoryOnTurnEnd = true
      let expectedNumberOfItemsClipboardHistoryStores = 13
    })

    describe('when getting default state', () => {
      beforeEach(() => (result = timerState.getState()))

      it('should get no mobbers', () => assert(result.mobbers.length === 0))
      it('should have a default secondsPerTurn greater than zero', () => assert(result.secondsPerTurn > 0))
      it('should have a default snapThreshold greater than zero', () => assert(result.snapThreshold > 0))
      it('should have a null alert sound', () => assert(result.alertSound === null))
      it('should have an empty array of alert sound times', () => assert.deepStrictEqual(result.alertSoundTimes, []))
      it('should have a default timerAlwaysOnTop', () => assert.deepStrictEqual(result.timerAlwaysOnTop, true))
      it('should have a default shuffleMobbersOnStartup', () => assert.strictEqual(result.shuffleMobbersOnStartup, false))
      it('should have a default clearClipboardHistoryOnTurnEnd', () => assert.strictEqual(result.clearClipboardHistoryOnTurnEnd, false))
      it('should have a default numberOfItemsClipboardHistoryStores', () => assert.strictEqual(result.numberOfItemsClipboardHistoryStores, 25))

      let result = {}
    })

    describe('when there is one mobber', () => {
      before(() => {
        timerState.addMobber(expectedJack)

        result = timerState.getState()
      })

      it('should get correct mobber', () => {
        var actualJack = result.mobbers.find(x => x.name === expectedJack.name)

        assert.deepStrictEqual(expectedJack, actualJack)
      })

      let result = {}
      let expectedJack = { name: 'jack' }
    })
  })

  describe('loadState', () => {
    describe('when loading state data', () => {
      before(() => {
        state = {
          mobbers: [{ name: 'jack' }, { name: 'jill' }],
          secondsPerTurn: 400,
          secondsUntilFullscreen: 0,
          snapThreshold: 22,
          alertSound: 'bell.mp3',
          alertSoundTimes: [2, 3, 5, 8],
          timerAlwaysOnTop: false,
          shuffleMobbersOnStartup: true,
          clearClipboardHistoryOnTurnEnd: true,
          numberOfItemsClipboardHistoryStores: 20
        }

        timerState.loadState(state)

        result = timerState.getState()
      })

      it('should load mobbers', () => assert.deepStrictEqual(result.mobbers, state.mobbers))
      it('should load secondsPerTurn', () => assert.strictEqual(result.secondsPerTurn, state.secondsPerTurn))
      it('should load secondsUntilFullscreen', () => assert.strictEqual(result.secondsUntilFullscreen, state.secondsUntilFullscreen))
      it('should load snapThreshold', () => assert.strictEqual(result.snapThreshold, state.snapThreshold))
      it('should load alertSound', () => assert.strictEqual(result.alertSound, state.alertSound))
      it('should load alertSoundTimes', () => assert.deepStrictEqual(result.alertSoundTimes, [2, 3, 5, 8]))
      it('should load timerAlwaysOnTop', () => assert.strictEqual(result.timerAlwaysOnTop, state.timerAlwaysOnTop))
      it('should load shuffleMobbersOnStartup', () => assert.strictEqual(result.shuffleMobbersOnStartup, state.shuffleMobbersOnStartup))
      it('should load clearClipboardHistoryOnTurnEnd', () => assert.strictEqual(result.clearClipboardHistoryOnTurnEnd, state.clearClipboardHistoryOnTurnEnd))
      it('should load numberOfItemsClipboardHistoryStores', () => assert.strictEqual(result.numberOfItemsClipboardHistoryStores, state.numberOfItemsClipboardHistoryStores))

      let result = {}
      let state = {}
    })

    describe('when loading an empty state', () => {
      before(() => {
        timerState.loadState({})

        result = timerState.getState()
      })

      it('should NOT load any mobbers', () => assert.strictEqual(result.mobbers.length, 0))
      it('should have a default secondsPerTurn greater than zero', () => assert(result.secondsPerTurn > 0))
      it('should have a default secondsUntilFullscreen greater than zero', () => assert(result.secondsUntilFullscreen > 0))
      it('should have a default snapThreshold greater than zero', () => assert(result.snapThreshold > 0))
      it('should have a null alertSound', () => assert.strictEqual(result.alertSound, null))
      it('should have an empty array of alertSoundTimes', () => assert.deepStrictEqual(result.alertSoundTimes, []))
      it('should have a default timerAlwaysOnTop', () => assert.strictEqual(result.timerAlwaysOnTop, true))
      it('should have a default shuffleMobbersOnStartup', () => assert.strictEqual(result.shuffleMobbersOnStartup, false))
      it('should have a default clearClipboardHistoryOnTurnEnd', () => assert.strictEqual(result.clearClipboardHistoryOnTurnEnd, false))
      it('should have a default numberOfItemsClipboardHistoryStores greater than zero', () => assert(result.numberOfItemsClipboardHistoryStores > 0))

      let result = {}
    })

    describe('when loading state with one mobber', () => {
      before(() => {
        state = {
          mobbers: [{ name: 'jack' }]
        }

        timerState.loadState(state)

        result = timerState.getState()
      })

      it('should load one mobber', () => assert.deepStrictEqual(state.mobbers, result.mobbers))

      let result = {}
      let state = {}
    })
  })
})
