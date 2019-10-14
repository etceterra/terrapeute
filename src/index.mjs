import express from 'express'
import nunjucks from 'nunjucks'
import Vcard from 'vcards-js'
import config from './config.mjs'
import { Provider, Therapy } from './models/airtable.mjs'
import { Article } from './articles/models.mjs'
import bodyparser from 'body-parser'
import marked from 'marked'


const app = express()

app.set('view engine', 'html')
const template = nunjucks.configure(`src/views`, { express: app, autoescape: true })
template.addFilter('markdown', (str = '') => nunjucks.runtime.markSafe(marked(str)))

app.use(express.static('assets'))
app.use(bodyparser.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
  const therapies = await Therapy.getAll()
  res.render('index', { therapies })
})
app.get('/therapeutes', async (req, res) => {
  let q = req.query.q && req.query.q.trim()
  const filter = q && `SEARCH("${q}", LOWER(Symptomes))`
  const providers = await Provider.getAll(filter, [{ field: 'symptoms_count' }])
  res.render('providers', { providers, q })
})
app.get('/therapeutes/:therapy', async (req, res) => {
  let therapy = req.params.therapy
  const filter = `SEARCH("${therapy}", LOWER(Therapies))`
  console.debug(Provider.getAll(filter, [{ field: 'therapies' }]))
  const providers = await Provider.getAll(filter, [{ field: 'therapies' }])
  res.render('providers', { providers, q: therapy })
})

app.get('/journal', async (req, res) => {
  const articles = await Article.find({}).sort('-creationDate')
  res.render('articles/index', { articles })
})

app.get('/journal/admin', async (req, res) => {
  const articles = await Article.find({})
  res.render('articles/admin/list', { articles, therapists: [] })
})

app.get('/journal/admin/new', async (req, res) => {
  const articles = await Article.find({})
  res.render('articles/admin/edit', { article: new Article() })
})

app.post('/journal/admin/new', async (req, res) => {
  const article = await Article.create(req.body)
  res.redirect('/journal/admin')
})

app.get('/journal/admin/:id', async (req, res) => {
  const article = await Article.findOne({ _id: req.params.id })
  res.render('articles/admin/edit', { article })
})

app.post('/journal/admin/:id', async (req, res) => {
  const article = await Article.findOne({ _id: req.params.id })
  // Don't use `updateOne` so that `pre('save')` is called.
  Object.assign(article, req.body)
  article.save()
  res.redirect('/journal/admin')
})

app.post('/journal/admin/:id/delete', async (req, res) => {
  const article = await Article.deleteOne({ _id: req.params.id })
  res.redirect('/journal/admin')
})

app.get('/journal/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  res.render('articles/view', { article })
})

app.get('/therapies', async (req, res) => res.render(`therapies/index.html`))
app.get('/therapies/:name', async (req, res) => res.render(`therapies/${req.params.name}`))
app.get('/privacy.html', async (req, res) => res.render('privacy'))
app.get('/policy.html', async (req, res) => res.render('policy'))
app.get('/evenements.html', async (req, res) => res.render('events'))

app.get('/:slug0/:slug1/:id', async (req, res) => {
  const provider = await Provider.find(req.params.id)
  res.render('provider', { provider })
})

app.get('/:slug0/:slug1/:id/vcf', async (req, res) => {
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

app.listen(config.PORT, () => console.log(`App running on http://localhost:${config.PORT}`))
