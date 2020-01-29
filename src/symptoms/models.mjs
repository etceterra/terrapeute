import fs from 'fs'
import mongoose from 'mongoose'
import elasticlunr from 'elasticlunr'


mongoose.connect('mongodb://localhost:27017/terrapeutes', {useNewUrlParser: true, useUnifiedTopology: true })


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

SymptomSchema.methods.search = function (q) {
  // q = q.split(' ').filter(s => {
  //   return s.length > 2
  // }).join(' ')
  return this.find({ $text: { $search: q } })
}

SymptomSchema.pre('save', function(next) {
  const keywords = [...this.name.split(' '), ...new Set(this.synonyms)]
    .filter(k => k.length > 2)
    .map(k => {
      return k.normalize('NFD').toLowerCase().replace(/[\u0300-\u036f]/g, '')
    })
  this.keywords = keywords.join(' ')
  return next()
})

SymptomSchema.index({ keywords: 'text' })


const Symptom = mongoose.model('Symptom', SymptomSchema)

export { Symptom, indexer }
