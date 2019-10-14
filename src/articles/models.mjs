import mongoose from 'mongoose'

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
  return this.body.replace(/\/s*/g, ' ')
})

ArticleSchema.pre('save', function(next) {
  if(!this.slug) this.slug = slugify(this.title)
  if(typeof(this.tags) === 'string') this.tags = this.tags.split(',').map(t => t.trim())
  return next()
})

const Article = mongoose.model('Article', ArticleSchema)

export { Article }
