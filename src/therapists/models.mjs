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
  console.debug('searching for', q)
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

TherapistSchema.query.enabled = function (args) {
  args = Object.assign({ disabled: { $ne: true } }, args)
  return this.find(args)
}

TherapistSchema.query.byTherapy = function (therapy) {
  return this.enabled({ therapies: { $in: [therapy] } })
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

TherapistSchema.virtual('extraData').get(async function() {
  const inst = await TherapistData.findOne({ therapistAirtableId: this.airtableId })
  const data = inst.data || {epmty: true}
  return data
})

TherapistSchema.methods.toJSON = async function() {
  const keys = ['firstname', 'lastname', 'phone', 'email', 'offices']
  const values = keys.reduce((value, k) => {
    value[k] = this[k]
    return value
  }, {})
  values.id = this._id
  const therapistData = await TherapistData.findOne({ therapistAirtableId: this.airtableId })
  values.extraData = therapistData.data
  return values
}

const Therapist = mongoose.model('Therapist', TherapistSchema)


const TherapistDataSchema = new mongoose.Schema({
  therapistAirtableId: { type: String, unique: true },
  data: Object,
})

const TherapistData = mongoose.model('TherapistData', TherapistDataSchema)


export { Therapist, TherapistData, Therapy, Symptom }
