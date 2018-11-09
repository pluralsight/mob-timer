const fs = require('fs')
const path = require('path')

const subject = require('../config')

describe('service/config', () => {
  describe('when persisting config', () => {
    let overrideFile
    let testConfig

    before(() => {
      overrideFile = path.join(__dirname, `test-config-${Date.now()}.json`)
      subject.setConfigFile(overrideFile)

      testConfig = { some: 'config' }
      subject.write(testConfig)
    })

    after(() => {
      fs.unlinkSync(overrideFile)
      subject.setConfigFile(null)
    })

    it('writes the config to file', () => expect(subject.read()).to.deep.equal({ ...subject.DEFAULT_CONFIG, ...testConfig }))
  })
})
