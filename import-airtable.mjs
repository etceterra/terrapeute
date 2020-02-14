import airtable from './src/airtable.mjs'

async function init() {
  await airtable.transferAll()
  process.exit()
}

init()
