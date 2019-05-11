const electron = require('electron')
let windows = require('./windows')
const isMac = process.platform === 'darwin'

exports.appMenuTemplate = [
  ...(isMac ? [{
    role: 'appMenu',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      {
        label: 'Preferences',
        accelerator: 'CommandOrControl+,',
        click() { windows.showConfigWindow() }
      },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: 'Timer',
    submenu: [
      {
        label: 'Start',
        click() { windows.timerWindow.webContents.send('start') }
      },
      {
        label: 'Pause',
        visible: false,
        click() { windows.timerWindow.webContents.send('pause') }
      },
      {
        label: 'Reset',
        visible: false,
        click() { windows.timerWindow.webContents.send('reset') }
      },
      {
        label: 'Skip',
        click() { windows.timerWindow.webContents.send('skip') }
      }
    ]
  },
  ...(!isMac ? [
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Preferences',
          accelerator: 'CommandOrControl+,',
          click() { windows.showConfigWindow() }
        }
      ]
    }
  ] : []),
  {
    role: 'help',
    submenu: [
      ...(!isMac ? [
        { role: 'about' },
        { type: 'separator' }
      ] : []),
      {
        label: 'Learn More',
        click() { electron.shell.openExternal('https://github.com/pluralsight/mob-timer') }
      }
    ]
  }
]

exports.trayMenuTemplate = [
  { role: 'about' },
  {
    label: 'Timer',
    submenu: [
      {
        label: 'Start',
        click() { windows.timerWindow.webContents.send('start') }
      },
      {
        label: 'Pause',
        visible: false,
        click() { windows.timerWindow.webContents.send('pause') }
      },
      {
        label: 'Reset',
        visible: false,
        click() { windows.timerWindow.webContents.send('reset') }
      },
      {
        label: 'Skip',
        click() { windows.timerWindow.webContents.send('skip') }
      }
    ]
  },
  {
    label: 'Tools',
    submenu: [
      {
        label: 'Preferences',
        accelerator: 'CommandOrControl+,',
        click() { windows.showConfigWindow() }
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click() { electron.shell.openExternal('https://github.com/pluralsight/mob-timer') }
      }
    ]
  },
  { role: 'quit' }
]
