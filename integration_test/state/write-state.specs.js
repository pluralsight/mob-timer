let fs = require('fs')
let assert = require('assert')

describe('when writing state', () => {
  before(() => {
    classUnderTest.setStateFilePath(filePath)
    classUnderTest.write(state)

    fileData = getFileData(classUnderTest.getStateFilePath())
  })

  after(() => {
    deleteFile(filePath)
  })

  it('should write state data to disc', () => assert.deepEqual(fileData, state))

  let state = {some: 'state'}
  let fileData = {}
  let filePath = __dirname + '/testing-state.json' + Date.now()

  let classUnderTest = require('../../src/state/write-state')
})

function fileExists(filePath) {
  return fs.accessSync(filePath, fs.R_OK)
}

function getFileData(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function deleteFile(filePath) {
  fs.unlinkSync(filePath)
}
