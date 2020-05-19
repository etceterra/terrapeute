import express from 'express'
import cors from 'cors'
import nunjucks from 'nunjucks'
import marked from 'marked'

import { bbcode } from './utils.js'
import config from './config.js'
import articlesRoutes from './articles/routes.js'
import adminRoutes from './admin.js'
import therapistsRoutes from './therapists/routes.js'
import apiRoutes from './api/routes.js'
import airtable from './airtable.js'

import { Therapy, Therapist, Symptom } from './therapists/models.js'


const app = express()

app.set('view engine', 'html')
const template = nunjucks.configure(`src/views`, { express: app, autoescape: true })
template.addFilter('markdown', (str = '') => nunjucks.runtime.markSafe(marked(str)))
template.addFilter('bbcode', (str = '') => nunjucks.runtime.markSafe(bbcode(str)))

app.use(express.static('assets'))
app.use(express.json())
app.use(cors())

app.get('/', async (req, res) => {
  const therapies = await Therapy.find().sort({ slug: 1 })
  const therapists = await Therapist.find().enabled().sort({ creationDate: -1 }).limit(5)
  res.render('index', { therapies, therapists })
})

app.get(`/admin/import-airtable`, async (req, res) => {
  await airtable.transferAll()
  res.send("Import depuis Airtable terminé.")
})

articlesRoutes(app, '/journal')
adminRoutes(app, '/admin')
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
