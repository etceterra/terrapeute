import Airtable from 'airtable'
import config from './config.js'
import request from 'request-promise-native'
import crypto from 'crypto'

import { Therapist, Therapy, Symptom, TherapistPending } from './therapists/models.js'

Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: config.AIRTABLE_API_KEY })
const db = Airtable.base('app1Ab6PilgNTXMYp')
const ProviderTable = db.table('Therapeutes')
const SymptomTable = db.table('Symptomes')
const TherapyTable = db.table('Therapies')
let therapies = []
let symptoms = []


async function preload() {
  const therapyData = await TherapyTable.select().all()
  therapyData.forEach(t => therapies[t.id] = Object.assign({}, t.fields, { id: t.id }))
  const symptomData = await SymptomTable.select().all()
  symptomData.forEach(s => symptoms[s.id] = Object.assign({}, s.fields, { id: s.id }))
}


const AirtableProvider = {
  toInstance(p) {
    if(!p.id) return {}
    const provider = Object.assign({ id: p.id }, p.fields)
    provider.therapies = provider.therapies ? provider.therapies.map(t => therapies[t]) : []
    provider.therapies_name = provider.therapies.filter(t => t).map(t => t.name)
    provider.name = `${provider.firstname} ${provider.lastname}`
    provider.url = `/${provider.slug}/${provider.id}`
    provider.socials = provider.socials ? JSON.parse(provider.socials) : {}
    if(!provider.agreements) provider.agreements = []
    return provider
  },

  async getAll(params, sort) {
    const filters = {}
    if (params) filters.filterByFormula = params
    if (sort) filters.sort = sort
    const data = await ProviderTable.select(filters).all()
    return data.filter(p => p.fields.slug).map(p => this.toInstance(p))
  },

  async find(id) {
    const result = await ProviderTable.find(id)
    return this.toInstance(result)
  },
}

const AirtableTherapy = {
  async getAll(params, sort) {
    const filters = {}
    if (params) filters.filterByFormula = params
    if (sort) filters.sort = sort
    const data = await TherapyTable.select(filters).firstPage()
    return data.filter(p => p.fields.slug).map(p => this.toInstance(p))
  },

  toInstance(t) {
    if (!t.id) return {}
    return Object.assign({ id: t.id }, t.fields)
  },
}

async function transferSymptoms () {
  await Symptom.deleteMany({})
  return Promise.all(Object.keys(symptoms).map(async airtableId => {
    const data = symptoms[airtableId]
    if(!data.Name) return
      const symptom = new Symptom({
      airtableId: data.id,
      airtableParentId: data.parent && data.parent.length && data.parent[0],
      name: data.Name,
      synonyms: data.synonyms && data.synonyms.split(',').filter(w => w.trim()).map(w => w.trim()),
    })
    return await symptom.save()
  }))
}

async function consolidateSymptoms () {
  const symptoms = await Symptom.find()
  try {
    await Promise.all(symptoms.forEach(async symptom => {
      const parent = symptoms.find(s => s.airtableId === s.airtableParentId)
      if(!parent) return
      symptom.parent = parent
      return await symptom.save()
    }))
  } catch (e) {}
}


async function transferTherapies () {
  const therapies = await AirtableTherapy.getAll()
  await Therapy.deleteMany({})
  return Promise.all(therapies.filter(t => t.slug.slice(0, 1) !== '_').map(async t => {
    const therapy = new Therapy({
      slug: t.slug,
      name: t.name,
      airtableId: t.id,
    })
    return await therapy.save()
  }))
}


