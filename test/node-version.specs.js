const fs = require('fs')
const assert = require('assert')
const electronReleases = require('electron-releases/lite.json')
const packageJson = require('../package.json')
const packageLockJson = require('../package-lock.json')

describe('Node versions', () => {
  const { electronVersion, nodeVersion } = getMatchingElectronReleaseInfo()

  it(`should find node version used by electron (${electronVersion})`, () => {
    assert.ok(nodeVersion.length, `Found: ${nodeVersion}`)
  })

  it(`should find node version ${nodeVersion} in .nvmrc`, () => {
    const nvmrc = fs.readFileSync('./.nvmrc', 'utf-8')
    assert.strictEqual(nvmrc, nodeVersion)
  })

  it(`should find node version ${nodeVersion} in .travis.yml`, () => {
    const travisYml = fs.readFileSync('./.travis.yml', 'utf-8')
    const matches = travisYml.indexOf(`- "${nodeVersion}"`) !== -1
    const failMessage = [
      `Could not find node version ${nodeVersion} in .travis.yml!`,
      travisYml
    ]
    assert.ok(matches, failMessage.join('\n'))
  })

  it(`should find engines node version ${nodeVersion} in package.json`, () => {
    assert.strictEqual(packageJson.engines.node, nodeVersion)
  })
})

function getMatchingElectronReleaseInfo() {
  const electronVersion = packageLockJson.dependencies.electron.version
  const exactMatchElectronRelease = electronReleases.find(release =>
    release.version === electronVersion)
  const majorVersionElectronRelease = electronReleases.find(release =>
    release.version[ 0 ] === electronVersion[ 0 ])
  const foundRelease = exactMatchElectronRelease || majorVersionElectronRelease
  return { electronVersion: foundRelease.version, nodeVersion: foundRelease.deps.node }
}
