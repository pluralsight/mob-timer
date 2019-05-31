const { BrowserWindow } = require("electron");

let configWindow;

exports.showConfigWindow = () => {
  if (configWindow) {
    configWindow.showWindow();
    return;
  }
  configWindow = createConfigWindow();
  configWindow.onClose(() => (configWindow = null));
};

exports.sendEventToConfigWindow = (event, data) => {
  configWindow && configWindow.sendEvent(event, data);
};

const createConfigWindow = () => {
  const configWindowInstance = new BrowserWindow({
    width: 420,
    height: 650,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  configWindowInstance.loadURL(`file://${__dirname}/index.html`);

  return {
    showWindow: () => configWindowInstance.show(),
    onClose: callback => configWindowInstance.on("closed", callback),
    sendEvent: (event, data) =>
      configWindowInstance.webContents.send(event, data)
  };
};
