const ipc = require('electron').ipcRenderer

const containerEl = document.getElementById('container')
const pauseBtn = document.getElementById('pause')
const unpauseBtn = document.getElementById('unpause')
const skipBtn = document.getElementById('skip')
const startTurnBtn = document.getElementById('startTurn')
const configureBtn = document.getElementById('configure')
const currentEl = document.getElementById('current')
const nextEl = document.getElementById('next')
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
  currentEl.innerHTML = data.current ? data.current.name : "Add a mobber"
  if (!data.next) {
    data.next = data.current
  }
  nextEl.innerHTML = data.next ? data.next.name : "Add a mobber"
})

ipc.on('paused', _ => {
  container.classList.add('isPaused')
  pauseBtn.classList.add('hidden')
  unpauseBtn.classList.remove('hidden')
})

ipc.on('started', _ => {
  container.classList.remove('isPaused')
  containerEl.classList.remove('isTurnEnded')
  pauseBtn.classList.remove('hidden')
  unpauseBtn.classList.add('hidden')
  startTurnBtn.classList.add('hidden')
})

ipc.on('turnEnded', (event, data) => {
  container.classList.remove('isPaused')
  containerEl.classList.add('isTurnEnded')
  unpauseBtn.classList.add('hidden')
  startTurnBtn.classList.remove('hidden')
})

pauseBtn.addEventListener('click', _ => ipc.send('pause'))
unpauseBtn.addEventListener('click', _ => ipc.send('unpause'))
skipBtn.addEventListener('click', _ => ipc.send('skip'))
startTurnBtn.addEventListener('click', _ => ipc.send('startTurn'))
configureBtn.addEventListener('click', _ => ipc.send('configure'))

ipc.send('timerWindowReady')
