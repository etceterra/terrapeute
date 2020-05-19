import airtable from './src/airtable.js'

async function init() {
  await airtable.transferAll()
  process.exit()
}

init()
