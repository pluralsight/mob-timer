const { BrowserWindow } = require("electron");
const { asLazySingletonWindow } = require("../lazy-singleton-window");

exports.initialize = () => {
  const { showWindow, trySendEvent } = asLazySingletonWindow(
    createConfigWindow
  );

  return {
    showConfigWindow: showWindow,
    sendEventToConfigWindow: trySendEvent
  };
};

const createConfigWindow = () => {
  const configWindowInstance = new BrowserWindow({
    width: 438,
    height: 680,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  configWindowInstance.loadURL(`file://${__dirname}/index.html`);

  return configWindowInstance;
};
