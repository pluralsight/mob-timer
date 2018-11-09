const electron = require('electron')
const path = require('path')

const { ConfigWindowConfig, FullscreenWindowConfig, ServiceEvents, TimerWindowConfig } = require('./common/constants')
const state = require('./service/timer-state')
const windowSnapper = require('./window-snapper')

let timerWindow, configWindow, fullscreenWindow
let { secondsUntilFullscreen, snapThreshold, timerAlwaysOnTop } = state.getState()

const showTimerWindow = () => {
  if (timerWindow) {
    timerWindow.show()
  } else {
    createTimerWindow()
  }
}

const createTimerWindow = () => {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  timerWindow = new electron.BrowserWindow({
    x: width - TimerWindowConfig.width,
    y: height - TimerWindowConfig.height,
    alwaysOnTop: timerAlwaysOnTop,
    ...TimerWindowConfig
  })

  timerWindow.loadURL('file://' + path.join(__dirname, 'client', 'timer', 'index.html'))
  timerWindow.on('closed', () => { timerWindow = null })

  timerWindow.on('move', () => {
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

const recreateTimerWindow = () => {
  if (timerWindow) {
    timerWindow.close()
  }

  showTimerWindow()
}

const showConfigWindow = () => {
  if (configWindow) {
    configWindow.show()
  } else {
    createConfigWindow()
  }

  closeFullscreenWindow()
}

const createConfigWindow = () => {
  configWindow = new electron.BrowserWindow(ConfigWindowConfig)

  configWindow.loadURL('file://' + path.join(__dirname, 'client', 'config', 'index.html'))
  configWindow.on('closed', () => { configWindow = null })
}

const createFullscreenWindow = () => {
  if (fullscreenWindow) {
    return
  }

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  fullscreenWindow = new electron.BrowserWindow({
    width,
    height,
    ...FullscreenWindowConfig
  })

  fullscreenWindow.loadURL('file://' + path.join(__dirname, 'client', 'fullscreen', 'index.html'))
  fullscreenWindow.on('closed', () => { fullscreenWindow = null })
}

const closeFullscreenWindow = () => {
  if (fullscreenWindow) {
    fullscreenWindow.close()
  }
}

const dispatchEvent = (event, data) => {
  if (timerWindow) {
    timerWindow.webContents.send(event, data)
  }
  if (configWindow) {
    configWindow.webContents.send(event, data)
  }
  if (fullscreenWindow) {
    fullscreenWindow.webContents.send(event, data)
  }

  if (event === ServiceEvents.StateUpdated) {
    handleStateUpdated(data)
  } else if (event === ServiceEvents.Alert) {
    handleAlert(data)
  } else if (event === ServiceEvents.StopAlerts) {
    closeFullscreenWindow()
  }
}

const handleStateUpdated = state => {
  const shouldRecreateTimerWindow = timerAlwaysOnTop !== state.timerAlwaysOnTop

  if (shouldRecreateTimerWindow) {
    recreateTimerWindow()
  }

  ({ secondsUntilFullscreen, snapThreshold, timerAlwaysOnTop } = state)
}

const handleAlert = alertSeconds => {
  if (alertSeconds === secondsUntilFullscreen) {
    createFullscreenWindow()
  }
}

module.exports = {
  dispatchEvent,
  showConfigWindow,
  showTimerWindow
}
