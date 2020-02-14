import mongoose from 'mongoose'
import { cleanForSearch } from '../utils.mjs'


mongoose.connect('mongodb://localhost:27017/terrapeute', {useNewUrlParser: true, useUnifiedTopology: true })


const Therapy = mongoose.model('Therapy', {
  slug: String,
  name: String,
  airtableId: String,
})

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
  cost: String,
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
