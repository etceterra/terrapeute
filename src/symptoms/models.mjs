import fs from 'fs'
import mongoose from 'mongoose'
import elasticlunr from 'elasticlunr'
import { cleanForSearch } from '../utils.mjs'


mongoose.connect('mongodb://localhost:27017/terrapeute', { useNewUrlParser: true, useUnifiedTopology: true })


const indexer = elasticlunr(function () {
  this.addField('name')
  this.addField('keywords')
})

const SymptomSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  parent: { type: String, ref: 'Symptom' },
  synonyms: [String],
  keywords: String,
  airtableId: String,
  airtableParentId: String,
})

SymptomSchema.statics.search = function (q) {
  q = cleanForSearch(q)
  q = q.split(' ').map(w => `"${w}"`).join(' ')
  return this.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
}

SymptomSchema.pre('save', function(next) {
  this.keywords = cleanForSearch(this.name + ' ' + this.synonyms.join(' '))
  return next()
})

SymptomSchema.index({ keywords: 'text' })


const Symptom = mongoose.model('Symptom', SymptomSchema)

export { Symptom, indexer }
