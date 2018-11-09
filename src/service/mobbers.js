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

  getCurrentAndNextMobbers() {
    const active = this.getActive()
    if (!active.length) {
      return { current: DefaultMobber, next: DefaultMobber }
    }

    return {
      current: active[this.currentMobber],
      next: active[this.getNextMobber(active)]
    }
  }

  getActive() {
    return this.mobbers.filter(m => !m.disabled)
  }

  getNextMobber(active) {
    active = active || this.getActive()
    return (this.currentMobber + 1) % (active.length || 1)
  }

  rotate() {
    this.currentMobber = this.getNextMobber()
  }

  add(mobber) {
    const id = mobber.id || newGuid()
    this.mobbers.push({ id, ...DefaultMobber, ...mobber })
  }

  remove(id) {
    this.mobbers = this.mobbers.filter(m => m.id !== id)
    if (this.currentMobber >= this.getActive().length) {
      this.currentMobber = 0
    }
  }

  update(mobber) {
    const index = this.mobbers.findIndex(m => m.id === mobber.id)
    if (index >= 0) {
      const currentMobber = this.getActive()[this.currentMobber]

      this.mobbers[index] = mobber
      const active = this.getActive()

      if (currentMobber && currentMobber.id !== mobber.id) {
        this.currentMobber = active.findIndex(m => m.id === currentMobber.id)
      } else {
        this.currentMobber = this.currentMobber % (active.length || 1)
      }
    }
  }
}

module.exports = Mobbers
