const newGuid = require('uuid/v4')

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
    if (this.currentMobber >= this.getActiveMobbers().length) {
      this.currentMobber = 0
    }
  }

  updateMobber(mobber) {
    let currentMobber = this.getActiveMobbers()[this.currentMobber]
    let index = this.mobbers.findIndex(m => m.id === mobber.id)
    if (index >= 0) {
      this.mobbers[index] = mobber
      let active = this.getActiveMobbers()
      if (currentMobber && currentMobber.id !== mobber.id) {
        this.currentMobber = active.findIndex(m => m.id === currentMobber.id)
      }
      this.currentMobber = active.length ? this.currentMobber % active.length : 0
    }
  }

  shuffleMobbers() {
    for (let i = this.mobbers.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.mobbers[i], this.mobbers[j]] = [this.mobbers[j], this.mobbers[i]]
    }
  }
}

module.exports = Mobbers
