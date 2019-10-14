import mongoose from 'mongoose'
import filters from 'nunjucks/src/filters.js'
import marked from 'marked'

import { slugify } from '../utils.mjs'


mongoose.connect('mongodb://localhost:27017/terrapeutes', { useNewUrlParser: true, useUnifiedTopology: true })

const ArticleSchema = new mongoose.Schema({
  slug: String,
  title: String,
  body: String,
  tags: [String],
  therapist: { type: mongoose.Schema.Types.ObjectId },
  creationDate: { type: Date, default: Date.now },
})
ArticleSchema.virtual('label').get(function () {
  return this.title
})
ArticleSchema.virtual('summary').get(function () {
  if (!this.body) return ''
  return filters.striptags(marked(this.body)).substr(0, 250)
})

ArticleSchema.pre('save', function(next) {
  if(!this.slug) this.slug = slugify(this.title)
  if(typeof(this.tags) === 'string') this.tags = this.tags.split(',').map(t => t.trim())
  return next()
})

const Article = mongoose.model('Article', ArticleSchema)

export { Article }
