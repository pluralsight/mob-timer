const fs = require('fs')
const assert = require('assert')
const electronReleases = require('electron-releases/lite.json')
const packageJson = require('../package.json')
const packageLockJson = require('../package-lock.json')

describe('Node versions', () => {
  const nodeVersionUsedByElectron = getNodeVersionUsedByElectron()

  it(`should find node version used by electron`, () => {
    assert.ok(nodeVersionUsedByElectron.length, `Found: ${nodeVersionUsedByElectron}`)
  })

  it(`should find node version ${nodeVersionUsedByElectron} in .nvmrc`, () => {
    const nvmrc = fs.readFileSync('./.nvmrc', 'utf-8')
    assert.strictEqual(nvmrc, nodeVersionUsedByElectron)
  })

  it(`should find node version ${nodeVersionUsedByElectron} in .travis.yml`, () => {
    const travisYml = fs.readFileSync('./.travis.yml', 'utf-8')
    const matches = travisYml.indexOf(`- "${nodeVersionUsedByElectron}"`) !== -1
    const failMessage = [
      `Could not find node version ${nodeVersionUsedByElectron} in .travis.yml!`,
      travisYml
    ]
    assert.ok(matches, failMessage.join('\n'))
  })

  it(`should find engines node version ${nodeVersionUsedByElectron} in package.json`, () => {
    assert.strictEqual(packageJson.engines.node, nodeVersionUsedByElectron)
  })
})

function getNodeVersionUsedByElectron() {
  const electronVersion = packageLockJson.dependencies.electron.version
  const electronRelease = electronReleases.find(release =>
    release.version === electronVersion)
  return electronRelease.deps.node
}
