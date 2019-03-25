const fs = require('fs')
const assert = require('assert')

describe('Node versions', () => {
  const nvmrc = fs.readFileSync('./.nvmrc', 'utf-8')
  const travisYml = fs.readFileSync('./.travis.yml', 'utf-8')
  const packageJson = fs.readFileSync('./package.json', 'utf-8')

  it('.nvmrc should match .travis.yml', () => {
    const matches = travisYml.indexOf(`- "${nvmrc}"`) !== -1
    const message = [
      'Could not find node version from .nvmrc in .travis.yml!\n',
      '.nvmrc', nvmrc, '.travis.yml', travisYml]
    assert.ok(matches, message.join('\n'))
  })

  it('.nvmrc should match package.json engines node version', () => {
    const message = [
      'Could not find node version from .nvmrc in package.json!\n',
      '.nvmrc', nvmrc, 'package.json', packageJson]
    assert.strictEqual(JSON.parse(packageJson).engines.node, nvmrc, message)
  })
})
