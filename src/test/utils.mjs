import assert from 'assert'
import { slugify, cleanForSearch, bbcode } from '../utils.mjs'


describe('utils', () => {
  describe('#slugify()', () => {
    it('should slugify special chars', () => {
      assert.equal(slugify(" WhåT??!&it's -/élégant aujourd'hui* "), 'what-et-it-s-elegant-aujourd-hui')
      assert.equal(slugify(" l'Essence "), 'l-essence')
    })
  })
  describe('#bbcode()', () => {
    it('should return non code as original', () => {
      assert.equal(bbcode("test me"), 'test me')
    })
    it('should convert single code to html', () => {
      assert.equal(bbcode("[span]hey[/span]"), '<span>hey</span>')
    })
    it('should convert multiple codes to html', () => {
      assert.equal(bbcode("[span]hey[/span] and [a]link[/a]"), '<span>hey</span> and <a>link</a>')
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
