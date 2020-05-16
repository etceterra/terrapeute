import { Synonym } from './therapists/models.mjs'


function slugify(string) {
  if(!string) return ''
  return string.toString().normalize('NFD').toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-et-') // Replace & with 'and'
    .replace(/&/g, '-et-') // Replace & with 'and'
    .split(/-|'/).filter(l => l.slice(1, 1) !== "'").join('-')
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

// Force these words to be preserved
const whitelist = ['os', 'dos', 'pus']
// 3 letters or more list of words to be ignored
const blacklist = ['alors', 'aucun', 'aussi', 'autre', 'avant', 'avec', 'avoir', 'bas', 'haut', 'bon', 'car', 'cela', 'ces', 'ceux', 'chaque', 'comme', 'comment', 'dans', 'des', 'dedans', 'dehors', 'depuis', 'devrait', 'doit', 'donc', 'debut', 'elle', 'elles', 'encore', 'essai', 'est', 'fait', 'faites', 'fois', 'font', 'hors', 'ici', 'ils', 'juste', 'les', 'leur', 'maintenant', 'mais', 'mes', 'mien', 'moins', 'mon', 'mot', 'meme', 'ni', 'notre', 'nous', 'par', 'parce', 'pas', 'peut', 'peu', 'plupart', 'pour', 'pourquoi', 'quand', 'que', 'quel', 'qui', 'sans', 'ses', 'seulement', 'sien', 'son', 'sont', 'sous', 'soyez', 'sujet', 'sur', 'tandis', 'tellement', 'tels', 'tes', 'ton', 'tous', 'tout', 'trop', 'tres', 'voient', 'vont', 'votre', 'vous', 'etaient', 'etat', 'etions', 'ete', 'les', 'des', 'aux', 'dans', 'pour', 'lie', 'liee',
"accident", "baisse", "bobo", "brulure", "chronique", "chute", "crise", "diminution", "douleur", "douloureuse", "douloureux", "dysfonctionnement", "etat", "fievre", "hypersensibilite", "infection", "lesion", "mal", "maladie", "malaise", "manque", "organe", "perte", "probleme", "reaction", "rouge", "rythme", "sensation", "syndrome", "trouble", "trou", "dessus", "dessous", "fais"]

async function getSynonyms() {
  const synonyms = await Synonym.find()
  return synonyms
}

async function cleanForSearch(phrase) {
  const synonyms = await getSynonyms()
  let words = slugify(phrase).split('-')
  words = words
    .filter(w => (w.length >= 3 || whitelist.includes(w)) && !blacklist.includes(w))
    .map(w => {
      if(w.length > 3 && w.endsWith('s')) w = w.slice(0, -1)
      if(w.endsWith('aux')) w = w.slice(0, -3) + 'al'
      if(w.endsWith('ale')) w = w.slice(0, -3) + 'al'
      if(w.endsWith('elle')) w = w.slice(0, -3) + 'el'
      if(w.endsWith('ee')) w = w.slice(0, -1)
      if(w.endsWith('ation')) w = w.slice(0, -5) + 'er'
      if(w.endsWith('euse')) w = w.slice(0, -4) + 'eu'
      if(w.endsWith('eux')) w = w.slice(0, -3) + 'eu'
      if(w.endsWith('ement')) w = w.slice(0, -5) + 'er'
      if(w.endsWith('age')) w = w.slice(0, -3) + 'er'
      const synonym = synonyms.find(s => s.words.includes(w))
      if(synonym) w = synonym.word
      return w
    })
    // Pass a second time though translated words
    .filter(w => !blacklist.includes(w))
  words = [...new Set(words)]
  return words.join(' ')
}

function bbcode(str) {
  return str.replace(/\[(\/?[^\]]+)\]/g, '<$1>')
}



export { slugify, cleanForSearch, bbcode, blacklist, whitelist }
