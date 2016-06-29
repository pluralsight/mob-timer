const electron = require('electron')

let timerWindow, configWindow, fullscreenWindow

exports.createTimerWindow = () => {
  let {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  timerWindow = new electron.BrowserWindow({
    x: width - 200,
    y: height - 100,
    width: 200,
    height: 100,
    resizable: false,
    alwaysOnTop: true,
    frame: false
  });

  timerWindow.loadURL(`file://${__dirname}/timer/index.html`)
  timerWindow.on('closed', _ => timerWindow = null)
}

exports.showConfigWindow = () => {
  if (configWindow) {
    configWindow.show();
    return;
  }
  exports.createConfigWindow();
}

exports.createConfigWindow = () => {
  configWindow = new electron.BrowserWindow({
    width: 380,
    height: 500,
    autoHideMenuBar: true
  });

  configWindow.loadURL(`file://${__dirname}/config/index.html`)
  configWindow.on('closed', _ => configWindow = null)
}

exports.createFullscreenWindow = () => {
  let {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  fullscreenWindow = new electron.BrowserWindow({
    width,
    height,
    resizable: false,
    alwaysOnTop: true,
    frame: false
  });

  fullscreenWindow.loadURL(`file://${__dirname}/fullscreen/index.html`)
  fullscreenWindow.on('closed', _ => fullscreenWindow = null)
}

exports.closeFullscreenWindow = () => {
  if (fullscreenWindow) {
    fullscreenWindow.close()
  }
}

exports.dispatchEvent = (event, data) => {
  if (timerWindow) {
    timerWindow.webContents.send(event, data)
  }
  if (configWindow) {
    configWindow.webContents.send(event, data)
  }
  if (fullscreenWindow) {
    fullscreenWindow.webContents.send(event, data)
  }
}
