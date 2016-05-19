const ipc = require('electron').ipcRenderer

const mobbersEl = document.getElementById('mobbers')
const minutesEl = document.getElementById('minutes')
const addEl = document.getElementById('add')
const addMobberForm = document.getElementById('addMobberForm')

function createMobberEl(mobber) {
  const el = document.createElement('div')
  el.classList.add('mobber')
  el.innerHTML = mobber.name

  const nameEl = document.createElement('div')
  nameEl.classList.add('name')
  el.appendChild(nameEl)

  const rmBtn = document.createElement('button')
  rmBtn.classList.add('rmBtn')
  rmBtn.innerHTML = 'Remove'
  el.appendChild(rmBtn)

  rmBtn.addEventListener('click', _ => ipc.send('removeMobber', mobber))

  return el
}

ipc.on('configUpdated', (event, data) => {
  minutesEl.value = Math.ceil(data.secondsPerTurn / 60)
  mobbersEl.innerHTML = ''
  const frag = document.createDocumentFragment()
  data.mobbers.map(mobber => {
    frag.appendChild(createMobberEl(mobber))
  })
  mobbersEl.appendChild(frag)
})

minutesEl.addEventListener('change', _ => {
  console.log(minutesEl.value)
  ipc.send('setSecondsPerTurn', minutesEl.value * 60)
})

addMobberForm.addEventListener('submit', event => {
  event.preventDefault()
  let value = addEl.value.trim()
  if (!value) {
    return
  }
  ipc.send('addMobber', { name: value })
  addEl.value = ''
})

ipc.send('configWindowReady')
