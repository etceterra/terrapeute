import Vcard from 'vcards-js'
import { Therapist, Therapy, Symptom } from './models.mjs'


async function getTherapies() {
  return await Therapy.find()
}

export default function (app, prefix = '') {

  app.get('*', async (req, res, next) => {
    let queryParams = req.url.split('?').pop()
    if(queryParams) queryParams = '?' + queryParams
    res.locals = { queryParams }
    next()
  })

  app.get('/therapeutes', async (req, res) => {
    let therapists
    let symptoms = []
    const q = req.query.q
    console.debug(req.query)
    if(q) {
      symptoms = await Symptom.search(req.query.q)
      therapists = await Therapist.matchSymptoms(symptoms)
    }
    else therapists = await Therapist.find()
    res.render('therapists', { therapists, symptoms, therapies: await getTherapies(), q, queryParams: res.locals.queryParams })
  })

  app.get('/therapeutes/:therapy', async (req, res) => {
    const therapy = await Therapy.findOne({ slug: req.params.therapy })
    if(!therapy) return res.status(404).send('Therapy not found')
    const q = req.query.q
    const symptoms = await Symptom.search(q)
    let therapists
    therapists = await Therapist.find().byTherapy(therapy)
    therapists = await Therapist.matchSymptoms(symptoms, therapists)

    res.render('therapists', { therapists, symptoms, therapies: await getTherapies(), therapy, q, queryParams: res.locals.queryParams })
  })

  app.get(`${prefix}/:slug0/:slug1/:id.vcf`, async (req, res) => {
    const therapist = await Therapist.findOne({airtableId: req.params.id})
    const vcard = Vcard()
    vcard.firstName = therapist.firstname
    vcard.lastName = therapist.lastname
    vcard.workPhone = therapist.phone
    vcard.workEmail = therapist.email
    if (therapist.socials) vcard.workUrl = therapist.socials.website
    if (therapist.photoUrl) vcard.photo.attachFromUrl(therapist.photoUrl, 'JPEG')
    vcard.note = therapist.timetable
    vcard.organization = 'Thérapeute membre de Terrapeute.ch'
    vcard.source = req.url
    const office = therapist.offices.length && therapist.offices[0]
    if(office) {
      vcard.workAddress.label = 'Cabinet'
      vcard.workAddress.street = office.street
      vcard.workAddress.city = office.city
      vcard.workAddress.postalCode = office.zipCode
      vcard.workAddress.countryRegion = office.country
    }
    res.set('Content-Type', `text/vcard; name="terrapeute-${therapist.firstname}-${therapist.lastname}.vcf"`)
    res.set('Content-Disposition', `inline; filename="${therapist.firstname}-${therapist.lastname}.vcf"`)
    res.send(vcard.getFormattedString())
  })

  app.get(`${prefix}/:slug0/:slug1/:airtableId`, async (req, res) => {
    let therapist = await Therapist.findOne({ airtableId: req.params.airtableId }).populate('therapies')
    if(!therapist) res.status(404).send('Therapist not found')
    res.render('therapist', { therapist })
  })
}
