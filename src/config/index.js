const ipc = require('electron').ipcRenderer

const mobbersEl = document.getElementById('mobbers')
const minutesEl = document.getElementById('minutes')

function createMobberEl(mobber) {
  const el = document.createElement('div')
  el.innerHTML = mobber.name
  return el
}

ipc.on('configUpdated', (event, data) => {
  minutesEl.value = Math.ceil(data.secondsPerTurn / 60)
  data.mobbers.map(mobber => {
    mobbersEl.appendChild(createMobberEl(mobber))
  })
})




ipc.send('configWindowReady')
