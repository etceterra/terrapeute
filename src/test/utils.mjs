import assert from 'assert'
import { slugify } from '../utils'


describe('utils', () => {
  describe('#slugify()', () => {
    it('should slugify special chars', () => {
      assert.equal(slugify(" WhåT??!&it's -/élégant* "), 'what-and-its-elegant')
    });
  });
});
