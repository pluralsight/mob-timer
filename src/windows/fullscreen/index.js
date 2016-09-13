const ipc = require('electron').ipcRenderer

const skipBtn = document.getElementById('skip')
const startTurnBtn = document.getElementById('startTurn')
const configureBtn = document.getElementById('configure')
const currentEl = document.getElementById('current')
const currentPicEl = document.getElementById('currentPic')
const nextEl = document.getElementById('next')
const nextPicEl = document.getElementById('nextPic')
const countEl = document.getElementById('count')

function lpad(val) {
  return val < 10
    ? '0' + val
    : '' + val
}

function formatTime(totalSeconds) {
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60)
  return `${minutes}:${lpad(seconds)}`
}

ipc.on('timerChange', (event, data) => {
  countEl.innerHTML = formatTime(data.secondsRemaining)
})

ipc.on('rotated', (event, data) => {
  if (!data.current) {
    data.current = {name: "Add a mobber"}
  }
  currentEl.innerHTML = data.current.name
  currentPicEl.src = data.current.image || "../img/sad-cyclops.png"

  if (!data.next) {
    data.next = data.current
  }
  nextEl.innerHTML = data.next.name
  nextPicEl.src = data.next.image || "../img/sad-cyclops.png"
})

ipc.on('configUpdated', (event, data) => {
  countEl.innerHTML = formatTime(data.secondsPerTurn)
})

skipBtn.addEventListener('click', _ => ipc.send('skip'))
startTurnBtn.addEventListener('click', _ => ipc.send('startTurn'))
configureBtn.addEventListener('click', _ => ipc.send('configure'))

ipc.send('fullscreenWindowReady')
