const ipc = require('electron').ipcRenderer

function lpad(val) {
  return val < 10
    ? '0' + val
    : val
}

function formatTime(totalSeconds) {
  if (totalSeconds <= 0) {
    return '0:00'
  }

  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60)
  return `${minutes}:${lpad(seconds)}`
}

ipc.on('timerChange', (event, data) => {
  const countEl = document.getElementById('count')
  countEl.innerHTML = formatTime(data)
})

ipc.on('rotated', (event, data) => {
  const currentEl = document.getElementById('current')
  const nextEl = document.getElementById('next')
  currentEl.innerHTML = data.current.name
  nextEl.innerHTML = data.next.name
})

const pauseBtn = document.getElementById('pause')
pauseBtn.addEventListener('click', _ => ipc.send('pause'))

const skipBtn = document.getElementById('skip')
skipBtn.addEventListener('click', _ => ipc.send('skip'))
