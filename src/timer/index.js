const ipc = require('electron').ipcRenderer

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

ipc.on('timerChange', (event, seconds) => {
  const countEl = document.getElementById('count')
  countEl.innerHTML = formatTime(seconds)
})

ipc.on('rotated', (event, data) => {
  const currentEl = document.getElementById('current')
  const nextEl = document.getElementById('next')
  currentEl.innerHTML = data.current.name
  nextEl.innerHTML = data.next.name
})

ipc.on('paused', _ => {
  pauseBtn.classList.add('hidden')
  unpauseBtn.classList.remove('hidden')
})

ipc.on('started', _ => {
  pauseBtn.classList.remove('hidden')
  unpauseBtn.classList.add('hidden')
  startTurnBtn.classList.add('hidden')
})

ipc.on('turnEnded', (event, data) => {
  startTurnBtn.classList.remove('hidden')
})

const pauseBtn = document.getElementById('pause')
pauseBtn.addEventListener('click', _ => ipc.send('pause'))

const unpauseBtn = document.getElementById('unpause')
unpauseBtn.addEventListener('click', _ => ipc.send('unpause'))

const skipBtn = document.getElementById('skip')
skipBtn.addEventListener('click', _ => ipc.send('skip'))

const startTurnBtn = document.getElementById('startTurn')
startTurnBtn.addEventListener('click', _ => ipc.send('startTurn'))

ipc.send('timerWindowReady')
