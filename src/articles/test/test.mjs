import assert from 'assert'
import { Article } from '../models.mjs'


describe('Article', () => {
  it('should create a slug', async () => {
    const article = await Article.create({ title: 'This is my title' })
    assert.equal(article.slug, 'this-is-my-title')
  })
})
