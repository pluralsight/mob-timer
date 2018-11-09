const { DefaultMobber } = require('../../common/constants')
const Mobbers = require('../mobbers')

describe('service/mobbers', () => {
  let subject
  let mobber

  beforeEach(() => {
    mobber = { id: 'mobber-1', name: 'Testerson', image: '/path/to/image' }
    subject = new Mobbers()
  })

  describe('#constructor', () => {
    it('defaults to empty mobbers', () => {
      expect(subject.getAll()).to.deep.equal([])
      expect(subject.getActive()).to.deep.equal([])
    })
  })

  describe('#add', () => {
    it('adds the mobber', () => {
      subject.add(mobber)
      expect(subject.getAll()).to.deep.equal([mobber])
    })

    describe('when an id is not provided', () => {
      it('adds the mobber and assigns an id', () => {
        mobber = { name: 'Testerson', image: '/path/to/image' }
        subject.add(mobber)

        const result = subject.getAll()

        expect(result.length).to.equal(1)
        expect(result[0].name).to.equal(mobber.name)
        expect(result[0].image).to.equal(mobber.image)
        expect(result[0].id).to.not.be.null
      })
    })

    describe('when an image is not provided', () => {
      it('adds the mobber with the default image', () => {
        mobber = { id: 'test-id', name: 'Testerson' }
        subject.add(mobber)

        const result = subject.getAll()

        expect(result).to.deep.equal([{ ...mobber, image: DefaultMobber.image }])
      })
    })

    describe('when multiple mobbers exist', () => {
      it('adds the mobber to the end of the list', () => {
        const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
        subject.add(mobber)
        subject.add(nextMobber)

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
        subject.add(mobber)

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
        subject.add(mobber)
        subject.add(nextMobber)

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      it('excludes disabled mobbers', () => {
        subject.add(mobber)
        subject.add({ name: 'Not Me', disabled: true })
        subject.add(nextMobber)

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
        subject.add(mobber)

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
        subject.add(nextMobber)
        subject.add(mobber)

        subject.rotate()

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      it('loops through the list', () => {
        subject.add(mobber)
        subject.add(nextMobber)

        subject.rotate()
        subject.rotate()

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      it('excludes disabled mobbers', () => {
        subject.add({ name: 'Not Me', disabled: false })
        subject.add(mobber)
        subject.add({ name: 'Disabled One', disabled: true })
        subject.add({ name: 'Disaabled Two', disabled: true })
        subject.add(nextMobber)

        subject.rotate()

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })
    })
  })

  describe('#remove', () => {
    let otherMobber

    beforeEach(() => {
      otherMobber = { id: 'mobber-2', name: 'Other Mobber', image: '/path/to/image' }
    })

    it('removes the mobber by id', () => {
      subject.add(mobber)
      subject.add({ name: 'Remove Me', id: 'remove-me' })
      subject.add(otherMobber)

      subject.remove('remove-me')

      expect(subject.getAll()).to.deep.equal([mobber, otherMobber])
    })

    describe('when the id does not match a mobber', () => {
      it('does nothing', () => {
        subject.add(mobber)
        subject.add(otherMobber)

        subject.remove('remove-me')

        expect(subject.getAll()).to.deep.equal([mobber, otherMobber])
      })
    })

    describe('when the current mobber is removed', () => {
      let expected

      beforeEach(() => {
        expected = { current: mobber, next: otherMobber }
      })

      it('updates the current and next mobbers', () => {
        subject.add(otherMobber)
        subject.add({ name: 'Remove Me', id: 'remove-me' })
        subject.add(mobber)
        subject.rotate()

        subject.remove('remove-me')

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      describe('when the current mobber is the last active mobber in the list', () => {
        it('loops through the list', () => {
          subject.add(mobber)
          subject.add(otherMobber)
          subject.add({ name: 'No one of consequence', disabled: true })
          subject.add({ name: 'Remove Me', id: 'remove-me' })
          subject.rotate()
          subject.rotate()

          subject.remove('remove-me')

          expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
        })
      })
    })
  })

  describe('#update', () => {
    beforeEach(() => {
      mobber = { id: 'mobber-1', name: 'Testerson', image: '/path/to/image' }
    })

    it('replaces the mobber matching the id', () => {
      const otherMobber = { id: 'other-id', name: 'Other Mobber', image: '/other/image' }
      const updatedMobber = { id: mobber.id, name: 'Updated Mobber', image: '/updated/image' }
      subject.add(mobber)
      subject.add(otherMobber)

      subject.update(updatedMobber)

      expect(subject.getAll()).to.deep.equal([updatedMobber, otherMobber])
    })

    describe('when the id does not match a mobber', () => {
      it('does nothing', () => {
        subject.add(mobber)
        subject.update({ id: 'other-id', name: 'Other Mobber', image: '/other/image' })

        expect(subject.getAll()).to.deep.equal([mobber])
      })
    })

    describe('when enabling a mobber', () => {
      it('does not change the current mobber', () => {
        const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
        const otherMobber = { id: 'mobber-3', name: 'Other Mobber', image: '/path/to/image', disabled: true }
        const expected = { current: nextMobber, next: mobber }
        subject.add(mobber)
        subject.add(otherMobber)
        subject.add(nextMobber)
        subject.rotate()

        subject.update({ id: 'mobber-3', name: 'Other Mobber', disabled: false })

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })
    })

    describe('when disabling a mobber', () => {
      it('does not change the current mobber', () => {
        const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
        const otherMobber = { id: 'mobber-3', name: 'Other Mobber', image: '/path/to/image' }
        const expected = { current: nextMobber, next: mobber }
        subject.add(mobber)
        subject.add(otherMobber)
        subject.add(nextMobber)
        subject.rotate()
        subject.rotate()

        subject.update({ id: 'mobber-3', name: 'Other Mobber', disabled: true })

        expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
      })

      describe('when disabling the current mobber', () => {
        it('changes to the next mobber', () => {
          const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
          const otherMobber = { id: 'mobber-3', name: 'Other Mobber', image: '/path/to/image' }
          const expected = { current: mobber, next: nextMobber }
          subject.add(otherMobber)
          subject.add(mobber)
          subject.add(nextMobber)

          subject.update({ id: 'mobber-3', name: 'Other Mobber', disabled: true })

          expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
        })

        describe('when the current mobber is at the end of the list', () => {
          it('loops through the list', () => {
            const nextMobber = { id: 'mobber-2', name: 'Next Mobber', image: '/path/to/image' }
            const otherMobber = { id: 'mobber-3', name: 'Other Mobber', image: '/path/to/image' }
            const expected = { current: mobber, next: nextMobber }
            subject.add(mobber)
            subject.add(nextMobber)
            subject.add(otherMobber)
            subject.rotate()
            subject.rotate()

            subject.update({ id: 'mobber-3', name: 'Other Mobber', disabled: true })

            expect(subject.getCurrentAndNextMobbers()).to.deep.equal(expected)
          })
        })
      })
    })
  })
})
