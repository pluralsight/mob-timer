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
  if (!data.current) {
    data.current = { name: "Add a mobber" }
  }
  currentEl.innerHTML = data.current.name
  currentPicEl.src = data.current.image || "../img/sad-cyclops.png"

  if (!data.next) {
    data.next = data.current
  }
  nextEl.innerHTML = data.next.name
  nextPicEl.src = data.next.image || "../img/sad-cyclops.png"
})

skipBtn.addEventListener('click', _ => ipc.send(ClientEvents.Skip))
startTurnBtn.addEventListener('click', _ => ipc.send(ClientEvents.StartTurn))
configureBtn.addEventListener('click', _ => ipc.send(ClientEvents.Configure))

ipc.send(ClientEvents.FullscreenWindowReady)
