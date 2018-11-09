const config = require('../config')
const { DefaultMobber, ServiceEvents } = require('../../common/constants')
const sandbox = require('../../../test/sandbox')
const TimerState = require('../timer-state')

describe('service/timer-state', () => {
  let subject
  let events

  const captureEvent = (event, data) => events.push({ event, data })
  const getEvent = event => events.find(e => e.event === event)

  beforeEach(() => {
    events = []

    sandbox.stub(config, 'read').returns(config.DEFAULT_CONFIG)
    sandbox.stub(config, 'write')

    subject = new TimerState()
    subject.onEvent(captureEvent)
  })

  afterEach(() => sandbox.restore())

  describe('#persist', () => {
    it('writes the config', () => {
      subject.persist()
      expect(config.write).to.have.been.calledWithExactly(config.DEFAULT_CONFIG)
    })

    it('emits a stateUpdated event', () => {
      subject.persist()
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal(config.DEFAULT_CONFIG)
    })

    it('emits a rotated event', () => {
      subject.persist()
      expect(getEvent(ServiceEvents.Rotated)).to.be.ok
    })
  })

  describe('#initialize', () => {
    it('emits a timerChange event', () => {
      subject.initialize()
      const event = getEvent(ServiceEvents.TimerChange)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ secondsRemaining: 600, secondsPerTurn: 600 })
    })

    it('emits a rotated event', () => {
      subject.initialize()
      const event = getEvent(ServiceEvents.Rotated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ current: DefaultMobber, next: DefaultMobber })
    })

    it('emits a turnEnded event', () => {
      subject.initialize()
      expect(getEvent(ServiceEvents.TurnEnded)).to.be.ok
    })

    it('emits a stateUpdated event', () => {
      subject.initialize()
      expect(getEvent(ServiceEvents.StateUpdated)).to.be.ok
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
    afterEach(() => {
      subject.pause()
    })

    it('starts the main timer', () => {
      subject.start()
      expect(subject.mainTimer.isRunning).to.be.true
    })

    it('emits a started event', () => {
      subject.start()
      expect(getEvent(ServiceEvents.Started)).to.be.ok
    })

    it('emits a stopAlerts event', () => {
      subject.start()
      expect(getEvent(ServiceEvents.StopAlerts)).to.be.ok
    })
  })

  describe('#pause', () => {
    it('emits a paused event', () => {
      subject.pause()
      expect(getEvent(ServiceEvents.Paused)).to.be.ok
    })

    it('emits a stopAlerts event', () => {
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
    afterEach(() => {
      subject.pause()
    })

    it('emits a timerChange event when the timer ticks', () => {
      subject.mainTimer.tick(599)
      const event = getEvent(ServiceEvents.TimerChange)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ secondsRemaining: 599, secondsPerTurn: 600 })
    })

    it('emits events when the time is up', () => {
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

    it('emits alert events after the time is up', () => {
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
      mobber = { id: 'mobber-1', name: 'Current Mobber', image: '/path/to/image' }
      nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/next-image' }
      otherMobber = { id: 'mobber-3', name: 'Other Mobber', image: '/path/to/other-image' }
      subject.addMobber(otherMobber)
      subject.addMobber(mobber)
      subject.addMobber(nextMobber)

      events = []
    })

    it('emits a rotated event', () => {
      subject.rotate()
      const event = getEvent(ServiceEvents.Rotated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ current: mobber, next: nextMobber })
    })

    it('emits a timerChange event', () => {
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

  describe('#addMobber', () => {
    const mobber = { id: 'mobber-1', name: 'A', image: '/path/to/image' }

    it('emits a stateUpdated event', () => {
      subject.addMobber(mobber)
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...config.DEFAULT_CONFIG, mobbers: [mobber] })
    })

    it('emits a rotated event', () => {
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
      mobber1 = { id: 'mobber-1', name: 'One', image: '/path/to/image-one' }
      mobber2 = { id: 'mobber-2', name: 'Two', image: '/path/to/image-two' }
      mobber3 = { id: 'mobber-3', name: 'Three', image: '/path/to/image-three' }
      subject.addMobber(mobber1)
      subject.addMobber(mobber2)
      subject.addMobber(mobber3)

      events = []
    })

    it('emits a stateUpdated event', () => {
      subject.removeMobber(mobber2.id)
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...config.DEFAULT_CONFIG, mobbers: [mobber1, mobber3] })
    })

    it('emits a rotated event', () => {
      subject.removeMobber(mobber2.id)
      const event = getEvent(ServiceEvents.Rotated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ current: mobber1, next: mobber3 })
    })

    it('does not emit a turnEnded event', () => {
      subject.removeMobber(mobber2.id)
      expect(getEvent(ServiceEvents.TurnEnded)).to.not.be.ok
    })

    describe('when the current user is removed', () => {
      beforeEach(() => {
        subject.removeMobber(mobber3.id)
        events = []
      })

      it('emits a turnEnded event', () => {
        subject.removeMobber(mobber1.id)
        expect(getEvent(ServiceEvents.TurnEnded)).to.be.ok
      })

      it('emits a timerChange event', () => {
        subject.removeMobber(mobber1.id)
        expect(getEvent(ServiceEvents.TimerChange)).to.be.ok
      })

      it('emits a paused event', () => {
        subject.removeMobber(mobber1.id)
        expect(getEvent(ServiceEvents.Paused)).to.be.ok
      })

      it('emits a rotated event', () => {
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

    it('emits a stateUpdated event', () => {
      subject.updateMobber({ ...mobber, name: 'New Name' })
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...config.DEFAULT_CONFIG, mobbers: [{ ...mobber, name: 'New Name' }] })
    })
  })

  describe('#setSecondsPerTurn', () => {
    it('emits a stateUpdated event', () => {
      subject.setSecondsPerTurn(300)
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...config.DEFAULT_CONFIG, secondsPerTurn: 300 })
    })

    it('emits a timerChange event', () => {
      subject.setSecondsPerTurn(300)
      const event = getEvent(ServiceEvents.TimerChange)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ secondsRemaining: 300, secondsPerTurn: 300 })
    })
  })

  describe('#setSecondsUntilFullscreen', () => {
    it('emits a stateUpdated event', () => {
      subject.setSecondsUntilFullscreen(5)
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...config.DEFAULT_CONFIG, secondsUntilFullscreen: 5 })
    })
  })

  describe('#setSnapThreshold', () => {
    it('emits a stateUpdated event', () => {
      subject.setSnapThreshold(100)
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...config.DEFAULT_CONFIG, snapThreshold: 100 })
    })
  })

  describe('#setAlertSound', () => {
    it('emits a stateUpdated event', () => {
      subject.setAlertSound('new-sound.mp3')
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...config.DEFAULT_CONFIG, alertSound: 'new-sound.mp3' })
    })
  })

  describe('#setAlertSoundTimes', () => {
    beforeEach(() => subject.setAlertSoundTimes([1, 2, 3]))

    it('emits a stateUpdated event', () => {
      subject.setAlertSoundTimes([1, 2, 3])
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...config.DEFAULT_CONFIG, alertSoundTimes: [1, 2, 3] })
    })
  })

  describe('#setAlwaysOnTop', () => {
    it('emits a stateUpdated event', () => {
      subject.setTimerAlwaysOnTop(false)
      const event = getEvent(ServiceEvents.StateUpdated)

      expect(event).to.be.ok
      expect(event.data).to.deep.equal({ ...config.DEFAULT_CONFIG, timerAlwaysOnTop: false })
    })
  })

  describe('#getState', () => {
    it('returns the state', () => {
      const state = subject.getState()
      expect(state).to.deep.equal(config.DEFAULT_CONFIG)
    })

    describe('when getting non-default state', () => {
      let expected

      beforeEach(() => {
        expected = {
          mobbers: [
            { id: 'mobber-1', name: 'Jack', image: '/path/to/jack' },
            { id: 'mobber-2', name: 'Jill', image: '/path/to/jill' }
          ],
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
})
