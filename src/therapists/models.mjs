import mongoose from 'mongoose'


mongoose.connect('mongodb://localhost:27017/therapeutes', {useNewUrlParser: true})

const Provider = mongoose.model('Provider', {
  slug: String,
  email: String,
  phone: String,
  firstname: String,
  lastname: String,
  photo: String,
  street: String,
  zipCode: String,
  city: String,
  country: String,
  pictures: [String],
  latlng: [Number],
  description: String,
  socials: [String],
  therapy: String,
  agreements: [String],
  symptoms: [String],
  timetable: String,
  cost: String,
  paymentTypes: [String],
  creationDate: { type: Date, default: Date.now },
})

export default Provider
