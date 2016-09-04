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

  getActiveMobbers() {
    return this.mobbers.filter(m => !m.disabled)
  }

  getCurrentAndNextMobbers() {
    let active = this.getActiveMobbers()
    if (!active.length) {
      return { current: null, next: null }
    }

    return {
      current: active[this.currentMobber],
      next: active[(this.currentMobber + 1) % active.length]
    }
  }

  rotate() {
    let active = this.getActiveMobbers()
    this.currentMobber = active.length ? (this.currentMobber + 1) % active.length : 0
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
