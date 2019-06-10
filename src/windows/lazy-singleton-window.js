exports.asLazySingletonWindow = createBrowserWindow => {
  let browserWindow;

  return {
    showWindow: () => {
      if (browserWindow) {
        browserWindow.show();
        return;
      }
      browserWindow = createBrowserWindow();
      browserWindow.on("closed", () => (browserWindow = undefined));
    },
    trySendEvent: (event, data) =>
      browserWindow && browserWindow.webContents.send(event, data)
  };
};
