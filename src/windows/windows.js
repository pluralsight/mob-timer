const electron = require("electron");
const { app } = electron;
const { snapCheck } = require("./window-snapper");
const path = require("path");
const { debounce } = require("debounce");

let timerWindow, configWindow, fullscreenWindow;
let snapThreshold, secondsUntilFullscreen, timerAlwaysOnTop;
const timerWindowSize = {
  width: 220,
  height: 90
};

exports.createTimerWindow = () => {
  if (timerWindow) {
    return;
  }

  let { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  timerWindow = new electron.BrowserWindow({
    x: width - timerWindowSize.width,
    y: height - timerWindowSize.height,
    width: timerWindowSize.width,
    height: timerWindowSize.height,
    resizable: false,
    alwaysOnTop: timerAlwaysOnTop,
    frame: false,
    icon: path.join(__dirname, "/../../src/windows/img/icon.png"),
    webPreferences: {
      nodeIntegration: true
    }
  });

  timerWindow.loadURL(`file://${__dirname}/timer/index.html`);
  timerWindow.on("closed", () => (timerWindow = null));
  const delayedSetBounds = debounce(timerWindow.setBounds, 100);

  timerWindow.on("move", () => {
    if (snapThreshold <= 0) {
      return;
    }

    let getCenter = bounds => {
      return {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
      };
    };

    let windowBounds = {
      ...timerWindow.getBounds(),
      width: timerWindowSize.width,
      height: timerWindowSize.height
    };
    let screenBounds = electron.screen.getDisplayNearestPoint(
      getCenter(windowBounds)
    ).workArea;

    const { shouldSnap, ...snapBounds } = snapCheck(
      windowBounds,
      screenBounds,
      snapThreshold
    );
    if (shouldSnap) {
      delayedSetBounds(snapBounds);
    } else {
      delayedSetBounds.clear();
    }
  });
};

exports.showConfigWindow = () => {
  if (configWindow) {
    configWindow.show();
    return;
  }
  exports.createConfigWindow();
};

exports.createConfigWindow = () => {
  if (configWindow) {
    return;
  }

  configWindow = new electron.BrowserWindow({
    width: 420,
    height: 500,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  configWindow.loadURL(`file://${__dirname}/config/index.html`);
  configWindow.on("closed", () => (configWindow = null));
};

exports.createFullscreenWindow = () => {
  if (fullscreenWindow) {
    return;
  }

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  fullscreenWindow = createAlwaysOnTopFullscreenInterruptingWindow({
    width,
    height,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  fullscreenWindow.loadURL(`file://${__dirname}/fullscreen/index.html`);
  fullscreenWindow.on("closed", () => (fullscreenWindow = null));
};

exports.closeFullscreenWindow = () => {
  if (fullscreenWindow) {
    fullscreenWindow.close();
  }
};

exports.dispatchEvent = (event, data) => {
  if (event === "configUpdated") {
    exports.setConfigState(data);
  }
  if (event === "alert" && data === secondsUntilFullscreen) {
    exports.createFullscreenWindow();
  }
  if (event === "stopAlerts") {
    exports.closeFullscreenWindow();
  }

  if (timerWindow) {
    timerWindow.webContents.send(event, data);
  }
  if (configWindow) {
    configWindow.webContents.send(event, data);
  }
  if (fullscreenWindow) {
    fullscreenWindow.webContents.send(event, data);
  }
};

exports.setConfigState = data => {
  var needToRecreateTimerWindow = timerAlwaysOnTop !== data.timerAlwaysOnTop;

  snapThreshold = data.snapThreshold;
  secondsUntilFullscreen = data.secondsUntilFullscreen;
  timerAlwaysOnTop = data.timerAlwaysOnTop;

  if (needToRecreateTimerWindow && timerWindow) {
    timerWindow.close();
    exports.createTimerWindow();
  }
};

function createAlwaysOnTopFullscreenInterruptingWindow(options) {
  return whileAppDockHidden(() => {
    const window = new electron.BrowserWindow(options);
    window.setAlwaysOnTop(true, "screen-saver");
    return window;
  });
}

function whileAppDockHidden(work) {
  if (app.dock) {
    // Mac OS: The window will be able to float above fullscreen windows too
    app.dock.hide();
  }
  const result = work();
  if (app.dock) {
    // Mac OS: Show in dock again, window has been created
    app.dock.show();
  }
  return result;
}
