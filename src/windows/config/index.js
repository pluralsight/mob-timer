const ipc = require('electron').ipcRenderer
const {dialog} = require('electron').remote

const mobbersEl = document.getElementById('mobbers')
const minutesEl = document.getElementById('minutes')
const addEl = document.getElementById('add')
const addMobberForm = document.getElementById('addMobberForm')
const fullscreenSecondsEl = document.getElementById('fullscreen-seconds')

function createMobberEl(mobber) {
  const el = document.createElement('div')
  el.classList.add('mobber')

  const imgEl = document.createElement('img')
  imgEl.src = mobber.image || '../img/sad-cyclops.png'
  imgEl.classList.add('image')
  el.appendChild(imgEl)

  const nameEl = document.createElement('div')
  nameEl.innerHTML = mobber.name
  nameEl.classList.add('name')
  el.appendChild(nameEl)

  const rmBtn = document.createElement('button')
  rmBtn.classList.add('btn', 'rmBtn')
  rmBtn.innerHTML = 'Remove'
  el.appendChild(rmBtn)

  imgEl.addEventListener('click', _ => selectImage(mobber))
  rmBtn.addEventListener('click', _ => ipc.send('removeMobber', mobber))

  return el
}

function selectImage(mobber) {
  var image = dialog.showOpenDialog({
    title: 'Select image',
    filters: [
      {name: 'Images', extensions: ['jpg', 'png', 'gif']}
    ],
    properties: ['openFile']
  })

  if (image) {
    mobber.image = image[0]
    ipc.send('updateMobber', mobber)
  }
}

ipc.on('configUpdated', (event, data) => {
  minutesEl.value = Math.ceil(data.secondsPerTurn / 60)
  mobbersEl.innerHTML = ''
  const frag = document.createDocumentFragment()
  data.mobbers.map(mobber => {
    frag.appendChild(createMobberEl(mobber))
  })
  mobbersEl.appendChild(frag)
  fullscreenSecondsEl.value = data.secondsUntilFullscreen
})

minutesEl.addEventListener('change', _ => {
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

fullscreenSecondsEl.addEventListener('change', _ => {
  ipc.send('setSecondsUntilFullscreen', fullscreenSecondsEl.value * 1)
})

ipc.send('configWindowReady')
