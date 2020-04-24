import { Therapist } from '../therapists/models.mjs'


export default function (app, prefix = '') {

  app.get(`${prefix}/therapist/:email`, async (req, res) => {
    const therapist = await Therapist.findOne({ email: req.params.email })
    if(!therapist) return res.status(404).send('Therapist not found')
    res.setHeader('Content-Type', 'application/json')
    res.send(therapist.toJSON())
  })

  app.patch(`${prefix}/therapist/:id`, async (req, res) => {
    const therapist = await Therapist.findById(req.params.id)
    if(!therapist) return res.status(404).send('Therapist not found')
    if(req.body.extraData) {
      therapist.extraData = req.body.extraData
      await therapist.save()
    }
    res.setHeader('Content-Type', 'application/json')
    res.send(therapist.toJSON())
  })
}
