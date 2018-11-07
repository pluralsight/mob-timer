const { DefaultMobber } = require('../../common/constants')
const Mobbers = require('../mobbers')

describe('state/mobbers', () => {
  let subject
  let mobber

  beforeEach(() => {
    mobber = { id: 'mobber-1', name: 'Testerson', image: '/path/to/image' }
    subject = new Mobbers()
  })

  describe('#constructor', () => {
    it('defaults to empty mobbers', () => {
      expect(subject.getAll()).to.deep.equal([])
    })
  })

  describe('#addMobber', () => {
    it('adds the mobber and assigns an id', () => {
      mobber = { name: 'Testerson', image: '/path/to/image' }
      subject.addMobber(mobber)

      const result = subject.getAll()[0]

      expect(result.name).to.equal(mobber.name)
      expect(result.id).to.not.be.null
    })

    describe('when an id is provided', () => {
      it('adds the mobber with provided id', () => {
        mobber = { id: 'test-id', name: 'Testerson', image: '/path/to/image' }
        subject.addMobber(mobber)
        expect(subject.getAll()).to.deep.equal([mobber])
      })
    })

    describe('when multiple mobbers exist', () => {
      it('adds the mobber to the end of the list', () => {
        const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
        subject.addMobber(mobber)
        subject.addMobber(nextMobber)

        const results = subject.getAll()

        expect(results[0]).to.deep.equal(mobber)
        expect(results[1]).to.deep.equal(nextMobber)
      })
    })
  })

  describe('#getCurrentAndNextMobbers', () => {
    let expected

    beforeEach(() => {
      expected = { current: DefaultMobber, next: DefaultMobber }
    })

    describe('when there are no mobbers', () => {
      it('returns null values', () => {
        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })
    })

    describe('when there is one mobber', () => {
      it('returns the same mobber for current and next', () => {
        expected = { current: mobber, next: mobber }
        subject.addMobber(mobber)

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })
    })

    describe('when there are multiple mobbers', () => {
      let nextMobber

      beforeEach(() => {
        nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
        expected = { current: mobber, next: nextMobber }
      })

      it('return the current and next mobber', () => {
        subject.addMobber(mobber)
        subject.addMobber(nextMobber)

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      it('excludes disabled mobbers', () => {
        subject.addMobber(mobber)
        subject.addMobber({ name: 'Not Me', disabled: true })
        subject.addMobber(nextMobber)

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })
    })
  })

  describe('#rotate', () => {
    let expected

    beforeEach(() => {
      expected = { current: DefaultMobber, next: DefaultMobber }
    })

    describe('when there are no mobbers', () => {
      it('does nothing', () => {
        subject.rotate()
        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })
    })

    describe('when there is one mobber', () => {
      it('does nothing', () => {
        expected = { current: mobber, next: mobber }
        subject.addMobber(mobber)

        subject.rotate()

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })
    })

    describe('when there are multiple mobbers', () => {
      let nextMobber

      beforeEach(() => {
        nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
        expected = { current: mobber, next: nextMobber }
      })

      it('rotates current and next mobbers', () => {
        subject.addMobber(nextMobber)
        subject.addMobber(mobber)

        subject.rotate()

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      it('loops through the list', () => {
        subject.addMobber(mobber)
        subject.addMobber(nextMobber)

        subject.rotate()
        subject.rotate()

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      it('excludes disabled mobbers', () => {
        subject.addMobber({ name: 'Not Me', disabled: false })
        subject.addMobber(mobber)
        subject.addMobber({ name: 'Disabled One', disabled: true })
        subject.addMobber({ name: 'Disaabled Two', disabled: true })
        subject.addMobber(nextMobber)

        subject.rotate()

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })
    })
  })

  describe('#removeMobber', () => {
    let otherMobber

    beforeEach(() => {
      otherMobber = { id: 'mobber-2', name: 'Other Mobber', image: '/path/to/image' }
    })

    it('removes the mobber by id', () => {
      subject.addMobber(mobber)
      subject.addMobber({ name: 'Remove Me', id: 'remove-me' })
      subject.addMobber(otherMobber)

      subject.removeMobber('remove-me')

      expect(subject.getAll()).to.deep.equal([mobber, otherMobber])
    })

    describe('when the id does not match a mobber', () => {
      it('does nothing', () => {
        subject.addMobber(mobber)
        subject.addMobber(otherMobber)

        subject.removeMobber('remove-me')

        expect(subject.getAll()).to.deep.equal([mobber, otherMobber])
      })
    })

    describe('when the current mobber is removed', () => {
      let expected

      beforeEach(() => {
        expected = { current: mobber, next: otherMobber }
      })

      it('updates the current and next mobbers', () => {
        subject.addMobber(otherMobber)
        subject.addMobber({ name: 'Remove Me', id: 'remove-me' })
        subject.addMobber(mobber)
        subject.rotate()

        subject.removeMobber('remove-me')

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      describe('when the current mobber is at the end of the list', () => {
        it('loops through the list', () => {
          subject.addMobber(mobber)
          subject.addMobber(otherMobber)
          subject.addMobber({ name: 'Remove Me', id: 'remove-me' })
          subject.rotate()
          subject.rotate()

          subject.removeMobber('remove-me')

          expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
        })
      })
    })
  })

  describe('#updateMobber', () => {
    beforeEach(() => {
      mobber = { id: 'mobber-1', name: 'Testerson', image: '/path/to/image' }
    })

    it('replaces the mobber matching the id', () => {
      const otherMobber = { id: 'other-id', name: 'Other Mobber', image: '/other/image' }
      const updatedMobber = { id: mobber.id, name: 'Updated Mobber', image: '/updated/image' }
      subject.addMobber(mobber)
      subject.addMobber(otherMobber)

      subject.updateMobber(updatedMobber)

      expect(subject.getAll()).to.deep.equal([updatedMobber, otherMobber])
    })

    describe('when the id does not match a mobber', () => {
      it('does nothing', () => {
        subject.addMobber(mobber)
        subject.updateMobber({ id: 'other-id', name: 'Other Mobber', image: '/other/image' })

        expect(subject.getAll()).to.deep.equal([mobber])
      })
    })

    describe('when enabling a mobber', () => {
      it('does not change the current mobber', () => {
        const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
        const otherMobber = { id: 'mobber-3', name: 'Other Mobber', image: '/path/to/image', disabled: true }
        const expected = { current: nextMobber, next: mobber }
        subject.addMobber(mobber)
        subject.addMobber(otherMobber)
        subject.addMobber(nextMobber)
        subject.rotate()

        subject.updateMobber({ id: 'mobber-3', name: 'Other Mobber', disabled: false })

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })
    })

    describe('when disabling a mobber', () => {
      it('does not change the current mobber', () => {
        const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
        const otherMobber = { id: 'mobber-3', name: 'Other Mobber', image: '/path/to/image' }
        const expected = { current: nextMobber, next: mobber }
        subject.addMobber(mobber)
        subject.addMobber(otherMobber)
        subject.addMobber(nextMobber)
        subject.rotate()
        subject.rotate()

        subject.updateMobber({ id: 'mobber-3', name: 'Other Mobber', disabled: true })

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      describe('when disabling the current mobber', () => {
        it('changes to the next mobber', () => {
          const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
          const otherMobber = { id: 'mobber-3', name: 'Other Mobber', image: '/path/to/image' }
          const expected = { current: mobber, next: nextMobber }
          subject.addMobber(otherMobber)
          subject.addMobber(mobber)
          subject.addMobber(nextMobber)

          subject.updateMobber({ id: 'mobber-3', name: 'Other Mobber', disabled: true })

          expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
        })

        describe('when the current mobber is at the end of the list', () => {
          it('loops through the list', () => {
            const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
            const otherMobber = { id: 'mobber-3', name: 'Other Mobber', image: '/path/to/image' }
            const expected = { current: mobber, next: nextMobber }
            subject.addMobber(mobber)
            subject.addMobber(nextMobber)
            subject.addMobber(otherMobber)
            subject.rotate()
            subject.rotate()

            subject.updateMobber({ id: 'mobber-3', name: 'Other Mobber', disabled: true })

            expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
          })
        })
      })
    })
  })
})
