import express from 'express'
import nunjucks from 'nunjucks'
import Airtable from 'airtable'
import Vcard from 'vcards-js'
import dotenv from 'dotenv'

dotenv.config()

const config = process.env

const app = express()

Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: config.AIRTABLE_API_KEY })
const db = Airtable.base('app1Ab6PilgNTXMYp')
const Provider = db.table('Therapeutes')
const Symptom = db.table('Symptomes')
const Therapy = db.table('Therapies')
let therapies = []
let symptoms = []

nunjucks.configure(`src/views`, {
    express: app,
    autoescape: true
});
app.set('view engine', 'html')
app.use(express.static('assets'))

app.get('/', (req, res) => res.render('index', { title: 'Hey', message: 'Hello there!' }))
app.get('/therapeutes', async (req, res) => {
  const data = await Provider.select().firstPage()
  const providers = data.map(p => Object.assign({ id: p.id }, p.fields)).map(p => {
    p.therapies = p.therapies.map(t => therapies[t])
    p.therapies_name = p.therapies.map(t => t.name)
    p.name = `${p.firstname} ${p.lastname}`
    return p
  })
  res.render('providers', { providers })
})

app.get('/:slug0/:slug1/:id', async (req, res) => {
  const response = await Provider.find(req.params.id)
  const provider = Object.assign({}, response.fields, {
    id: response.id,
    url: `/${req.params.slug0}/${req.params.slug1}/${req.params.id}`
  })
  res.render('provider', { provider })
})

app.get('/:slug0/:slug1/:id/vcf', async (req, res) => {
  const response = await Provider.find(req.params.id.split('.')[0])
  const provider = response.fields
  provider.id = response.id

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
  vcard.organization = 'Thérapeute chez Terrapeutes.com'
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

;(async () => {
  const therapyData = await Therapy.select().firstPage()
  therapyData.forEach(t => therapies[t.id] = t.fields)
  const symptomData = await Symptom.select().firstPage()
  symptomData.forEach(s => symptoms[s.id] = s.fields)
  app.listen(config.PORT, () => console.log(`App running on port ${config.PORT}!`))
})()
