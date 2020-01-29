import { Therapist } from './models.mjs'
import { Symptom } from '../symptoms/models.mjs'
import Vcard from 'vcards-js'


export default function (app, prefix = '') {

  app.get('/therapeutes', async (req, res) => {
    const q = req.query.q && req.query.q.trim()
    const symptoms = q ? await Symptom.find({ $text: { $search: q } }) : []
    const therapists = await Therapist.find()
    res.render('therapists', { therapists, q, symptom: q })
  })

  app.get('/therapeutes/:therapy', async (req, res) => {
    let therapy = req.params.therapy
    const filter = `SEARCH("${therapy}", LOWER(Therapies))`
    let therapists = await Therapist.getAll(filter, [{ field: 'therapies' }])
    therapists = therapists.filter(p => !p.disabled)
    res.render('therapists', { therapists, therapy })
  })

  app.get(`${prefix}/:slug0/:slug1/:id.vcf`, async (req, res) => {
    const therapist = await Therapist.findById(req.params.id)
    const vcard = Vcard()
    vcard.firstName = therapist.firstname
    vcard.lastName = therapist.lastname
    vcard.workPhone = therapist.phone
    vcard.workEmail = therapist.email
    if (therapist.socials) {
      vcard.workUrl = therapist.socials.website
      // ignoring social networks, vCard renders 'CHARSET:UTF8' instead.
      // try {
      //   vcard.socialUrls['facebook'] = 'https://...'
      // } catch(e) {}
    }
    if (therapist.photoUrl) vcard.photo.attachFromUrl(therapist.photoUrl, 'JPEG')
    vcard.note = therapist.timetable
    // if (therapist.therapies) vcard.title = vcard.role = therapist.therapies.map(t => therapies[t]).join(', ')
    vcard.organization = 'Thérapeute membre de Terrapeutes.com'
    vcard.source = req.url
    const office = therapist.offices.length && therapist.offices[0]
    if(office) {
      vcard.workAddress.label = 'Cabinet'
      vcard.workAddress.street = office.street
      vcard.workAddress.city = office.city
      vcard.workAddress.postalCode = office.zipCode
      vcard.workAddress.countryRegion = office.country
    }
    res.set('Content-Type', `text/vcard; name="${therapist.firstname}-${therapist.lastname}.vcf"`)
    res.set('Content-Disposition', `inline; filename="${therapist.firstname}-${therapist.lastname}.vcf"`)
    res.send(vcard.getFormattedString())
  })

  app.get(`${prefix}/:slug0/:slug1/:id`, async (req, res) => {
    const therapist = await Therapist.findById(req.params.id)
    res.render('therapist', { therapist })
  })
}
