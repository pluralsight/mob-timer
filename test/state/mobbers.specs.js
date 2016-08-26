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
      assert.equal(result[0].name, 'Test')
    })

    it('should add an id to the mobber if missing', () => {
      mobbers.addMobber({name: 'Test'})
      let result = mobbers.getAll()
      assert.notEqual(result[0].id, undefined)
    })

    it('should NOT add an id to the mobber if it already has one', () => {
      mobbers.addMobber({id: 'test-id', name: 'Test'})
      let result = mobbers.getAll()
      assert.equal(result[0].id, 'test-id')
    })

    it('should always add to the end of the list', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      let result = mobbers.getAll()
      assert.equal(result[0].name, 'Test 1')
      assert.equal(result[1].name, 'Test 2')
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
      assert.equal(result.current.name, 'Test')
      assert.equal(result.next.name, 'Test')
    })

    it('return the current and next mobber when there are 2 mobbers', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      let result = mobbers.getCurrentAndNextMobbers()
      assert.equal(result.current.name, 'Test 1')
      assert.equal(result.next.name, 'Test 2')
    })

    it('should return the correct mobbers after rotating', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.addMobber({name: 'Test 3'})
      mobbers.rotate()
      let result = mobbers.getCurrentAndNextMobbers()
      assert.equal(result.current.name, 'Test 2')
      assert.equal(result.next.name, 'Test 3')
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
      assert.equal(result.current.name, 'Test')
      assert.equal(result.next.name, 'Test')
    })

    it('should rotate the mobbers when there are 2', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.rotate()
      let result = mobbers.getCurrentAndNextMobbers()
      assert.equal(result.current.name, 'Test 2')
      assert.equal(result.next.name, 'Test 1')
    })

    it('should loop back around after the end of the list', () => {
      mobbers.addMobber({name: 'Test 1'})
      mobbers.addMobber({name: 'Test 2'})
      mobbers.rotate()
      mobbers.rotate()
      let result = mobbers.getCurrentAndNextMobbers()
      assert.equal(result.current.name, 'Test 1')
      assert.equal(result.next.name, 'Test 2')
    })
  })

  describe('removeMobber', () => {
    it('should not remove anyone if the id does not match', () => {
      mobbers.addMobber({name: 'Test', id: 'test-id'})
      mobbers.removeMobber({name: 'Other', id: 'other-id'})
      let result = mobbers.getAll()
      assert.equal(result[0].name, 'Test')
    })

    it('should remove the mobber that matches by id', () => {
      mobbers.addMobber({name: 'Test 1', id: '1a'})
      mobbers.addMobber({name: 'Test 2', id: '2a'})
      mobbers.addMobber({name: 'Test 1', id: '1b'})
      mobbers.addMobber({name: 'Test 2', id: '2b'})
      mobbers.removeMobber({name: 'Test 1', id: '1b'})
      let result = mobbers.getAll()
      assert.equal(result.length, 3)
      assert.equal(result[0].id, '1a')
      assert.equal(result[1].id, '2a')
      assert.equal(result[2].id, '2b')
    })

    it('should update correctly if the removed mobber was the current mobber', () => {
      mobbers.addMobber({name: 'Test 1', id: 't1'})
      mobbers.addMobber({name: 'Test 2', id: 't2'})
      mobbers.addMobber({name: 'Test 3', id: 't3'})
      mobbers.rotate()
      mobbers.removeMobber({id: 't2'})
      let result = mobbers.getCurrentAndNextMobbers()
      assert.equal(result.current.name, 'Test 3')
      assert.equal(result.next.name, 'Test 1')
    })

    it('should wrap around correctly if the removed mobber was current and at the end of the list', () => {
      mobbers.addMobber({name: 'Test 1', id: 't1'})
      mobbers.addMobber({name: 'Test 2', id: 't2'})
      mobbers.addMobber({name: 'Test 3', id: 't3'})
      mobbers.rotate()
      mobbers.rotate()
      mobbers.removeMobber({id: 't3'})
      let result = mobbers.getCurrentAndNextMobbers()
      assert.equal(result.current.name, 'Test 1')
      assert.equal(result.next.name, 'Test 2')
    })
  })

  describe('updateMobber', () => {
    it('should replace the mobber by matching id', () => {
      mobbers.addMobber({name: 'Test 1', id: 't1'})
      mobbers.addMobber({name: 'Test 2', id: 't2'})
      mobbers.addMobber({name: 'Test 3', id: 't3'})
      mobbers.updateMobber({name: 'Test 2-updated', id: 't2', image: 'image-path'})
      let result = mobbers.getAll()
      assert.equal(result.length, 3)
      assert.equal(result[0].name, 'Test 1')
      assert.equal(result[1].name, 'Test 2-updated')
      assert.equal(result[2].name, 'Test 3')
      assert.equal(result[1].image, 'image-path')
    })

    it('should not replace anything if the id does not match', () => {
      mobbers.addMobber({name: 'Test', id: 'test-id'})
      mobbers.updateMobber({name: 'Tester', id: 'other-id', image: 'image-path'})
      let result = mobbers.getAll()
      assert.equal(result.length, 1)
      assert.equal(result[0].name, 'Test')
      assert.equal(result[0].id, 'test-id')
      assert.equal(result[0].image, undefined)
    })
  })
})
