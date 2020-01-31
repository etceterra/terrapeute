import process from 'process'

import airtable from './src/models/airtable.mjs'
import { Symptom } from './src/symptoms/models.mjs'
import request from 'request-promise-native'

import { Therapist, Therapy } from './src/therapists/models.mjs'


async function transferSymptoms () {
  await Symptom.deleteMany({})
  return Promise.all(Object.keys(airtable.symptoms).map(async airtableId => {
    const data = airtable.symptoms[airtableId]
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


async function transferTherapies () {
  const therapies = await airtable.Therapy.getAll()
  await Therapy.deleteMany({})
  return Promise.all(therapies.map(async t => {
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
  const providers = await airtable.Provider.getAll()
  const therapies = await Therapy.find()
  const symptoms = await Symptom.find()
  return Promise.all(providers.map(async (atp) => {
    const offices = [{
      location: { coordinates: atp.latlng.split(',') },
      street: atp.street,
      city: atp.city,
      zipcode: atp.zipcode,
      country: 'ch',
      photos: atp.pictures && await Promise.all(atp.pictures.map(async pic => request({ encoding: null, uri: pic.url })))
    }]
    const therapistSymptoms = atp.Symptomes ? atp.Symptomes.map(airtableId => symptoms.find(s => s.airtableId == airtableId)).filter(id => id) : []

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
      cost: atp.cost,
      photo: atp.photo && atp.photo[0].url,
      paymentTypes: atp.paymentTypes,
      creationDate: atp.creationDate,
      expirationDate: atp.expirationDate,
      languages: atp.languages || [],
      therapies: atp.therapies ? atp.therapies.filter(at => at).map(at => therapies.find(t => t.airtableId === at.id)) : [],
      airtableId: atp.id,
    })
    return await therapist.save()
  }))
}

async function load() {
  await airtable.preload()
  console.info('...Importing symptoms')
  await transferSymptoms()
  console.info('...Importing therapies')
  await transferTherapies()
  console.info('...Importing therapists')
  await transferProviders()
  console.info('completed!')
  process.exit()
}

load()
