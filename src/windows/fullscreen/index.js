const ipc = require('electron').ipcRenderer

const skipBtn = document.getElementById('skip')
const startTurnBtn = document.getElementById('startTurn')
const configureBtn = document.getElementById('configure')
const closeBtn = document.getElementById('close')
const currentEl = document.getElementById('current')
const currentPicEl = document.getElementById('currentPic')
const nextEl = document.getElementById('next')
const nextPicEl = document.getElementById('nextPic')

ipc.on('initialized', (event, data) => {
  console.log('Fullscreen window rotated.')
  if (!data.current) {
    data.current = { name: 'Add a mobber' }
  }
  console.log('Current' + data.current.name)
  currentEl.innerHTML = data.current.name
  currentPicEl.src = data.current.image || '../img/sad-cyclops.png'

  if (!data.next) {
    data.next = data.current
  }
  console.log('Next' + data.next.name)
  nextEl.innerHTML = data.next.name
  nextPicEl.src = data.next.image || '../img/sad-cyclops.png'
})

skipBtn.addEventListener('click', () => ipc.send('skip'))
startTurnBtn.addEventListener('click', () => ipc.send('startTurn'))
configureBtn.addEventListener('click', () => ipc.send('configure'))
closeBtn.addEventListener('click', () => ipc.send('close'))

ipc.send('fullscreenWindowReady')
