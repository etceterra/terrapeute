import express from 'express'
import cors from 'cors'
import nunjucks from 'nunjucks'
import marked from 'marked'
import bodyParser from 'body-parser'

import { bbcode } from './utils.js'
import config from './config.js'
import articlesRoutes from './articles/routes.js'
// import adminRoutes from './admin.js'
import therapistsRoutes from './therapists/routes.js'
import apiRoutes from './api/routes.js'
import airtable from './airtable.js'

import { Therapy, Therapist, Symptom, TherapistPending } from './therapists/models.js'


const app = express()

app.set('view engine', 'html')
const template = nunjucks.configure(`src/views`, { express: app, autoescape: true })
template.addFilter('markdown', (str = '') => nunjucks.runtime.markSafe(marked(str)))
template.addFilter('bbcode', (str = '') => nunjucks.runtime.markSafe(bbcode(str)))

app.use(express.static('assets'))
app.use(express.json())
app.use(bodyParser())
app.use(cors())

app.get('/', async (req, res) => {
  const therapies = await Therapy.find().sort({ slug: 1 })
  const therapistQuery = () => Therapist.find({ photo: { $nin: [null] } }).sort({ creationDate: -1 })
  const therapists = await therapistQuery().limit(5)
  const therapistsCount = await therapistQuery().count()
  res.render('index', { therapies, therapists, therapistsCount })
})

app.get(`/admin/import-airtable`, async (req, res) => {
  await airtable.transferAll()
  res.send("Import depuis Airtable terminé.")
})

app.get(`/admin/confirmes`, async (req, res) => {
  const pendings = await TherapistPending.find({ confirmed: true })
  res.send(pendings.map((p) => p.name).join('<br>'))
})

articlesRoutes(app, '/journal')
// adminRoutes(app, '/admin')
apiRoutes(app, '/api')

therapistsRoutes(app)

app.get('/therapies', async (req, res) => res.render(`therapies/index.html`))
app.get('/therapies/:name', async (req, res) => res.render(`therapies/${req.params.name}`))
app.get('/charte.html', async (req, res) => res.render('charte'))
app.get('/privacy.html', async (req, res) => res.render('privacy'))
app.get('/policy.html', async (req, res) => res.render('policy'))
app.get('/evenements.html', async (req, res) => res.render('events'))
app.get('/navigation.html', async (req, res) => {
  const therapies = await Therapy.find()
  const therapists = await Therapist.find().populate('therapies')
  const symptoms = await Symptom.find().populate('parent')
  res.render('sitemap', { therapies, therapists, symptoms })
})

app.listen(config.PORT, () => console.log(`App running on http://localhost:${config.PORT}`))
