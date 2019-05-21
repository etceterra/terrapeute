import assert from 'assert'
import { slugify, cleanForSearch } from '../utils'


describe('utils', () => {
  describe('#slugify()', () => {
    it('should slugify special chars', () => {
      assert.equal(slugify(" WhåT??!&it's -/élégant* "), 'what-and-its-elegant')
    })
  })

  describe('#cleanForSearch()', () => {
    it('should remove blacklisted words', () => {
      assert.equal(cleanForSearch(" de  temps en temps  "), 'temps temps')
    })
  })
})
