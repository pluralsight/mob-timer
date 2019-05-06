const theme = require('../theme.js')

const ipc = require('electron').ipcRenderer

const containerEl = document.getElementById('container')
const toggleBtn = document.getElementById('toggleButton')
const remainingEl = document.getElementById('remaining')
const configureBtn = document.getElementById('configureButton')
const currentEl = document.getElementById('current')
const nextEl = document.getElementById('next')
const currentPicEl = document.getElementById('currentPic')
const nextPicEl = document.getElementById('nextPic')
const nextBtn = document.getElementById('nextButton')
const timerCanvas = document.getElementById('timerCanvas')
const alertAudio = document.getElementById('alertAudio')

const context = timerCanvas.getContext('2d')

let paused = true
let alertSoundTimes = []

ipc.on('timerChange', (event, data) => {
  console.log('Ipc renderer on timerChange.')
  clearCanvas()
  drawTimeRemaining(data.timeRemaining)
  drawTimerCircle()
  drawTimerArc(data.secondsRemaining, data.secondsPerTurn)
})

function clearCanvas() {
  context.clearRect(0, 0, timerCanvas.width, timerCanvas.height)
}

function drawTimeRemaining(timeRemaining) {
  remainingEl.innerHTML = timeRemaining
}

function drawTimerCircle() {
  const begin = 0
  const end = 2 * Math.PI
  drawArc(begin, end, '#EEEEEE')
}

function drawArc(begin, end, color) {
  const circleCenterX = timerCanvas.width / 2
  const circleCenterY = circleCenterX
  const circleRadius = circleCenterX - 6
  context.beginPath()
  context.arc(circleCenterX, circleCenterY, circleRadius, begin, end)
  context.strokeStyle = color
  context.lineWidth = 10
  context.stroke()
}

function drawTimerArc(seconds, maxSeconds) {
  let percent = 1 - (seconds / maxSeconds)
  if (percent === 0) {
    return
  }
  let begin = -(0.5 * Math.PI)
  let end = begin + (2 * Math.PI * percent)
  drawArc(begin, end, theme.mobberBorderHighlightColor)
}

function drawMobbers(data) {
  if (!data.current) {
    data.current = { name: 'Add a mobber' }
  }
  currentPicEl.src = data.current.image || '../img/sad-cyclops.png'
  currentEl.innerHTML = data.current.name
  if (data.timeRemaining) {
    remainingEl.innerHTML = data.timeRemaining
  } else {
    remainingEl.innerHTML = ''
  }

  if (!data.next) {
    data.next = data.current
  }
  nextPicEl.src = data.next.image || '../img/sad-cyclops.png'
  nextEl.innerHTML = data.next.name
}

function drawOverlays(isPaused) {
  paused = isPaused
  if (isPaused == false) {
    containerEl.classList.remove('isPaused')
    containerEl.classList.remove('isTurnEnded')
    toggleBtn.classList.remove('play')
    toggleBtn.classList.add('pause')
  } else {
    containerEl.classList.remove('isPaused')
    containerEl.classList.add('isTurnEnded')
    toggleBtn.classList.add('play')
    toggleBtn.classList.remove('pause')
  }
}

ipc.on('initialized', (event, data, isTimerRunning) => {
  console.log('Ipc renderer on initialized.')
  drawMobbers(data)
  drawOverlays(true)
})

ipc.on('rotated', (event, data) => {
  console.log('Ipc renderer on rotated.')
  drawMobbers(data)
  drawOverlays(true)
})

ipc.on('paused', () => {
  console.log('Ipc renderer on paused.')
  containerEl.classList.add('isPaused')
  drawOverlays(true)
})

ipc.on('started', () => {
  console.log('Ipc renderer on started.')
  drawOverlays(false)
})

ipc.on('turnEnded', () => {
  console.log('Ipc renderer on turnEnded.')
  remainingEl.innerHTML = ''
  drawOverlays(true)
})

ipc.on('configUpdated', (event, data) => {
  console.log('Ipc renderer on configUpdated.')
  alertSoundTimes = data.alertSoundTimes
  alertAudio.src = data.alertSound || './default.mp3'
})

ipc.on('alert', (event, data) => {
  console.log('Ipc renderer on alert.')
  if (alertSoundTimes.some(item => item === data)) {
    alertAudio.currentTime = 0
    alertAudio.play()
  }
})

ipc.on('stopAlerts', () => {
  console.log('Ipc renderer on stopAlerts.')
  alertAudio.pause()
})

toggleBtn.addEventListener('click', () => {
  paused ? ipc.send('unpause') : ipc.send('pause')
})
nextBtn.addEventListener('click', () => ipc.send('skip'))
configureBtn.addEventListener('click', () => ipc.send('configure'))

ipc.send('timerWindowReady')
