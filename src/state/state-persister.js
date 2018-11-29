const fs = require('fs')
const os = require('os')
const path = require('path')

const mobTimerDir = path.join(os.homedir(), '.mob-timer')
const stateFile = path.join(mobTimerDir, 'state.json')
const oldStateFile = path.join(os.tmpdir(), 'state.json')

function read() {
  if (fs.existsSync(stateFile)) {
    return JSON.parse(fs.readFileSync(stateFile, 'utf-8'))
  }
  if (fs.existsSync(oldStateFile)) {
    return JSON.parse(fs.readFileSync(oldStateFile, 'utf-8'))
  }
  return {}
}

function write(state) {
  if (!fs.existsSync(mobTimerDir)) {
    fs.mkdirSync(mobTimerDir)
  }
  fs.writeFileSync(stateFile, JSON.stringify(state))
}

module.exports = {
  read,
  write,
  stateFile,
  oldStateFile,
  mobTimerDir
}
