let Mobbers = require('../../src/state/mobbers')
let assert = require('assert')

describe('Mobbers', () => {
  let mobbers

  beforeEach(() => {
    mobbers = new Mobbers()
  })

  describe('on construction', () => {
    it('should have no mobbers', () => {
      let result = mobbers.getAll()
      assert.deepEqual(result, [])
    })
  })

  describe('addMobber', () => {
    it('should add a mobber', () => {
      mobbers.addMobber({name: 'Test'})
      let result = mobbers.getAll()
      assert.deepEqual(result, [
        {name: 'Test'}
      ])
    })

    it('should always add to the end of the list', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      let result = mobbers.getAll()
      assert.deepEqual(result, [
        {name: 'Test 1'},
        {name: 'Test 2'}
      ])
    })
  })

  describe('getCurrentAndNextMobbers', () => {
    it('return null values if there are no mobbers', () => {
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: null, next: null })
    })

    it('return the same mobber for current and next if there is only one mobber', () => {
      mobbers.addMobber({name: 'Test'})
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: {name: 'Test'}, next: {name: 'Test'} })
    })

    it('return the current and next mobber when there are 2 mobbers', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: {name: 'Test 1'}, next: {name: 'Test 2'} })
    })

    it('should return the correct mobbers after rotating', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.addMobber({name: 'Test 3'})
      mobbers.rotate()
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: {name: 'Test 2'}, next: {name: 'Test 3'} })
    })
  })

  describe('rotate', () => {
    it('should do nothing when there are no mobbers', () => {
      mobbers.rotate()
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: null, next: null })
    })

    it('should do nothing when there is only one mobber', () => {
      mobbers.addMobber({name: 'Test'})
      mobbers.rotate()
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: {name: 'Test'}, next: {name: 'Test'} })
    })

    it('should rotate the mobbers when there are 2', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.rotate()
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: {name: 'Test 2'}, next: {name: 'Test 1'} })
    })

    it('should loop back around after the end of the list', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.rotate()
      mobbers.rotate()
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: {name: 'Test 1'}, next: {name: 'Test 2'} })
    })
  })

  describe('removeMobber', () => {
    it('should not remove anyone if the name does not match', () => {
      mobbers.addMobber({name: 'Test'})
      mobbers.removeMobber({name: 'Other'})
      let result = mobbers.getAll()
      assert.deepEqual(result, [
        {name: 'Test'}
      ])
    })

    it('should remove all matches', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.removeMobber({name: 'Test 1'})
      let result = mobbers.getAll()
      assert.deepEqual(result, [
        {name: 'Test 2'},
        {name: 'Test 2'}
      ])
    })

    it('should update correctly if the removed mobber was the current mobber', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.addMobber({name: 'Test 3'})
      mobbers.rotate()
      mobbers.removeMobber({name: 'Test 2'})
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: {name: 'Test 3'}, next: {name: 'Test 1'} })
    })

    it('should wrap around correctly if the removed mobber was current and at the end of the list', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.addMobber({name: 'Test 3'})
      mobbers.rotate()
      mobbers.rotate()
      mobbers.removeMobber({name: 'Test 3'})
      let result = mobbers.getCurrentAndNextMobbers()
      assert.deepEqual(result, { current: {name: 'Test 1'}, next: {name: 'Test 2'} })
    })
  })
})
