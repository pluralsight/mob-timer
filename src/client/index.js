const electron = require('electron')
const path = require('path')

const { ServiceEvents } = require('../common/constants')
const windowSnapper = require('./window-snapper')

let timerWindow, configWindow, fullscreenWindow
let snapThreshold, secondsUntilFullscreen, timerAlwaysOnTop

exports.createTimerWindow = () => {
  if (timerWindow) {
    return
  }

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  timerWindow = new electron.BrowserWindow({
    x: width - 220,
    y: height - 90,
    width: 220,
    height: 90,
    resizable: false,
    alwaysOnTop: timerAlwaysOnTop,
    frame: false,
    icon: path.join(__dirname, 'img', 'icon.png')
  })

  timerWindow.loadURL(`file://${__dirname}/timer/index.html`)
  timerWindow.on('closed', _ => timerWindow = null)

  timerWindow.on('move', e => {
    if (snapThreshold <= 0) {
      return
    }

    const windowBounds = timerWindow.getBounds()
    const screenBounds = electron.screen.getDisplayNearestPoint(getCenter(windowBounds)).workArea

    const snapTo = windowSnapper(windowBounds, screenBounds, snapThreshold)
    if (snapTo.x !== windowBounds.x || snapTo.y !== windowBounds.y) {
      timerWindow.setPosition(snapTo.x, snapTo.y)
    }
  })
}

const getCenter = bounds => ({
  x: bounds.x + (bounds.width / 2),
  y: bounds.y + (bounds.height / 2)
})

exports.showConfigWindow = () => {
  if (configWindow) {
    configWindow.show()
    return
  }
  exports.createConfigWindow()
}

exports.createConfigWindow = () => {
  if (configWindow) {
    return
  }

  configWindow = new electron.BrowserWindow({
    width: 420,
    height: 500,
    autoHideMenuBar: true
  })

  configWindow.loadURL(`file://${__dirname}/config/index.html`)
  configWindow.on('closed', _ => configWindow = null)
}

exports.createFullscreenWindow = () => {
  if (fullscreenWindow) {
    return
  }

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  fullscreenWindow = new electron.BrowserWindow({
    width,
    height,
    resizable: false,
    alwaysOnTop: true,
    frame: false
  })

  fullscreenWindow.loadURL(`file://${__dirname}/fullscreen/index.html`)
  fullscreenWindow.on('closed', _ => fullscreenWindow = null)
}

exports.closeFullscreenWindow = () => {
  if (fullscreenWindow) {
    fullscreenWindow.close()
  }
}

exports.dispatchEvent = (event, data) => {
  if (event === ServiceEvents.ConfigUpdated) {
    exports.setConfigState(data)
  }
  if (event === ServiceEvents.Alert && data === secondsUntilFullscreen) {
    exports.createFullscreenWindow()
  }
  if (event === ServiceEvents.StopAlerts) {
    exports.closeFullscreenWindow()
  }

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

exports.setConfigState = data => {
  const shouldRecreateTimerWindow = timerAlwaysOnTop !== data.timerAlwaysOnTop

  snapThreshold = data.snapThreshold
  secondsUntilFullscreen = data.secondsUntilFullscreen
  timerAlwaysOnTop = data.timerAlwaysOnTop

  if (shouldRecreateTimerWindow && timerWindow) {
    timerWindow.close()
    exports.createTimerWindow()
  }
}
