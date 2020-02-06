import assert from 'assert'
import { slugify, cleanForSearch } from '../utils.mjs'


describe('utils', () => {
  describe('#slugify()', () => {
    it('should slugify special chars', () => {
      assert.equal(slugify(" WhåT??!&it's -/élégant* "), 'what-et-its-elegant')
    })
  })

  describe('#cleanForSearch()', () => {
    it('should remove blacklisted words', () => {
      assert.equal(cleanForSearch(" de  toi à moi  "), 'toi moi')
    })
    it('should remove blacklisted words', () => {
      assert.equal(cleanForSearch("toto aux tata"), "toto tata")
    })
    it('should singularize words', () => {
      assert.equal(cleanForSearch("lenteurs maux"), "lenteur mal")
    })
    it('should translate synonyms', () => {
      assert.equal(cleanForSearch("douleurs aux épaules"), "mal epaule")
    })
    it('should remove duplicates', () => {
      assert.equal(cleanForSearch("maux et douleurs aux articulations"), "mal articulation")
    })
  })
})
