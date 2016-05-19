const electron = require('electron')
const app = electron.app

let timerWindow


app.on('ready', () => {
  createTimerWindow();
})


function createTimerWindow() {
  timerWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    //resizable: false,
    //alwaysOnTop: true,
    //frame: false
  });

  timerWindow.loadURL(`file://${__dirname}/timer/index.html`)
}
