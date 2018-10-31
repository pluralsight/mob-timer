const { DEFAULT_CONFIG } = require('../config')
const { ServiceEvents } = require('../../common/constants')
const TimerState = require('../timer-state')

describe('state/timer-state', () => {
  let subject
  let events

  const getEvent = eventName => events.find(e => e.event === eventName)

  beforeEach(() => {
    events = []
    subject = new TimerState()

    subject.setEventHandler((event, data) => {
      events.push({ event, data })
    })
  })

  describe('#initialize', () => {
    it('publishes a timerChange event', () => {
      subject.initialize()
      const event = getEvent(ServiceEvents.TimerChange)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ secondsRemaining: 600, secondsPerTurn: 600 })
    })

    it('publishes a rotated event', () => {
      subject.initialize()
      const event = getEvent(ServiceEvents.Rotated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ current: null, next: null })
    })

    it('publishes a turnEnded event', () => {
      subject.initialize()
      expect(getEvent(ServiceEvents.TurnEnded)).to.be.ok
    })

    it('publishes a configUpdated event', () => {
      subject.initialize()
      expect(getEvent(ServiceEvents.ConfigUpdated)).to.be.ok
    })
  })

  describe('#reset', () => {
    it('publish a timerChange event', () => {
      subject.reset()
      const event = getEvent(ServiceEvents.TimerChange)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ secondsRemaining: 600, secondsPerTurn: 600 })
    })
  })

  describe('#start', () => {
    it('starts the main timer', () => {
      subject.start()
      expect(subject.mainTimer.isRunning).to.be.true
    })

    it('publishes a started event', () => {
      subject.start()
      expect(getEvent(ServiceEvents.Started)).to.be.ok
    })

    it('publishes a stopAlerts event', () => {
      subject.start()
      expect(getEvent(ServiceEvents.StopAlerts)).to.be.ok
    })
  })

  describe('#pause', () => {
    it('publishes a paused event', () => {
      subject.pause()
      expect(getEvent(ServiceEvents.Paused)).to.be.ok
    })

    it('publishes a stopAlerts event', () => {
      subject.pause()
      expect(getEvent(ServiceEvents.StopAlerts)).to.be.ok
    })

    it('stops the main timer', () => {
      subject.start()
      expect(subject.mainTimer.isRunning).to.be.true

      subject.pause()
      expect(subject.mainTimer.isRunning).to.be.false
    })
  })

  describe('#mainTimer', () => {
    it('publishes a timerChange event when the timer ticks', () => {
      subject.mainTimer.tick(599)
      const event = getEvent(ServiceEvents.TimerChange)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ secondsRemaining: 599, secondsPerTurn: 600 })
    })

    it('publishes events when the time is up', () => {
      subject.mainTimer.tick(-1)
      expect(getEvent(ServiceEvents.TimerChange)).to.be.ok
      expect(getEvent(ServiceEvents.Paused)).to.be.ok
      expect(getEvent(ServiceEvents.Rotated)).to.be.ok
      const event = getEvent(ServiceEvents.Alert)

      expect(event).to.be.ok
      expect(event.data).to.equal(0)
    })

    it('starts the alertsTimer after the time is up', () => {
      expect(subject.alertsTimer.isRunning).to.be.false
      subject.mainTimer.tick(-1)
      expect(subject.alertsTimer.isRunning).to.be.true
    })

    it('publishes alert events after the time is up', () => {
      subject.alertsTimer.tick(1)
      const event = getEvent(ServiceEvents.Alert)

      expect(event).to.be.ok
      expect(event.data).to.equal(1)
    })
  })

  describe('#rotate', () => {
    let mobber
    let nextMobber
    let otherMobber

    beforeEach(() => {
      mobber = { id: 'mobber-1', name: 'Current Mobber' }
      nextMobber = { id: 'mobber-2', name: 'Next Mobber' }
      otherMobber = { id: 'mobber-3', name: 'Other Mobber' }
      subject.addMobber(otherMobber)
      subject.addMobber(mobber)
      subject.addMobber(nextMobber)

      events = []
    })

    it('publishes a rotated event', () => {
      subject.rotate()
      const event = getEvent(ServiceEvents.Rotated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ current: mobber, next: nextMobber })
    })

    it('publishes a timerChange event', () => {
      subject.rotate()
      const event = getEvent(ServiceEvents.TimerChange)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ secondsRemaining: 600, secondsPerTurn: 600 })
    })

    it('loops through the list', () => {
      subject.rotate()
      events = []

      subject.rotate()
      const event = getEvent(ServiceEvents.Rotated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ current: nextMobber, next: otherMobber })
    })
  })

  describe('#publishConfig', () => {
    it('publishes a configUpdated event', () => {
      subject.publishConfig()
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal(DEFAULT_CONFIG)
    })

    it('publishes a rotated event', () => {
      subject.publishConfig()
      expect(getEvent(ServiceEvents.Rotated)).to.be.ok
    })
  })

  describe('#addMobber', () => {
    const mobber = { id: 'mobber-1', name: 'A' }

    it('publishes a configUpdated event', () => {
      subject.addMobber(mobber)
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...DEFAULT_CONFIG, mobbers: [mobber] })
    })

    it('publishes a rotated event', () => {
      subject.addMobber(mobber)
      const event = getEvent(ServiceEvents.Rotated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ current: mobber, next: mobber })
    })
  })

  describe('#removeMobber', () => {
    let mobber1
    let mobber2
    let mobber3

    beforeEach(() => {
      mobber1 = { id: 'mobber-1', name: 'One' }
      mobber2 = { id: 'mobber-2', name: 'Two' }
      mobber3 = { id: 'mobber-3', name: 'Three' }
      subject.addMobber(mobber1)
      subject.addMobber(mobber2)
      subject.addMobber(mobber3)

      events = []
    })

    it('publishes a configUpdated event', () => {
      subject.removeMobber(mobber2.id)
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...DEFAULT_CONFIG, mobbers: [mobber1, mobber3] })
    })

    it('publishes a rotated event', () => {
      subject.removeMobber(mobber2.id)
      const event = getEvent(ServiceEvents.Rotated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ current: mobber1, next: mobber3 })
    })

    it('does not publish a turnEnded event', () => {
      subject.removeMobber(mobber2.id)
      expect(getEvent(ServiceEvents.TurnEnded)).to.not.be.ok
    })

    describe('when the current user is removed', () => {
      beforeEach(() => {
        subject.removeMobber(mobber3.id)
        events = []
      })

      it('publishes a turnEnded event', () => {
        subject.removeMobber(mobber1.id)
        expect(getEvent(ServiceEvents.TurnEnded)).to.be.ok
      })

      it('publishes a timerChange event', () => {
        subject.removeMobber(mobber1.id)
        expect(getEvent(ServiceEvents.TimerChange)).to.be.ok
      })

      it('publishes a paused event', () => {
        subject.removeMobber(mobber1.id)
        expect(getEvent(ServiceEvents.Paused)).to.be.ok
      })

      it('publishes a rotated event', () => {
        subject.removeMobber(mobber1.id)
        const event = getEvent(ServiceEvents.Rotated)

        expect(event).to.be.ok
        expect(event.data).to.deep.equal({ current: mobber2, next: mobber2 })
      })
    })
  })

  describe('#updateMobber', () => {
    const mobber = { id: 'mobber-1', name: 'Testerson' }

    beforeEach(() => {
      subject.addMobber(mobber)
      events = []
    })

    it('publishes a configUpdated event', () => {
      subject.updateMobber({ ...mobber, name: 'New Name' })
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...DEFAULT_CONFIG, mobbers: [{ ...mobber, name: 'New Name' }] })
    })
  })

  describe('#setSecondsPerTurn', () => {
    it('publishes a configUpdated event', () => {
      subject.setSecondsPerTurn(300)
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...DEFAULT_CONFIG, secondsPerTurn: 300 })
    })

    it('publishes a timerChange event', () => {
      subject.setSecondsPerTurn(300)
      const event = getEvent(ServiceEvents.TimerChange)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ secondsRemaining: 300, secondsPerTurn: 300 })
    })
  })

  describe('#setSecondsUntilFullscreen', () => {
    it('should publish a configUpdated event', () => {
      subject.setSecondsUntilFullscreen(5)
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...DEFAULT_CONFIG, secondsUntilFullscreen: 5 })
    })
  })

  describe('#setSnapThreshold', () => {
    it('should publish configUpdated event', () => {
      subject.setSnapThreshold(100)
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...DEFAULT_CONFIG, snapThreshold: 100 })
    })
  })

  describe('#setAlertSound', () => {
    it('should publish a configUpdated event', () => {
      subject.setAlertSound('new-sound.mp3')
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...DEFAULT_CONFIG, alertSound: 'new-sound.mp3' })
    })
  })

  describe('#setAlertSoundTimes', () => {
    beforeEach(() => subject.setAlertSoundTimes([1, 2, 3]))

    it('should publish a configUpdated event', () => {
      subject.setAlertSoundTimes([1, 2, 3])
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...DEFAULT_CONFIG, alertSoundTimes: [1, 2, 3] })
    })
  })

  describe('#setAlwaysOnTop', () => {
    it('should publish a configUpdated event', () => {
      subject.setTimerAlwaysOnTop(false)
      const event = getEvent(ServiceEvents.ConfigUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...DEFAULT_CONFIG, timerAlwaysOnTop: false })
    })
  })

  describe('#getState', () => {
    it('returns the state', () => {
      const state = subject.getState()
      expect(state).to.deep.equal(DEFAULT_CONFIG)
    })

    describe('when getting non-default state', () => {
      let expected

      beforeEach(() => {
        expected = {
          mobbers: [{ id: 'mobber-1', name: 'Jack' }, { id: 'mobber-2', name: 'Jill' }],
          secondsPerTurn: 599,
          secondsUntilFullscreen: 3,
          snapThreshold: 42,
          alertSound: 'alert.mp3',
          alertSoundTimes: [0, 15],
          timerAlwaysOnTop: false
        }

        subject.addMobber(expected.mobbers[0])
        subject.addMobber(expected.mobbers[1])
        subject.setSecondsPerTurn(expected.secondsPerTurn)
        subject.setSecondsUntilFullscreen(expected.secondsUntilFullscreen)
        subject.setSnapThreshold(expected.snapThreshold)
        subject.setAlertSound(expected.alertSound)
        subject.setAlertSoundTimes(expected.alertSoundTimes)
        subject.setTimerAlwaysOnTop(expected.timerAlwaysOnTop)
      })

      it('returns the expected state', () => {
        const actual = subject.getState()
        expect(actual).to.deep.equal(expected)
      })
    })
  })

  describe('#loadState', () => {
    it('loads the state', () => {
      const expected = {
        mobbers: [{ name: 'jack' }, { name: 'jill' }],
        secondsPerTurn: 400,
        secondsUntilFullscreen: 0,
        snapThreshold: 22,
        alertSound: 'bell.mp3',
        alertSoundTimes: [2, 3, 5, 8],
        timerAlwaysOnTop: false
      }

      subject.loadState(expected)
      const actual = subject.getState()

      expect(actual).to.deep.equal(expected)
    })

    describe('when empty state is provided', () => {
      it('should load default state', () => {
        subject.loadState({})
        const state = subject.getState()
        expect(state).to.deep.equal(DEFAULT_CONFIG)
      })
    })
  })
})
