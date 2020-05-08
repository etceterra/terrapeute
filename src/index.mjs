import express from 'express'
import cors from 'cors'
import nunjucks from 'nunjucks'
import marked from 'marked'

import { bbcode } from './utils.mjs'
import config from './config.mjs'
import articlesRoutes from './articles/routes.mjs'
import adminRoutes from './admin.mjs'
import therapistsRoutes from './therapists/routes.mjs'
import apiRoutes from './api/routes.mjs'
import airtable from './airtable.mjs'

import { Therapy } from './therapists/models.mjs'


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
  res.render('index', { therapies })
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

app.listen(config.PORT, () => console.log(`App running on http://localhost:${config.PORT}`))
