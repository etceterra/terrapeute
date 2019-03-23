import express from 'express'
import nunjucks from 'nunjucks'

import Provider from './models/providers.mjs'

const config = {
  port: 8080
}
const app = express()

const providers  = [
  new Provider({
    slug: 'massotherapeute-geneve/max-antoine-breda',
    firstname: "Max-Antoine",
    lastname: "Breda",
    // photo: "https://espacelingdesante.ch/wp-content/uploads/2016/08/maxantoine2-1.jpg",
    therapy: 'Massothérapeute',
    city: "Genève",
    description: "Je suis massothérapeute sur Genève depuis 2012. Je pratique le massage classique et thérapeutique",
    agreements: ['asca', 'rme', 'aptn'],
    latlng: [46.2115, 6.119],
  })
]

nunjucks.configure(`src/views`, {
    express: app,
    autoescape: true
});
app.set('view engine', 'html')
app.use(express.static('assets'))

app.get('/', (req, res) => res.render('index', { title: 'Hey', message: 'Hello there!' }))
app.get('/therapeutes', (req, res) => {
  res.render('providers', { providers })
})

app.get('/:slug0/:slug1', (req, res) => {
  const provider = providers.find(p => p.slug === `${req.params.slug0}/${req.params.slug1}`)
  res.render('provider', { provider })
})

app.listen(config.port, () => console.log(`App running on port ${config.port}!`))
