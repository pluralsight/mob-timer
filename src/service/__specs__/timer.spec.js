const Timer = require('../timer')

describe('state/timer', () => {
  let subject
  let timerOptions
  let timerTicks

  const createTimer = () => {
    subject = new Timer(timerOptions)
  }

  beforeEach(() => {
    timerTicks = []
    timerOptions = { rateMilliseconds: 20, time: 50, countDown: true, onTick: value => timerTicks.push(value) }
    createTimer()
  })

  afterEach(() => {
    subject.pause()
  })

  describe('#constructor', () => {
    it('has the specified rateMilliseconds value', () => {
      expect(subject.rateMilliseconds).to.equal(timerOptions.rateMilliseconds)
    })

    it('has the specified value', () => {
      expect(subject.time).to.equal(timerOptions.time)
    })

    it('has a change value based on the specified countDown', () => {
      expect(subject.change).to.equal(-1)
    })

    describe('when no optional params are provided', () => {
      beforeEach(() => {
        timerOptions = { onTick: t => timerTicks.push(t) }
        createTimer()
      })

      it('has the rateMilliseconds value', () => {
        expect(subject.rateMilliseconds).to.equal(1000)
      })

      it('has the default time value', () => {
        expect(subject.time).to.equal(0)
      })

      it('has the default change value', () => {
        expect(subject.change).to.equal(1)
      })
    })
  })

  describe('#start', () => {
    it('ticks counting down', done => {
      subject.start()

      setTimeout(() => {
        expect(timerTicks.join(',')).to.equal('49,48')
        done()
      }, 50)
    })

    it('ticks counting up', done => {
      timerOptions.countDown = false
      createTimer()

      subject.start()

      setTimeout(() => {
        expect(timerTicks.join(',')).to.equal('51,52')
        done()
      }, 50)
    })
  })

  describe('#pause', () => {
    it('prevents ticks', done => {
      subject.start()

      setTimeout(() => subject.pause(), 50)

      setTimeout(() => {
        expect(timerTicks.join(',')).to.equal('49,48')
        done()
      }, 90)
    })
  })

  describe('#reset', () => {
    it('sets time when the timer is not running', () => {
      subject.reset(42)
      expect(subject.time).to.equal(42)
    })

    it('sets time when the timer is running', done => {
      subject.start()

      setTimeout(() => subject.reset(20), 50)

      setTimeout(() => {
        expect(timerTicks.join(',')).to.equal('49,48,19,18')
        done()
      }, 90)
    })
  })
})
