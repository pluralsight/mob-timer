const newGuid = require('node-uuid').v4

class Mobbers {
  constructor() {
    this.mobbers = []
    this.currentMobber = 0
  }

  getAll() {
    return this.mobbers
  }

  addMobber(mobber) {
    if (!mobber.id) {
      mobber.id = newGuid()
    }
    this.mobbers.push(mobber)
  }

  getCurrentAndNextMobbers() {
    if (!this.mobbers.length) {
      return { current: null, next: null }
    }

    return {
      current: this.mobbers[this.currentMobber],
      next: this.mobbers[(this.currentMobber + 1) % this.mobbers.length]
    }
  }

  rotate() {
    this.currentMobber = this.mobbers.length ? (this.currentMobber + 1) % this.mobbers.length : 0
  }

  removeMobber(mobber) {
    this.mobbers = this.mobbers.filter(m => m.id !== mobber.id)
    if (this.currentMobber >= this.mobbers.length) {
      this.currentMobber = 0;
    }
  }

  updateMobber(mobber) {
    let index = this.mobbers.findIndex(m => m.id === mobber.id)
    if (index >= 0) {
      this.mobbers[index] = mobber
    }
  }
}

module.exports = Mobbers
