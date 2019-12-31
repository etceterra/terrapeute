import { Therapist } from './models.mjs'
import Vcard from 'vcards-js'
import mongoose from 'mongoose'


export default function (app, prefix = '') {

  app.get('/therapeutes', async (req, res) => {
    let q = req.query.q && req.query.q.trim()
    let therapists = await Therapist.find()
    res.render('providers', { therapists, q })
  })

  app.get('/therapeutes/:therapy', async (req, res) => {
    let therapy = req.params.therapy
    const filter = `SEARCH("${therapy}", LOWER(Therapies))`
    let therapists = await Therapist.getAll(filter, [{ field: 'therapies' }])
    therapists = therapists.filter(p => !p.disabled)
    res.render('providers', { therapists, q: therapy })
  })

  app.get(`${prefix}/:slug0/:slug1/:id`, async (req, res) => {
    const therapist = await Therapist.findOne({ id: mongoose.ObjectId(req.params.id) })
    res.render('provider', { therapist })
  })

  app.get(`${prefix}/:slug0/:slug1/:id/vcf`, async (req, res) => {
    const therapist = await Therapist.find(req.params.id.split('.')[0])
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
    // if (provider.therapies) vcard.title = vcard.role = provider.therapies.map(t => therapies[t]).join(', ')
    vcard.organization = 'Thérapeute membre de Terrapeutes.com'
    vcard.source = req.url
    vcard.workAddress.label = 'Cabinet'
    vcard.workAddress.street = provider.street
    vcard.workAddress.city = provider.city
    vcard.workAddress.postalCode = provider.zipcode
    vcard.workAddress.countryRegion = provider.country
    res.set('Content-Type', `text/vcard; name="${provider.firstname}-${provider.lastname}.vcf"`)
    res.set('Content-Disposition', `inline; filename="${provider.firstname}-${provider.lastname}.vcf"`)
    res.send(vcard.getFormattedString())
  })

}
