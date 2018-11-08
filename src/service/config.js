const fs = require('fs')
const os = require('os')
const path = require('path')

const MOB_TIMER_PATH = path.join(os.homedir(), '.mob-timer')
const CONFIG_FILE = path.join(MOB_TIMER_PATH, 'config.json')

const DEFAULT_CONFIG = {
  alertSound: null,
  alertSoundTimes: [],
  mobbers: [],
  secondsPerTurn: 600,
  secondsUntilFullscreen: 30,
  snapThreshold: 0,
  timerAlwaysOnTop: true
}

let overrideFile

function init() {
  if (!fs.existsSync(MOB_TIMER_PATH)) {
    fs.mkdirSync(MOB_TIMER_PATH, 0o755)
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    write(DEFAULT_CONFIG)
  }
}

function getConfigFile() {
  return overrideFile || CONFIG_FILE
}

function read() {
  return fs.existsSync(getConfigFile())
    ? { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(getConfigFile(), 'utf-8')), snapThreshold: 0 }
    : DEFAULT_CONFIG
}

function write(config) {
  fs.writeFileSync(getConfigFile(), JSON.stringify(config, null, 2), { encoding: 'utf-8', mode: 0o644 })
}

function setConfigFile(filePath) {
  overrideFile = filePath
}

module.exports = {
  init,
  read,
  write,
  MOB_TIMER_PATH,
  CONFIG_FILE,
  DEFAULT_CONFIG,
  setConfigFile
}
