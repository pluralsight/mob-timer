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

const pauseBtn = document.getElementById('pause')
pauseBtn.addEventListener('click', _ => {
  console.log('clicked')
  ipc.send('pause')
})
