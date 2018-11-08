const newGuid = require('uuid/v4')

const { DefaultMobber } = require('../common/constants')

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
      return { current: DefaultMobber, next: DefaultMobber }
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
    const id = mobber.id || newGuid()
    this.mobbers.push({ id, ...DefaultMobber, ...mobber })
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

  shuffleMobbers() {
    for (let i = this.mobbers.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.mobbers[i], this.mobbers[j]] = [this.mobbers[j], this.mobbers[i]];
    }
  }
}

module.exports = Mobbers
