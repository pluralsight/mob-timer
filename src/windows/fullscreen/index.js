const ipc = require("electron").ipcRenderer;

const skipBtn = document.getElementById("skip");
const startTurnBtn = document.getElementById("startTurn");
const configureBtn = document.getElementById("configure");
const currentEl = document.getElementById("current");
const currentPicEl = document.getElementById("currentPic");
const nextEl = document.getElementById("next");
const nextPicEl = document.getElementById("nextPic");

ipc.on("rotated", (event, data) => {
  if (!data.current) {
    data.current = { name: "Add a mobber" };
  }
  currentEl.innerHTML = data.current.name;
  currentPicEl.src = data.current.image || "../img/sad-cyclops.png";

  if (!data.next) {
    data.next = data.current;
  }
  nextEl.innerHTML = data.next.name;
  nextPicEl.src = data.next.image || "../img/sad-cyclops.png";
});

skipBtn.addEventListener("click", () => ipc.send("skip"));
startTurnBtn.addEventListener("click", () => ipc.send("startTurn"));
configureBtn.addEventListener("click", () => ipc.send("configure"));

ipc.send("fullscreenWindowReady");
