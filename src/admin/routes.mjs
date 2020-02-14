import airtable from '../airtable.mjs'

export default function (app, prefix = '') {
  app.get(`${prefix}/import-airtable`, async (req, res) => {
    await airtable.transferAll()
    res.send("Import depuis Airtable terminé.")
  })
}
