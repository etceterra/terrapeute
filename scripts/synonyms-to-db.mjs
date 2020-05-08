import { synonyms } from '../src/utils.mjs'
import { Synonym } from '../src/therapists/models.mjs'


synonyms.forEach(async (s) => {
  await Synonym.create({
    name: s.word,
    words: s.synonyms,
  })
})
