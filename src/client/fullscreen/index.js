const { ipcRenderer: ipc } = require('electron')

const { ClientEvents, ServiceEvents } = require('../../common/constants')

const skipBtn = document.getElementById('skip')
const startTurnBtn = document.getElementById('startTurn')
const configureBtn = document.getElementById('configure')
const currentEl = document.getElementById('current')
const currentPicEl = document.getElementById('currentPic')
const nextEl = document.getElementById('next')
const nextPicEl = document.getElementById('nextPic')

ipc.on(ServiceEvents.Rotated, (event, data) => {
  currentEl.innerHTML = data.current.name
  currentPicEl.src = data.current.image

  nextEl.innerHTML = data.next.name
  nextPicEl.src = data.next.image
})

skipBtn.addEventListener('click', _ => ipc.send(ClientEvents.Skip))
startTurnBtn.addEventListener('click', _ => ipc.send(ClientEvents.StartTurn))
configureBtn.addEventListener('click', _ => ipc.send(ClientEvents.Configure))

ipc.send(ClientEvents.FullscreenWindowReady)
