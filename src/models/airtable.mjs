import Airtable from 'airtable'
import config from '../config'

Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: config.AIRTABLE_API_KEY })
const db = Airtable.base('app1Ab6PilgNTXMYp')
const ProviderTable = db.table('Therapeutes')
const SymptomTable = db.table('Symptomes')
const TherapyTable = db.table('Therapies')
let therapies = []
let symptoms = []


;(async () => {
  const therapyData = await TherapyTable.select().firstPage()
  therapyData.forEach(t => therapies[t.id] = t.fields)
  const symptomData = await SymptomTable.select().firstPage()
  symptomData.forEach(s => symptoms[s.id] = s.fields)
})()


const fakeProvider = { id: 'rec0vdz3rqJOwKPTJ',
  slug: 'massotherapie-geneve/max-antoine-breda',
  email: 'mesurebienetre@gmail.com',
  lastname: 'Breda',
  phone: '+41 76 291 69 51',
  is_certified: true,
  description:
   'Massothérapeute sur Genève depuis 2012. Je pratique le massage classique, la réflexologie plantaire ainsi que le drainage lymphatique suivant la méthode du Docteur Vodder. Parallèlement, Je suis formateur en massage classique  (diplômé FSEA) à l’école Esclarmonde de Genève.',
  firstname: 'Max-Antoine',
  street: 'Avenue Soret 39',
  city: 'Genève',
  zipcode: '1203',
  price: '100.-/heure',
  timetable: 'du lundi au vendredi de 9h à 18h',
  photo:
   [ { id: 'attnijg9rVhmTl2cf',
       url:
        'https://dl.airtable.com/.attachments/5cdec136bcfb0aba5bad00169e2f285e/139d7414/PhotoMax-AntoineBis.jpg',
       filename: 'PhotoMax-AntoineBis.jpg',
       size: 25332,
       type: 'image/jpeg',
       thumbnails: [Object] } ],
  country: 'ch',
  latlng: '46.2114649,6.120922699999937',
  socials: { website: 'https://www.mesurebienetre.com' },
  therapies:
   [ { slug: 'massotherapie',
       Therapeutes: [Array],
       name: 'Massothérapie' },
     { slug: 'reflexologie',
       Therapeutes: [Array],
       name: 'Réflexologie' },
     { slug: 'drainage',
       Therapeutes: [Array],
       name: 'Drainage lymphatique' },
     { slug: 'massage-therapeutique',
       Therapeutes: [Array],
       name: 'Massage thérapeutique' } ],
  agreements: [ 'ASCA' ],
  payment_means: 'cash',
  Symptomes:
   [ 'rec29xZK8c2nR9QGw',
     'recdpww9J2XNSDH2V',
     'recYuTf8XhCOO3aL2',
     'recmq9uJLT4uaHgTy',
     'rectvvel6f5RGABbd',
     'recwSXI3AkZWUIxfg' ],
  creation_date: '2019-04-05T09:12:42.000Z',
  therapies_name:
   [ 'Massothérapie',
     'Réflexologie',
     'Drainage lymphatique',
     'Massage thérapeutique' ],
  name: 'Max-Antoine Breda',
  url: '/massotherapie-geneve/max-antoine/1234'
}

const Provider = {
  toInstance(p) {
    if(!p.id) return {}
    const provider = Object.assign({ id: p.id }, p.fields)
    provider.therapies = provider.therapies ? provider.therapies.map(t => therapies[t]) : []
    provider.therapies_name = provider.therapies.map(t => t.name)
    provider.name = `${provider.firstname} ${provider.lastname}`
    provider.url = `/${provider.slug}/${provider.id}`
    provider.socials = JSON.parse(provider.socials || {})
    return provider
  },
  async getAll() {
    const data = await ProviderTable.select().firstPage()
    return data.filter(p => p.fields.slug).map(p => this.toInstance(p))
  },

  async find(id) {
    const result = await ProviderTable.find(id)
    return this.toInstance(result)
    // return fakeProvider
  },
}

export { Provider, therapies, symptoms }
