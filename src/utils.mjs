function slugify(string) {
  return string.toString().normalize('NFD').toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-et-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

// 3 letters or more list of words to be ignored
const blacklist = ['aux', 'dans', 'pour']

const synonyms = [
  {
    word: 'mal',
    synonyms: ['douleur', 'bobo']
  }
]

function cleanForSearch(phrase) {
  let words = slugify(phrase).split('-')
  words = words.filter(w => w.length >= 3).filter(w => !blacklist.includes(w)).map(w => {
    if(w.length > 3 && w.endsWith('s')) w = w.slice(0, -1)
    if(w.endsWith('aux')) w = w.slice(0, -3) + 'al'
    const synonym = synonyms.find(s => s.synonyms.includes(w))
    if(synonym) w = synonym.word
    return w
  })
  words = [...new Set(words)]
  return words.join(' ')
}



export { slugify, cleanForSearch }
