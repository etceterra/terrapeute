import mongoose from 'mongoose'
import { cleanForSearch } from '../utils.mjs'


mongoose.connect('mongodb://localhost:27017/terrapeute', {useNewUrlParser: true, useUnifiedTopology: true })


const TherapySchema = mongoose.Schema({
  slug: String,
  name: String,
  airtableId: String,
})

TherapySchema.query.byTherapists = function(therapists = []) {
  return this.find({ _id: { $in: [].concat.apply([], therapists.map(t => t.therapies)) }})
}

const Therapy = mongoose.model('Therapy', TherapySchema)


const GeoLocation = new mongoose.Schema({
  coordinates: [Number],
  type: { type: String, default: 'Point' },
  index: { type: String, default: '2dsphere' },
})

const SymptomSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  parent: { type: String, ref: 'Symptom' },
  synonyms: [String],
  keywords: String,
  airtableId: String,
  airtableParentId: String,
})

SymptomSchema.pre('save', function(next) {
  const parentKeywords = this.parent ? this.parent.keywords.split(' ') : []
  const keywords = [this.name, ...this.synonyms, parentKeywords]
  this.keywords = cleanForSearch(keywords.join(' '))
  return next()
})

SymptomSchema.statics.search = function (q = '') {
  q = cleanForSearch(q)
  q = q.trim().split(' ').map(w => `"${w}"`).join(' ')
  return this.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
}

SymptomSchema.index({ keywords: 'text' })

const Symptom = mongoose.model('Symptom', SymptomSchema)


const Office = new mongoose.Schema({
  street: String,
  zipCode: String,
  city: String,
  country: { type: String, default: 'ch' },
  pictures: [String],
  location: GeoLocation,
})

const TherapistSchema = new mongoose.Schema({
  slug: { type: String, unique: true },
  firstname: String,
  lastname: String,
  email: String,
  phone: String,
  isCertified: Boolean,
  description: String,
  price: String,
  timetable: String,
  languages: [String],
  photo: String,
  socials: [Object],
  therapies: [{ type: mongoose.ObjectId, ref: Therapy }],
  agreements: [String],
  paymentTypes: [String],
  symptoms: [{ type: mongoose.ObjectId, ref: Symptom }],
  offices: [Office],
  creationDate: { type: Date, default: Date.now },
  expirationDate: Date,
  disabled: Boolean,
  airtableId: String,
})

TherapistSchema.statics.matchSymptoms = async function (symptoms = [], therapists = []) {
  if(!symptoms.length) return []
  const aggregation = [
    { $addFields: { countSymptoms: { $size: "$symptoms" } } },
    { $sort: { countSymptoms: 1 } },
    { $match: { symptoms: { $in: symptoms.map(s => s._id) } } }
  ]
  if(therapists.length) aggregation.push({ $match: { _id: { $in: therapists.map(t => t._id) }}})
  const therapistsRaw = await Therapist.aggregate(aggregation)
  return therapistsRaw.map(t => Therapist(t))
}

TherapistSchema.query.byTherapy = function (therapy) {
  return this.find({ therapies: { $in: [therapy] } })
}

TherapistSchema.virtual('photoUrl').get(function() {
  return this.photo
})

TherapistSchema.virtual('name').get(function() {
  return `${this.firstname} ${this.lastname}`
})

TherapistSchema.virtual('city').get(function() {
  return this.offices.length && this.offices[0].city
})

TherapistSchema.virtual('url').get(function() {
  return `/${this.slug}/${this.airtableId}`
})

const Therapist = mongoose.model('Therapist', TherapistSchema)


export { Therapist, Therapy, Symptom }
