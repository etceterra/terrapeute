import { Provider } from './airtable.mjs'
import Vcard from 'vcards-js'

export default function (app, prefix = '') {

  app.get('/therapeutes', async (req, res) => {
    let q = req.query.q && req.query.q.trim()
    const filter = q && `SEARCH("${q}", LOWER(Symptomes))`
    let providers = await Provider.getAll(filter, [{ field: 'symptoms_count' }])
    providers = providers.filter(p => !p.disabled)
    res.render('providers', { providers, q })
  })

  app.get('/therapeutes/:therapy', async (req, res) => {
    let therapy = req.params.therapy
    const filter = `SEARCH("${therapy}", LOWER(Therapies))`
    let providers = await Provider.getAll(filter, [{ field: 'therapies' }])
    providers = providers.filter(p => !p.disabled)
    res.render('providers', { providers, q: therapy })
  })

  app.get(`${prefix}/:slug0/:slug1/:id`, async (req, res) => {
    const provider = await Provider.find(req.params.id)
    res.render('provider', { provider })
  })

  app.get(`${prefix}/:slug0/:slug1/:id/vcf`, async (req, res) => {
    const provider = await Provider.find(req.params.id.split('.')[0])
    const vcard = Vcard()
    vcard.firstName = provider.firstname
    vcard.lastName = provider.lastname
    vcard.workPhone = provider.phone
    vcard.workEmail = provider.email
    if (provider.socials) {
      vcard.workUrl = provider.socials.website
      // ignoring social networks, vCard renders 'CHARSET:UTF8' instead.
      // try {
      //   vcard.socialUrls['facebook'] = 'https://...'
      // } catch(e) {}
    }
    if (provider.photo) vcard.photo.attachFromUrl(provider.photo[0].url, 'JPEG')
    vcard.note = provider.timetable
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
