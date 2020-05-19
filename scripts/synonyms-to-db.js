import { synonyms } from '../src/utils.js'
import { Synonym } from '../src/therapists/models.js'


synonyms.forEach(async (s) => {
  await Synonym.create({
    name: s.word,
    words: s.synonyms,
  })
})
