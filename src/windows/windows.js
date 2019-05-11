const electron = require('electron')
const { app, BrowserWindow, Menu, Tray } = electron
const windowSnapper = require('./window-snapper')
const path = require('path')
const menuTemplate = require('./menu-template')
const isMac = process.platform === 'darwin'
const trayMenu = Menu.buildFromTemplate(menuTemplate.trayMenuTemplate)

let tray, timerWindow, configWindow, fullscreenWindow
let snapThreshold, secondsUntilFullscreen, timerAlwaysOnTop

exports.createTimerWindow = () => {
  if (timerWindow) {
    return
  }

  let { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  const timerWinWidth = 220
  const timerWinHeight = 90
  timerWindow = new BrowserWindow({
    x: width - timerWinWidth,
    y: height - timerWinHeight,
    width: timerWinWidth,
    height: timerWinHeight,
    resizable: false,
    alwaysOnTop: timerAlwaysOnTop,
    frame: false,
    icon: path.join(__dirname, '/../../src/windows/img/icon.png')
  })

  timerWindow.loadURL(`file://${__dirname}/timer/index.html`)
  timerWindow.on('closed', () => (timerWindow = null))
  createApplicationMenu()

  timerWindow.on('move', () => {
    if (snapThreshold <= 0) {
      return
    }

    let getCenter = bounds => {
      return {
        x: bounds.x + (bounds.width / 2),
        y: bounds.y + (bounds.height / 2)
      }
    }

    let windowBounds = timerWindow.getBounds()
    let screenBounds = electron.screen.getDisplayNearestPoint(getCenter(windowBounds)).workArea

    let snapTo = windowSnapper(windowBounds, screenBounds, snapThreshold)
    if (snapTo.x !== windowBounds.x || snapTo.y !== windowBounds.y) {
      timerWindow.setPosition(snapTo.x, snapTo.y)
    }
  })
  exports.timerWindow = timerWindow
}

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

  configWindow = new BrowserWindow({
    width: 420,
    height: 500,
    autoHideMenuBar: true
  })

  configWindow.loadURL(`file://${__dirname}/config/index.html`)
  configWindow.on('closed', () => (configWindow = null))
}

exports.createFullscreenWindow = () => {
  if (fullscreenWindow) {
    return
  }

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  fullscreenWindow = createAlwaysOnTopFullscreenInterruptingWindow({
    width,
    height,
    resizable: false,
    frame: false
  })

  fullscreenWindow.loadURL(`file://${__dirname}/fullscreen/index.html`)
  fullscreenWindow.on('closed', () => (fullscreenWindow = null))
}

exports.closeFullscreenWindow = () => {
  if (fullscreenWindow) {
    fullscreenWindow.close()
  }
}

exports.dispatchEvent = (event, data) => {
  if (event === 'configUpdated') {
    exports.setConfigState(data)
  }
  if (event === 'alert' && data === secondsUntilFullscreen) {
    exports.createFullscreenWindow()
  }
  if (isMac) {
    if (event === 'started' || event === 'paused' || event === 'turnEnded') {
      const menu = Menu.getApplicationMenu()
      const timerMenu = isMac ? menu.items[1].submenu : menu.items[0].submenu
      configureTimerMenu(event, timerMenu)
      configureTimerMenu(event, trayMenu.items[1].submenu)
    }
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
  var needToRecreateTimerWindow = timerAlwaysOnTop !== data.timerAlwaysOnTop

  snapThreshold = data.snapThreshold
  secondsUntilFullscreen = data.secondsUntilFullscreen
  timerAlwaysOnTop = data.timerAlwaysOnTop

  if (needToRecreateTimerWindow && timerWindow) {
    timerWindow.close()
    exports.createTimerWindow()
  }
}

exports.createTrayIconAndMenu = () => {
  if (isMac) {
    if (!tray) {
      tray = new Tray(path.join(__dirname, '/../windows/img/trayIcon.png'))
      tray.setToolTip('Mob Timer')
    }
    tray.setContextMenu(trayMenu)
  }
}

function configureTimerMenu(event, timerMenu) {
  switch (event) {
    case 'started':
      timerMenu.items[0].visible = false
      timerMenu.items[1].visible = true
      timerMenu.items[2].visible = true
      break
    case 'paused':
      timerMenu.items[0].visible = true
      timerMenu.items[1].visible = false
      timerMenu.items[2].visible = true
      break
    case 'turnEnded':
      timerMenu.items[0].visible = true
      timerMenu.items[1].visible = false
      timerMenu.items[2].visible = false
      break
  }
}

function createAlwaysOnTopFullscreenInterruptingWindow(options) {
  return whileAppDockHidden(() => {
    const window = new BrowserWindow(options)
    window.setAlwaysOnTop(true, 'screen-saver')
    return window
  })
}

function whileAppDockHidden(work) {
  if (app.dock) {
    // Mac OS: The window will be able to float above fullscreen windows too
    app.dock.hide()
  }
  const result = work()
  if (app.dock) {
    // Mac OS: Show in dock again, window has been created
    app.dock.show()
  }
  return result
}

function createApplicationMenu() {
  if (isMac) {
    const template = menuTemplate.appMenuTemplate
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}
