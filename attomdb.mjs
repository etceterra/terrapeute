import airtable from './src/models/airtable.mjs'
// import { Provider, Therapy, Symptom } from './src/models/providers.mjs'
import request from 'request-promise-native'

import { Therapist } from './src/therapists/models.mjs'


// async function getSymptom(data) {
//   console.log('searching for airtable', data.Name, data.id)
//   let symptom = await Symptom.findOne({ airtableId: data.id })
//   console.log('found', symptom && symptom.airtableId)
//   if(!symptom) {
//     symptom = await createSymptomFromAirtable(data)
//     console.log('couldnt find, created', symptom.name)
//   }
//   return symptom
// }

// async function createSymptomFromAirtable(data) {
//   const parentId = data.parent && data.parent.length && data.parent[0]
//   const parent = (parentId && airtable.symptoms[parentId] && await getSymptom(airtable.symptoms[parentId])) || undefined
//   const symptom = new Symptom({
//     airtableId: data.id,
//     name: data.Name,
//     parent: parent,
//     synonyms: data.synonyms && data.synonyms.split(',').map(w => w.trim()),
//   })
//   return await symptom.save()
// }

// async function transferSymptoms () {
//   await Symptom.deleteMany({})
//   await airtable.preload()
//   Object.keys(airtable.symptoms).forEach(async airtableId => {
//     const s = airtable.symptoms[airtableId]
//     if(!s.Name) return
//     const symptom = await createSymptomFromAirtable(s)
//   })
// }



async function transferTherapies () {
  const therapies = await airtable.Therapy.getAll()
  therapies.forEach(async t => {
    const therapy = new Therapy({
      slug: t.slug,
      name: t.name,
      providers: []
    })
    await therapy.save()
    console.log(t)
  })
}


async function transferProviders () {
  await Therapist.deleteMany({})
  const providers = await airtable.Provider.getAll()
  providers.forEach(async (atp) => {
    if(await Therapist.count({airtableId: atp.id})) return
    //
    // const therapies = await Promise.all(atp.therapies.map(async t => await Therapy.findOne({ slug: t.slug })))
    //
    const offices = [{
      location: { coordinates: atp.latlng.split(',') },
      street: atp.street,
      city: atp.city,
      zipcode: atp.zipcode,
      country: 'ch',
      photos: atp.pictures && await Promise.all(atp.pictures.map(async pic => request({ encoding: null, uri: pic.url })))
    }]
    // Provider photo
    const provider = new Therapist({
      firstname: atp.firstname,
      lastname: atp.lastname,
      slug: atp.slug,
      email: atp.email,
      phone: atp.phone,
      description: atp.description,
      socials: Object.keys(atp.socials).map(name => ({ name, url: atp.socials[name] })) || [],
      offices: offices || [],
      // therapies,
      agreements: atp.agreements || [],
      symptoms: atp.symptoms || [],
      timetable: atp.timetable,
      cost: atp.cost,
      photo: atp.id,
      paymentTypes: atp.paymentTypes,
      creationDate: atp.creationDate,
      expirationDate: atp.expirationDate,
      languages: atp.languages || [],
      therapies: [],
      airtableId: atp.id,
    })
    const p = await provider.save()
    console.debug(p)
  })
}

// transferSymptoms()
// transferTherapies()
transferProviders()
