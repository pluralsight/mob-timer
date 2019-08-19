const { initialize } = require("./initialize");
const mockElectron = require("electron");
const mockLazySingletonWindow = require("../lazy-singleton-window");

jest.mock("../lazy-singleton-window", () => ({
  asLazySingletonWindow: jest.fn()
}));

describe("config window initialize", () => {
  it("should prepare for creating singleton window", () => {
    const { mockShowWindow, mockTrySendEvent } = mockAsLazySingletonWindow(
      mockLazySingletonWindow.asLazySingletonWindow
    );

    const configWindow = initialize();

    expect(configWindow).toEqual({
      showConfigWindow: mockShowWindow,
      sendEventToConfigWindow: mockTrySendEvent
    });
  });

  describe("createBrowserWindow factory", () => {
    it("should create BrowserWindow with correct configuration", () => {
      const { invokeCreateBrowserWindow } = mockAsLazySingletonWindow(
        mockLazySingletonWindow.asLazySingletonWindow
      );
      mockBrowserWindowConstructor(mockElectron.BrowserWindow);
      initialize();

      invokeCreateBrowserWindow();

      expect(mockElectron.BrowserWindow).toHaveBeenCalledWith({
        autoHideMenuBar: true,
        height: 680,
        webPreferences: { nodeIntegration: true },
        width: 438
      });
    });

    it("should load index.html after creating BrowserWindow", () => {
      const { invokeCreateBrowserWindow } = mockAsLazySingletonWindow(
        mockLazySingletonWindow.asLazySingletonWindow
      );
      const { mockLoadURL } = mockBrowserWindowConstructor(
        mockElectron.BrowserWindow
      );
      initialize();

      invokeCreateBrowserWindow();

      expect(mockLoadURL).toHaveBeenCalledWith(
        expect.stringContaining("config/index.html")
      );
    });

    const mockBrowserWindowConstructor = mockBrowserWindow => {
      const mockLoadURL = jest.fn();
      mockBrowserWindow.mockImplementation(function() {
        const invokedAsConstructor =
          this.constructor.name === "mockConstructor";
        if (!invokedAsConstructor) {
          throw new Error(
            "BrowserWindow not invoked as ctor, did you forget new?"
          );
        }
        return {
          loadURL: mockLoadURL
        };
      });

      return {
        mockLoadURL
      };
    };
  });

  const mockAsLazySingletonWindow = asLazySingletonWindow => {
    const mockShowWindow = jest.fn();
    const mockTrySendEvent = jest.fn();
    asLazySingletonWindow.mockImplementation(() => ({
      showWindow: mockShowWindow,
      trySendEvent: mockTrySendEvent
    }));

    return {
      mockShowWindow,
      mockTrySendEvent,
      invokeCreateBrowserWindow: () => {
        const createBrowserWindow = asLazySingletonWindow.mock.calls[0][0];
        createBrowserWindow();
      }
    };
  };
});
