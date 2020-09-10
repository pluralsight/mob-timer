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
      nodeIntegration: true,
      enableRemoteModule: true //This should be disabled to get better security, but is used for showOpenDialog as of now!
    }
  });

  configWindowInstance.loadURL(`file://${__dirname}/index.html`);

  return configWindowInstance;
};
