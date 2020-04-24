import { Therapist } from '../therapists/models.mjs'


export default function (app, prefix = '') {

  app.get(`${prefix}/therapist/:email`, async (req, res, next) => {
    const therapist = await Therapist.findOne({ email: req.params.email })
    if(!therapist) return res.status(404).send('Therapist not found')

    const keys = ['firstname', 'lastname', 'phone', 'email', 'offices']
    const data = keys.reduce((data, k) => {
      data[k] = therapist[k]
      return data
    }, {})
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(data))
  })
}
