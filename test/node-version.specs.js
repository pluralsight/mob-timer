const fs = require('fs')
const assert = require('assert')

describe('Node version', () => {
  it('.nvmrc should match .travis.yml', () => {
    const nvmrc = fs.readFileSync('./.nvmrc', 'utf-8')
    const travisYml = fs.readFileSync('./.travis.yml', 'utf-8')

    const matches = travisYml.indexOf(`  - "${nvmrc}"`) !== -1
    const message = [
      'Could not find node version from .nvmrc in .travis.yml!\n',
      '.nvmrc', nvmrc, '.travis.yml', travisYml]
    assert.ok(matches, message.join('\n'))
  })
})
