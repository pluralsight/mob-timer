const os = require("os");
const path = require("path");

const mobTimerDir = path.join(os.homedir(), ".mob-timer");
const stateFile = path.join(mobTimerDir, "state.json");
const oldStateFile = path.join(os.tmpdir(), "state.json");

module.exports = {
  stateFile,
  oldStateFile,
  mobTimerDir
};
