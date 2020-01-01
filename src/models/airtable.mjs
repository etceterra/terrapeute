import Airtable from 'airtable'
import config from '../config.mjs'

Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: config.AIRTABLE_API_KEY })
const db = Airtable.base('app1Ab6PilgNTXMYp')
const ProviderTable = db.table('Therapeutes')
const SymptomTable = db.table('Symptomes')
const TherapyTable = db.table('Therapies')
let therapies = []
let symptoms = []


async function preload() {
  const therapyData = await TherapyTable.select().firstPage()
  therapyData.forEach(t => therapies[t.id] = Object.assign({}, t.fields, { id: t.id }))
  const symptomData = await SymptomTable.select().firstPage()
  symptomData.forEach(s => symptoms[s.id] = Object.assign({}, s.fields, { id: s.id }))
}

preload()

const Provider = {
  toInstance(p) {
    if(!p.id) return {}
    const provider = Object.assign({ id: p.id }, p.fields)
    provider.therapies = provider.therapies ? provider.therapies.map(t => therapies[t]) : []
    provider.therapies_name = provider.therapies.filter(t => t).map(t => t.name)
    provider.name = `${provider.firstname} ${provider.lastname}`
    provider.url = `/${provider.slug}/${provider.id}`
    provider.socials = provider.socials ? JSON.parse(provider.socials) : {}
    if(!provider.agreements) provider.agreements = []
    return provider
  },

  async getAll(params, sort) {
    const filters = {}
    if (params) filters.filterByFormula = params
    if (sort) filters.sort = sort
    const data = await ProviderTable.select(filters).firstPage()
    return data.filter(p => p.fields.slug).map(p => this.toInstance(p))
  },

  async find(id) {
    const result = await ProviderTable.find(id)
    return this.toInstance(result)
  },
}

const Therapy = {
  async getAll(params, sort) {
    const filters = {}
    if (params) filters.filterByFormula = params
    if (sort) filters.sort = sort
    const data = await TherapyTable.select(filters).firstPage()
    return data.filter(p => p.fields.slug).map(p => this.toInstance(p))
  },

  toInstance(t) {
    if (!t.id) return {}
    const therapy = Object.assign({ id: t.id }, t.fields)
    return therapy
  },
}

export default { Therapy }
