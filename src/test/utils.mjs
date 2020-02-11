import assert from 'assert'
import { slugify, cleanForSearch } from '../utils.mjs'


describe('utils', () => {
  describe('#slugify()', () => {
    it('should slugify special chars', () => {
      assert.equal(slugify(" WhåT??!&it's -/élégant aujourd'hui* "), 'what-et-it-s-elegant-aujourd-hui')
      assert.equal(slugify(" l'Essence "), 'essence')
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
      assert.equal(cleanForSearch("lenteurs"), "lenteur")
      assert.equal(cleanForSearch("mentaux"), "mental")
    })
    it('should translate synonyms', () => {
      assert.equal(cleanForSearch("brûlures à l'estomac"), "estomac")
    })
    it('should preserve whitelist words', () => {
      assert.equal(cleanForSearch("Les os du dos"), "os dos")
    })
    it('should remove duplicates, and blacklist', () => {
      assert.equal(cleanForSearch("très mal, douleurs aux articulations"), "articulation")
    })
  })
})
