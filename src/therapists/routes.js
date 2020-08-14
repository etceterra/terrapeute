import Vcard from 'vcards-js'
import { Therapist, Therapy, Symptom, TherapistPending } from './models.js'

const languageCodes = {
  'fr': 'français',
  'en': 'anglais',
  'de': 'allemand',
  'nl': 'néerlandais',
  'it': 'italien',
  'ru': 'russe',
  'es': 'espagnol',
}

async function getTherapies() {
  return await Therapy.find()
}

export default function (app, prefix = '') {

  app.get('*', async (req, res, next) => {
    let queryParams = req.url.split('?')
    queryParams = queryParams.length > 1 ? queryParams = '?' + queryParams.pop() : ''
    res.locals = { queryParams }
    next()
  })

  app.get('/therapeutes', async (req, res) => {
    const therapy = req.query.therapy
    if(therapy) {
      const instance = await Therapy.findOne({ name: therapy })
      return res.redirect(`/therapeutes/${instance.slug}`)
    }
    let symptoms = []
    const q = req.query.symptom
    let therapies
    let therapists = await Therapist.find().populate('therapies')
    if(q) {
      symptoms = await Symptom.search(q)
      therapists = await Therapist.matchSymptoms(symptoms)
      therapies = await Therapy.find()
    }
    else {
      therapies = await getTherapies()
    }
    res.render('therapists', { therapists, symptoms, therapies, q, queryParams: res.locals.queryParams })
  })

  app.get(`/attente/*`, async (req, res) => {
    const therapist = await TherapistPending.findOne({ slug: req.params[0] })
    console.debug(therapist)
    if(!therapist) res.status(404).send('Therapist not found')
    res.render('therapist-pending', { request: req, therapist, dict: languageCodes })
  })

  app.post(`/attente/*`, async (req, res) => {
    const therapist = await TherapistPending.findOne({ slug: req.params[0] })
    therapist.confirmed = true
    await therapist.save()
    if(!therapist) res.status(404).send('Therapist not found')
    return res.redirect(`/attente/${therapist.slug}`)
  })

  app.get('/therapeutes/:therapy', async (req, res) => {
    const therapy = await Therapy.findOne({ slug: req.params.therapy })
    if(!therapy) return res.status(404).send('Therapy not found')
    const q = req.query.q
    let therapists
    let symptoms = []
    const therapistsAll = await Therapist.find().byTherapy(therapy).populate('therapies')
    if(q) {
      symptoms = await Symptom.search(q)
      therapists = await Therapist.matchSymptoms(symptoms, therapistsAll)
    }
    else therapists = therapistsAll
    const therapies = await Therapy.find()

    res.render('therapists', { therapists, symptoms, therapies, therapy, q, queryParams: res.locals.queryParams })
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
    vcard.organization = 'Thérapeute membre de Naturapeute.ch'
    vcard.source = req.url
    const office = therapist.offices.length && therapist.offices[0]
    if(office) {
      vcard.workAddress.label = 'Cabinet'
      vcard.workAddress.street = office.street
      vcard.workAddress.city = office.city
      vcard.workAddress.postalCode = office.zipCode
      vcard.workAddress.countryRegion = office.country
    }
    res.set('Content-Type', `text/vcard; name="naturapeute-${therapist.firstname}-${therapist.lastname}.vcf"`)
    res.set('Content-Disposition', `inline; filename="${therapist.firstname}-${therapist.lastname}.vcf"`)
    res.send(vcard.getFormattedString())
  })

  app.get(`${prefix}/:slug0/:slug1/:airtableId`, async (req, res) => {
    let therapist = await Therapist.findOne({ airtableId: req.params.airtableId }).populate('therapies')
    if(!therapist) res.status(404).send('Therapist not found')
    res.render('therapist', { therapist, dict: languageCodes })
  })
}
