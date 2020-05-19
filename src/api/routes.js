import { Therapist, TherapistData } from '../therapists/models.js'


export default function (app, prefix = '') {

  app.get(`${prefix}/therapist/:email`, async (req, res) => {
    const therapist = await Therapist.findOne({ email: req.params.email })
    if(!therapist) return res.status(404).send('Therapist not found')
    res.setHeader('Content-Type', 'application/json')
    res.send(await therapist.toJSON())
  })

  app.patch(`${prefix}/therapist/:id`, async (req, res) => {
    const content = req.body.extraData
    if(!content) return res.status(403, 'No data to patch')

    const therapist = await Therapist.findById(req.params.id)
    if(!therapist) return res.status(404).send('Therapist not found')
    let data = await TherapistData.findOne({ therapistAirtableId: therapist.airtableId })
    if(!data) data = new TherapistData({ therapistAirtableId: therapist.airtableId })
    data.data = content
    await data.save()
    res.setHeader('Content-Type', 'application/json')
    const inst = await therapist.toJSON()
    res.send(inst)
  })
}
