function slugify(string) {
  return string.toString().normalize('NFD').toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-et-') // Replace & with 'and'
    .replace(/&/g, '-et-') // Replace & with 'and'
    .split(/-|'/).filter(l => l.slice(1, 1) !== "'").join('-')
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

// 3 letters or more list of words to be ignored
const blacklist = ['alors', 'aucun', 'aussi', 'autre', 'avant', 'avec', 'avoir', 'bon', 'car', 'cela', 'ces', 'ceux', 'chaque', 'comme', 'comment', 'dans', 'des', 'dedans', 'dehors', 'depuis', 'devrait', 'doit', 'donc', 'début', 'elle', 'elles', 'encore', 'essai', 'est', 'fait', 'faites', 'fois', 'font', 'hors', 'ici', 'ils', 'juste', 'les', 'leur', 'maintenant', 'mais', 'mes', 'mien', 'moins', 'mon', 'mot', 'meme', 'ni', 'notre', 'nous', 'par', 'parce', 'pas', 'peut', 'peu', 'plupart', 'pour', 'pourquoi', 'quand', 'que', 'quel', 'qui', 'sans', 'ses', 'seulement', 'sien', 'son', 'sont', 'sous', 'soyez', 'sujet', 'sur', 'tandis', 'tellement', 'tels', 'tes', 'ton', 'tous', 'tout', 'trop', 'tres', 'voient', 'vont', 'votre', 'vous', 'etaient', 'etat', 'etions', 'ete', 'etre', 'les', 'des', 'aux', 'dans', 'pour', 'lié', 'liée',
'mal', 'inflammation', 'trouble', 'dysfonctionnement', 'maladie', 'infection', 'sensation', 'reaction', 'age']
const whitelist = ['os', 'dos']

const synonyms = [
  { word: 'mal', synonyms: ['douleur', 'bobo', 'douloureux', 'douloureuse'] },
  { word: 'inflammation', synonyms: ['brulure', 'gonflement', 'gonfle', 'gonfler', 'rougeur', 'picotement'] },
]

function cleanForSearch(phrase) {
  let words = slugify(phrase).split('-')
  words = words
    .filter(w => (w.length >= 3 || whitelist.includes(w)) && !blacklist.includes(w))
    .map(w => {
      if(w.length > 3 && w.endsWith('s')) w = w.slice(0, -1)
      if(w.endsWith('aux')) w = w.slice(0, -3) + 'al'
      if(w.endsWith('elle')) w = w.slice(0, -3) + 'el'
      const synonym = synonyms.find(s => s.synonyms.includes(w))
      if(synonym) w = synonym.word
      return w
    })
    // Pass a second time though translated words
    .filter(w => !blacklist.includes(w))
  words = [...new Set(words)]
  return words.join(' ')
}



export { slugify, cleanForSearch }
