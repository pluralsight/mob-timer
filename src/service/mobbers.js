const newGuid = require('uuid/v4')

class Mobbers {
  constructor() {
    this.mobbers = []
    this.currentMobber = 0
  }

  getAll() {
    return this.mobbers
  }

  getActive() {
    return this.mobbers.filter(m => !m.disabled)
  }

  getCurrentAndNextMobbers() {
    const active = this.getActive()
    if (!active.length) {
      return { current: null, next: null }
    }

    return {
      current: active[this.currentMobber],
      next: active[(this.currentMobber + 1) % active.length]
    }
  }

  rotate() {
    const active = this.getActive()
    this.currentMobber = active.length ? (this.currentMobber + 1) % active.length : 0
  }

  addMobber(mobber) {
    if (!mobber.id) {
      mobber.id = newGuid()
    }
    this.mobbers.push(mobber)
  }

  removeMobber(id) {
    this.mobbers = this.mobbers.filter(m => m.id !== id)
    if (this.currentMobber >= this.mobbers.length) {
      this.currentMobber = 0
    }
  }

  updateMobber(mobber) {
    const index = this.mobbers.findIndex(m => m.id === mobber.id)
    if (index >= 0) {
      const currentMobber = this.getActive()[this.currentMobber]

      this.mobbers[index] = mobber
      const active = this.getActive()

      if (currentMobber && currentMobber.id !== mobber.id) {
        this.currentMobber = active.findIndex(m => m.id === currentMobber.id)
      }

      this.currentMobber = active.length ? this.currentMobber % active.length : 0
    }
  }
}

module.exports = Mobbers
