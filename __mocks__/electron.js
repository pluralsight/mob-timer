module.exports = {
  BrowserWindow: jest.fn(),
  ipcMain: {
    on: jest.fn()
  },
  app: {
    on: jest.fn(),
    getAppPath: jest.fn()
  }
};
