import fs from 'fs'
import { TherapistPending } from './src/therapists/models.js'


const data = JSON.parse(fs.readFileSync("../holistia-scrapper/holistia.json"))

async function createTherapists() {
  data.slice(0, 10).forEach(async d => {
    const nameparts = d.name.split(" ")

    const socials = d.socials.map(s => {
      if(s.includes('instagram')) return { name: 'instagram', url: s }
      if(s.includes('facebook')) return { name: 'facebook', url: s }
      if(s.includes('youtube')) return { name: 'youtube', url: s }
      if(s.includes('linkedin')) return { name: 'linkedin', url: s }
      if(s.includes('skype')) return { name: 'skype', url: s }
      if(s.includes('twitter')) return { name: 'twitter', url: s }
    })
    if(d.website) socials.push({ name: 'website', url: d.website })
    const office = {
      location: {
        coordinates: d.latlng && d.latlng.map(s => Number(s)),
      }
    }

    const timetable = d.timetable

    let slug = ''
    try {
      slug = d.url.match('/therapeut/(.*)/')[1]
    } catch {
      return
    }

    const t = await TherapistPending.create({
      slug,
      name: d.name,
      email: d.email,
      phone: d.phone,
      isCertified: true,
      description: Buffer.from(d.description.join('\n'), 'utf8'),
      languages: [d.language],
      // photoUrl: `assets/uploads/therapists/holistia/${slug}.jpg`,
      socials,
      agreements: d['asca-rme'] ? ['ASCA', 'RME'] : [],
      // paymentTypes: [String],
      offices: [office],
      address: d.address,
      therapies: d.therapies.filter(d => d),
      source: 'holistia',
      language: d.language,
      // timetable,
      // symptoms: [{ type: mongoose.ObjectId, ref: Symptom }],
      // "last-update": "29/09/2017",
      // "therapies": ["Reiki"],
      // "symptoms": [],
      // "education": "",
      // "baseline": "SwissReiki",
      // "logo": "../../wp-content/uploads/2017/06/Coeur-SR.png"
    })

    console.log(t.slug)
  })
}

async function init() {
  await TherapistPending.deleteMany({})
  await createTherapists()
}

init()
