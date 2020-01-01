import mongoose from 'mongoose'


mongoose.connect('mongodb://localhost:27017/therapeutes', {useNewUrlParser: true})


const Therapy = mongoose.model('Therapy', {
  slug: String,
  name: String,
})

const GeoLocation = new mongoose.Schema({
  coordinates: [Number],
  type: { type: String, default: 'Point' },
  index: { type: String, default: '2dsphere' },
})

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
  therapies: [mongoose.ObjectId],
  agreements: [String],
  paymentTypes: [String],
  symptoms: [String],
  offices: [Office],
  creationDate: { type: Date, default: Date.now },
  expirationDate: Date,
  disabled: Boolean,
  airtableId: String,
})

TherapistSchema.virtual('photoUrl').get(function() {
  return this.photo && `/uploads/therapists/${ this.photo }`
})

TherapistSchema.virtual('name').get(function() {
  return `${this.firstname} ${this.lastname}`
})

TherapistSchema.virtual('city').get(function() {
  return this.offices.length && this.offices[0].city
})

TherapistSchema.virtual('url').get(function() {
  return `/${this.slug}/${this.id}`
})

const Therapist = mongoose.model('Therapist', TherapistSchema)


export { Therapist, Therapy }