async function transferProviders () {
  await Therapist.deleteMany({})
  const providers = await AirtableProvider.getAll()
  const therapies = await Therapy.find()
  const symptoms = await Symptom.find()
  return Promise.all(providers.filter(p => p.statut === 'confirme').map(async (atp) => {
    const pictures = atp.pictures && await Promise.all(atp.pictures.map(async pic => pic.url))
    const offices = [{
      location: { coordinates: (atp.latlng || '').split(',') },
      street: atp.street,
      city: atp.city,
      zipCode: atp.zipcode,
      country: 'ch',
      pictures
    }]
    const therapistSymptoms = atp.Symptomes ? atp.Symptomes.map(airtableId => symptoms.find(s => s.airtableId == airtableId)) : []

    let photo = atp.photo && atp.photo[0].url
    if(!photo) {
      const hash = crypto.createHash('md5').update(atp.email).digest('hex')
      try {
        await request.get(`https://gravatar.com/avatar/${hash}?s=1&d=404`)
        photo = `https://gravatar.com/avatar/${hash}?s=500`
      }
      catch(e) {
        console.error('no photo for', atp.name)
      }
    }

    const therapist = new Therapist({
      firstname: atp.firstname,
      lastname: atp.lastname,
      slug: atp.slug,
      email: atp.email,
      phone: atp.phone,
      description: atp.description,
      socials: Object.keys(atp.socials).map(name => ({ name, url: atp.socials[name] })) || [],
      offices: offices || [],
      agreements: atp.agreements || [],
      symptoms: therapistSymptoms,
      timetable: atp.timetable,
      isCertified: atp.is_certified,
      price: atp.price,
      photo,
      paymentTypes: atp.payment_means,
      creationDate: atp.creation_date,
      expirationDate: atp.expirationDate,
      languages: atp.languages || [],
      therapies: atp.therapies ? atp.therapies.filter(at => at).map(at => therapies.find(t => t.airtableId === at.id)) : [],
      airtableId: atp.id,
    })
    return await therapist.save()
  }))
}

async function transferPendingProviders () {
  await TherapistPending.deleteMany({ confirmed: { $nin: [true] } })
  const providers = await AirtableProvider.getAll()
  const therapies = await Therapy.find()
  const symptoms = await Symptom.find()
  return Promise.all(providers.filter(p => p.statut === 'en attente').map(async (atp) => {
    const pictures = atp.pictures && await Promise.all(atp.pictures.map(async pic => pic.url))
    const offices = [{
      location: { coordinates: (atp.latlng || '').split(',') },
      street: atp.street,
      city: atp.city,
      zipCode: atp.zipcode,
      country: 'ch',
      pictures
    }]
    const therapistSymptoms = atp.Symptomes ? atp.Symptomes.map(airtableId => symptoms.find(s => s.airtableId == airtableId)) : []

    let photo = atp.photo && atp.photo[0].url
    if(!photo) {
      const hash = crypto.createHash('md5').update(atp.email).digest('hex')
      try {
        await request.get(`https://gravatar.com/avatar/${hash}?s=1&d=404`)
        photo = `https://gravatar.com/avatar/${hash}?s=500`
      }
      catch(e) {
        console.error('no photo for', atp.name)
      }
    }

    const therapies = (atp.therapies || []).filter(at => at).reduce((acc, at) => {
      const therapy = atp.therapies.find(t => t.airtableId === at.id)
      if(therapy) acc.push(at)
      return acc
    }, [])


    const therapist = new TherapistPending({
      slug: atp.slug,
      name: `${atp.firstname} ${atp.lastname}`,
      email: atp.email,
      phone: atp.phone,
      isCertified: atp.is_certified,
      description: atp.description,
      price: atp.price,
      timetable: atp.timetable,
      languages: atp.languages || [],
      photo,
      socials: Object.keys(atp.socials).map(name => ({ name, url: atp.socials[name] })) || [],
      therapies,
      agreements: atp.agreements || [],
      paymentTypes: atp.payment_means,
      // symptoms: [{ type: mongoose.ObjectId, ref: Symptom }],
      offices: offices || [],
      creationDate: atp.publication_date || atp.creation_date,
      expirationDate: atp.expirationDate,
      airtableId: atp.id,
    })
    try {
      return await therapist.save()
    }
    catch(e) {
      console.error(e)
    }
  }))
}

async function transferAll() {
  await preload()
  console.info('...Importing symptoms')
  await transferSymptoms()
  console.info('.......consolidate symptoms')
  await consolidateSymptoms()
  console.info('...Importing therapies')
  await transferTherapies()
  console.info('...Importing therapists confirmed and pending')
  await transferProviders()
  await transferPendingProviders()
  const message = 'completed!'
  console.info(message)
  return message
}

export default { transferAll }
