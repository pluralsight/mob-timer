const { asLazySingletonWindow } = require("./lazy-singleton-window");

describe("asLazySingletonWindow", () => {
  describe("initialization", () => {
    it("should not create BrowserWindow directly", () => {
      const { mockCreateBrowserWindow } = setup();

      asLazySingletonWindow(mockCreateBrowserWindow);

      expect(mockCreateBrowserWindow).not.toHaveBeenCalled();
    });
  });

  describe("showWindow", () => {
    it("should create BrowserWindow when showWindow called", () => {
      const { mockCreateBrowserWindow } = setup();

      const singletonWindow = asLazySingletonWindow(mockCreateBrowserWindow);
      singletonWindow.showWindow();

      expect(mockCreateBrowserWindow).toHaveBeenCalledTimes(1);
    });

    it("should re-open same BrowserWindow if not closed", () => {
      const { mockCreateBrowserWindow, mockShow } = setup();

      const singletonWindow = asLazySingletonWindow(mockCreateBrowserWindow);
      singletonWindow.showWindow();
      singletonWindow.showWindow();

      expect(mockShow).toHaveBeenCalledTimes(1);
    });

    it("should create new BrowserWindow if old is closed", () => {
      const { mockCreateBrowserWindow, mockShow, simulateEvent } = setup();

      const singletonWindow = asLazySingletonWindow(mockCreateBrowserWindow);
      singletonWindow.showWindow();
      simulateEvent("closed");
      singletonWindow.showWindow();

      const mockCallCounts = {
        createBrowserWindow: mockCreateBrowserWindow.mock.calls.length,
        BrowserWindowShow: mockShow.mock.calls.length
      };
      expect(mockCallCounts).toEqual({
        createBrowserWindow: 2,
        BrowserWindowShow: 0
      });
    });
  });

  describe("trySendEvent", () => {
    it("should send event to BrowserWindow webContents", () => {
      const { mockCreateBrowserWindow, mockWebContentsSend } = setup();

      const singletonWindow = asLazySingletonWindow(mockCreateBrowserWindow);
      singletonWindow.showWindow();
      singletonWindow.trySendEvent("fake-event", "fake-event-data");

      expect(mockWebContentsSend).toHaveBeenCalledWith(
        "fake-event",
        "fake-event-data"
      );
    });

    it("should not send event if there never was a BrowserWindow", () => {
      const { mockCreateBrowserWindow, mockWebContentsSend } = setup();

      const singletonWindow = asLazySingletonWindow(mockCreateBrowserWindow);
      singletonWindow.trySendEvent("fake-event", "fake-event-data");

      expect(mockWebContentsSend).not.toHaveBeenCalled();
    });

    it("should not send event if BrowserWindow has closed", () => {
      const {
        mockCreateBrowserWindow,
        simulateEvent,
        mockWebContentsSend
      } = setup();

      const singletonWindow = asLazySingletonWindow(mockCreateBrowserWindow);
      singletonWindow.showWindow();
      simulateEvent("closed");
      singletonWindow.trySendEvent("fake-event", "fake-event-data");

      expect(mockWebContentsSend).not.toHaveBeenCalled();
    });
  });

  const setup = () => {
    const mockOn = jest.fn();
    const mockShow = jest.fn();
    const mockWebContentsSend = jest.fn();

    return {
      mockCreateBrowserWindow: jest.fn(() => ({
        on: mockOn,
        show: mockShow,
        webContents: {
          send: mockWebContentsSend
        }
      })),
      mockShow,
      mockWebContentsSend,
      simulateEvent: eventName => {
        mockOn.mock.calls
          .filter(args => args[0] === eventName)
          .forEach(args => args[1]());
      }
    };
  };
});
