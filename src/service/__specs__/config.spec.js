const fs = require('fs')

const subject = require('../config')
const sandbox = require('../../../test/sandbox')

describe('service/config', () => {
  let configDirExists
  let configFileExists

  beforeEach(() => {
    configDirExists = true
    configFileExists = true

    sandbox.stub(fs, 'existsSync')
      .withArgs(subject.MOB_TIMER_PATH).callsFake(() => configDirExists)
      .withArgs(subject.CONFIG_FILE).callsFake(() => configFileExists)
  })
  afterEach(() => {
    sandbox.restore()
  })

  describe('#init', () => {
    let expectedConfig

    beforeEach(() => {
      expectedConfig = JSON.stringify(subject.DEFAULT_CONFIG, null, 2)

      sandbox.stub(fs, 'mkdirSync')
      sandbox.stub(fs, 'writeFileSync')
    })

    it('ensures config file exists', () => {
      subject.init()

      expect(fs.existsSync).to.have.been.calledWithExactly(subject.MOB_TIMER_PATH)
      expect(fs.existsSync).to.have.been.calledWithExactly(subject.CONFIG_FILE)
    })

    describe('when config file does not exist', () => {
      beforeEach(() => {
        configFileExists = false
      })

      it('creates config file with default values', () => {
        subject.init()

        expect(fs.existsSync).to.have.been.calledWithExactly(subject.MOB_TIMER_PATH)
        expect(fs.mkdirSync).to.not.have.been.called
        expect(fs.existsSync).to.have.been.calledWithExactly(subject.CONFIG_FILE)
        expect(fs.writeFileSync).to.have.been.calledWithExactly(subject.CONFIG_FILE, expectedConfig, { encoding: 'utf-8', mode: 0o644 })
      })
    })

    describe('when config directory does not exist', () => {
      beforeEach(() => {
        configDirExists = false
        configFileExists = false
      })

      it('creates the directory and writes the config', () => {
        subject.init()

        expect(fs.existsSync).to.have.been.calledWithExactly(subject.MOB_TIMER_PATH)
        expect(fs.mkdirSync).to.have.been.calledWithExactly(subject.MOB_TIMER_PATH, 0o755)
        expect(fs.existsSync).to.have.been.calledWithExactly(subject.CONFIG_FILE)
        expect(fs.writeFileSync).to.have.been.calledWithExactly(subject.CONFIG_FILE, expectedConfig, { encoding: 'utf-8', mode: 0o644 })
      })
    })
  })

  describe('#read', () => {
    let expected

    beforeEach(() => {
      expected = { ...subject.DEFAULT_CONFIG, mobbers: [{ id: '1', name: 'derp' }] }
      sandbox.stub(fs, 'readFileSync').callsFake(() => JSON.stringify(expected))
    })

    it('returns the config', () => {
      const actual = subject.read()

      expect(actual).to.deep.equal(expected)
      expect(fs.existsSync).to.have.been.calledWithExactly(subject.CONFIG_FILE)
      expect(fs.readFileSync).to.have.been.calledWithExactly(subject.CONFIG_FILE, 'utf-8')
    })

    describe('when config does not exist', () => {
      beforeEach(() => {
        configFileExists = false
      })

      it('returns default config', () => {
        const actual = subject.read()

        expect(actual).to.deep.equal(subject.DEFAULT_CONFIG)
        expect(fs.existsSync).to.have.been.calledWithExactly(subject.CONFIG_FILE)
        expect(fs.readFileSync).to.not.have.been.called
      })
    })
  })

  describe('#write', () => {
    it('writes the config', () => {
      const expected = { mobbers: [] }
      sandbox.stub(fs, 'writeFileSync')

      subject.write(expected)

      expect(fs.writeFileSync).to.have.been.calledWithExactly(subject.CONFIG_FILE, JSON.stringify(expected, null, 2), { encoding: 'utf-8', mode: 0o644 })
    })
  })
})
