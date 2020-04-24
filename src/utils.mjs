function slugify(string) {
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
const blacklist = ['alors', 'aucun', 'aussi', 'autre', 'avant', 'avec', 'avoir', 'bon', 'car', 'cela', 'ces', 'ceux', 'chaque', 'comme', 'comment', 'dans', 'des', 'dedans', 'dehors', 'depuis', 'devrait', 'doit', 'donc', 'debut', 'elle', 'elles', 'encore', 'essai', 'est', 'fait', 'faites', 'fois', 'font', 'hors', 'ici', 'ils', 'juste', 'les', 'leur', 'maintenant', 'mais', 'mes', 'mien', 'moins', 'mon', 'mot', 'meme', 'ni', 'notre', 'nous', 'par', 'parce', 'pas', 'peut', 'peu', 'plupart', 'pour', 'pourquoi', 'quand', 'que', 'quel', 'qui', 'sans', 'ses', 'seulement', 'sien', 'son', 'sont', 'sous', 'soyez', 'sujet', 'sur', 'tandis', 'tellement', 'tels', 'tes', 'ton', 'tous', 'tout', 'trop', 'tres', 'voient', 'vont', 'votre', 'vous', 'etaient', 'etat', 'etions', 'ete', 'etre', 'les', 'des', 'aux', 'dans', 'pour', 'lie', 'liee',
"accident", "baisse", "bobo", "brulure", "chronique", "chute", "crise", "diminution", "douleur", "douloureuse", "douloureux", "dysfonctionnement", "etat", "fievre", "hypersensibilite", "infection", "lesion", "mal", "maladie", "malaise", "manque", "organe", "perte", "probleme", "reaction", "rouge", "rythme", "sensation", "syndrome", "trouble"]

const synonyms = [
  { word: "mal", synonyms: "douleur bobo douloureux douloureuse".split(' ') },
  { word: "inflammation", synonyms: "brulure inflammatoire enflame enflamer inflamer enflammer inflammer".split(' ') },
{ word: "abandonner", synonyms: "abandonnement abandon".split(' ')},
{ word: "addiction", synonyms: "accoutumance dependance".split(' ')},
{ word: "ado", synonyms: "adolescent ephebe jeune teenager".split(' ')},
{ word: "agacer", synonyms: "s'emporter emportement irascibilite facher agacement susceptible susceptibilite exasperer enerver exasperer".split(' ')},
{ word: "aliment", synonyms: "nourriture bouffe boustifaille becquetance denree".split(' ')},
{ word: "allergie", synonyms: "intolerance".split(' ')},
{ word: "anal", synonyms: "anale anus cul trou-de-balle fesse rectum rectal rectale derche".split(' ')},
{ word: "appareil", synonyms: "systeme".split(' ')},
{ word: "appetit", synonyms: "faim fringale".split(' ')},
{ word: "articulation", synonyms: "arthrologie syndesmologie temporo-mandibulaire incudo-malleolaire incudo-stapedienne gomphose suture atlanto-occipitale atlanto-axoidienne atlanto-axoidienne intervertebrale lombo-sacree intercorporeale symphyse zygapophysaire costo-vertebrale costo-corporeale costo-transversaire interchondrale sterno-costale manubrio-sternale xipho-sternale sterno-claviculaire sacro-coccygienne intercoccygienne sacro-iliaque pubienne gleno-humerale scapulo-humerale acromio-claviculaire Sterno-costo-claviculaire sous-acromio-deltoidienne scapulo-thoracique humero-ulnaire humero-radiale radio-ulnaire radio-carpienne carpo-metacarpienne carpe intermetacarpienne metacarpo-phalangienne interphalangienne coxo-femorale tibio-femorale patello-femorale tibiofibulaire talo-crurale sub-talaire tarse tarso-metatarsienne intermetatarsienne metatarso-phalangienne synovie".split(' ')},
{ word: "ballonnement" , synonyms: "tirailler convulsion spasme spasmodique colique pincer retraction pesanteur".split(' ')},
{ word: "begayer", synonyms: "balbutiement bredouillement begayage balbutier balbisme bafouillage begaier".split(' ')},
{ word: "bruit", synonyms: "siffler bourdonner gronder bruisser chuinter corner sibilance sibiler sifflet striduler assourdissant".split(' ')},
{ word: "cheveu", synonyms: "cheveux capilaire poil tif touffe chevelure tignasse criniere toison".split(' ')},
{ word: "claudiquer", synonyms: "boiter boitiller clopiner clocher boiterie".split(' ')},
{ word: "cœur", synonyms: "coeur cardiaque cardia cardi myocarde endocarde".split(' ')},
{ word: "contracter", synonyms: "contraction contracture crispation convulsion spasme spasmodique constriction crampe tetanie trismus contractilite raideur".split(' ')},
{ word: "corps" , synonyms: "corporel".split(' ')},
{ word: "decrochage" , synonyms: "abandon renoncement delaissement delaisser renonciation renoncer demission demissionner capitulation capituler rupture desinteresser decrocher".split(' ')},
{ word: "demangeaison", synonyms: "piquer piquant gratter demanger picoter picotement irriter grattage irritation".split(' ')},
{ word: "dent", synonyms: "incisive canine molaire premolaire chicotte".split(' ')},
{ word: "depression", synonyms: "abattement aneantissement effondrement".split(' ')},
{ word: "difficulte", synonyms: "peine difficile penible ardu complique".split(' ')},
{ word: "diminution", synonyms: "abaissement degradation reduction declin depreciation attenuation appauvrissement amoindrissement amenuisement ralentissement rarefaction ischemie ischemique affaiblissement deterioration".split(' ')},
{ word: "dispute", synonyms: "engueuler engeulade opposition lutte contestation desaccord querelle combat heurt difficulte dissension chicane contradiction divergence choc bataille antagonisme affrontement differend discorde divorce belligerance rivalite collision tiraillerie tiraillement litige hostilites froissement dissentiment clash guerre bisbille facherie facher conflit agressif agression".split(' ')},
{ word: "emotion", synonyms: "confiance confiant confiante Amour amoureux amoureuse Admiration admiratif admirative Amitie amical amicale Affection affectif affective Sympathie Sympa Sympathique Charme Bonte Tendresse tendre Desir desireux desireuse Convoitise Compassion compatissant compatissante Sentiment sentimental sentimentale Excitation exite Enchantement enchante Seduction seduite seduit Passion passionne Engouement Chaleur Joie joyeux joyeuse Plaisir Satisfaction satisfait satisfaite Delectation Entrain Heureux heureuse Ardeur Euphorie euphorique Soulage Gaiete gai Jouissance Jubilation Sensation Amusant Extase Optimiste Triomphe Allegresse Contentement content contente Fier Ferveur Jovial Jovialite Humour Enchante Excitation Colere colerique colereuse Agressivite agressif agressive Agitation agite Amertume Couroux courouse Cruaute cruel Degoût degoute Mecontentement mecontent mecontente Vengeance vengeur vengeresse Frustration frustre Maussade Haine haineux haineuse Furie Tourment tourmente Jalousie jaloux jalousz Bougon bougonne Rage Ressentiment ressenti Exasperation exaspere Outrage Mepris meprise meprosant Ferocite feroce Repugnance repugnant repugnante Revulsion revulse Destruction detruit detruite Rancune rencunier rencuniere Aversion Tristesse triste Negligence negligent negligente Cafard Chagrin chagrine Desespoir desespere Pitie egarement egare Malheur malheureux malheureuse Anxiete anxieux anxieuse Insecurite Defaire Melancolie melancolique Abandon abandonne pression Deplaisir deplaisant Souffrance Solitude Desarroi Accablement accable Irremediable Rejet rejete Seul Decouragement decourage Desapointement desapointe Misere Agonie agonisant agonisante Crainte craintif craintive Apprehension Mefiance mefiant mefiante Panique Hysterie hyterique Nervosite nerveux nerveuse Effroi effrayeTension Inquietude inquiet inquiete Secousse Souci soucieux soucieuse Horreur horrifier Saut d'humeur Anxiete anxieux anxieuse Terreur terrifie terrifiante ecrasement Detresse Honte honteux honteuse Remord Humiliation humilie Culpabilite culpabilisant culpabilisante Regret regrette Embarras embarrassant embarrassante Invalidation Confusion confus confuse Insulte Penitence Mortification mortifie mortifiante Interêt interesse interessante Timidite Prudence prudent prudente Audace audacieux audacieuse Excitation exite exitente epuisement epuise epuisante Fragilite Regret Bravoure Curiosite Insatisfaction Reserve Suspicion Courage Intrigue Repugnace Pudeur sursaut Determination Surprise Ahurissement Stupefaction Intimidation Impuissant Indecision Domination Culpabilite culpabilise culpabilisante Soumission soumis soumise Doute Apathie Impatience impatient impatiente Indifference Indifferent Indifferente Amorphe ennuie ennuyeux ennuyant ennuyante aigreur aigri mechancete mechant mechante".split(' ')},
{ word: "enfant", synonyms: "gamin gosse moutard mioche mome rejeton marmot bambin enfance enfantin enfantine".split(' ')},
{ word: "etirer", synonyms: "extension etirement".split(' ')},
{ word: "fatigue", synonyms: "epuisement ereintement extenuation harassement surmenage rompu fatigabilite fatiguant asthenie".split(' ')},
{ word: "femme", synonyms: "fille nenette nana donzelle gonzesse".split(' ')},
{ word: "flatuler", synonyms: "air gaz pet peter flatulence".split(' ')},
{ word: "genou", synonyms: "menisque ligament croise rotule patella".split(' ')},
{ word: "gonfler", synonyms: "enfler boursoufler tumefaction tumefier enflure".split(' ')},
{ word: "homme" , synonyms: "mec gars male garcon masculin gonze masculinite".split(' ')},
{ word: "insuffisance", synonyms: "manque faible defaut deficience deficit carence rarete".split(' ')},
{ word: "intestin", synonyms: "colon".split(' ')},
{ word: "jambe", synonyms: "guibole gambette".split(' ')},
{ word: "lancinant" , synonyms: "obsedant torturant enervant dechirant agaçant crispant chiant continu".split(' ')},
{ word: "luxation", synonyms: "dislocation deboitement exarthrose".split(' ')},
{ word: "maigre", synonyms: "maigrir amaigrir mince decharne chetif squelettique rachitique gringalet maigrichon".split(' ')},
{ word: "main", synonyms: "patte paluche menotte".split(' ')},
{ word: "manger" , synonyms: "goinfrer s'empiffrer bouffer bafrer s'envoyer goberger bourrer gloutonner".split(' ')},
{ word: "muscle", synonyms: "abaisseur adducteur abducteur amygdalo-glosse ancone extenseur flechisseur elevateur ancone angulaire ary-epiglottique arytenoidien atloido-mastoidien auriculaire anterieur posterieur interne externe moyen superieur inferieur droit oblique lateral medial transverse azygos luette biceps brachial crural femoral brachioradial buccinateur bulbo-caverneux canin carre crural lombes sylvius ciliaire cleido-occipital coccygien constricteur coraco-brachial corrugateur court radial fibulaire palmaire supinateur pronateur couturier sartorius crico-arytenoidiens crico-arytenoidiens crico-pharyngien crico-thyroidiens vaste intermediaire cubital Deltoide demi-membraneux demi-tendineux dentele radial diaphragme digastrique scapulo-jugulo-hyoidien abdomen eminence hypothenar thenar marteau ulnaire frontal gastrocnemien mollet jumeau genio-glosse genio-hyoidien gracile complexus dentele latissimus dorsi dorsal fessier pectoral psoas rhomboide rond sus-maxillo-labial zygomatique hyo-glosse humero-stylo-brachial ilio-costal ilio-psoas infra-epineux sous-epineux intercostaux interepineux interosseux dorsaux ischio-caverneux jambier labial lacrymal lombricaux longissimus manducateur masseter mentonnier sus-maxillo-labial mylo-hyoidien Myrtiforme nasal naso-labial obturateur occipital occipito-frontal oculomoteur omo-hyoidien oppposant orbiculaire orbito-palpebral palatoglosse palatopharyngien palato-glosse muscle palato-pharyngien peaucier pectine pedieux petro-pharyngien pharyngo-glosse piriforme platysma poplite pterygoidien lateral pyramidal quadriceps releveur rhomboide risorius salpingo-pharyngien scalene semi-epineux semi-membraneux semi-tendineux soleaire sourcilier ischio-jambier gracil sous-clavier sphincter splenius stapedien sterno-cleido-hyoidien sterno-cleido-mastoidien sterno-cleido-occipito-mastoidien sterno-cleido-thyroidien sterno-hyoidien sterno-thyroidien stylo-glosse stylo-hyoidien stylo-pharyngien subclavier sous-clavier subscapulaire supinateur supra-epineux sus-epineux temporal tenseur fascia lata thyro-arytenoidien thyro-hyoidien tibial jambier transversaires-epineux transverse trapeze perinee triangulaire triceps brachial sural quadriceps uvulaire pectoraux abdominaux abdo".split(' ')},
{ word: "nausee", synonyms: "haut-le-cœur haut-le-coeur ecoeurement degoût mal-de-cœur mal-de-coeur mal-de-mer remontee".split(' ')},
{ word: "nerveux", synonyms: "agiter exciter agitation exitation".split(' ')},
{ word: "oreille", synonyms: "ouie ouie audition ecoute entendre ouir ouir esgourde".split(' ')},
{ word: "os", synonyms: "parietal temporal occipital sphenoide ethmoide vomer maxillaire lacrymal palatin cornet nasal zygomatique mandibule vertebre hyoide sternum cote sacrum coccyx omoplate scapula clavicule manubrium humerus radius ulna cubitus carpe scaphoide lunatum triquetrum pisiforme trapeze trapezoide capitatum hamatum metacarpien phalange sesamoide coxal ilium pubis hanche femur patella rotule tibia fibula perone tarse calcaneus talus cuboide naviculaire cuneiforme metatarsien".split(' ')},
{ word: "parent", synonyms: "papa maman pere mere".split(' ')},
{ word: "peau", synonyms: "derme epiderme hypoderme cutanee".split(' ')},
{ word: "persistant", synonyms: "continu constant permanent dure durable incessant continuel sempiternel".split(' ')},
{ word: "peur" , synonyms: "frousse crainte frayeur effroi terreur epouvante horreur trouille affolement repulsion poltronnerie pleutrerie couardise frisson panique petoche apeurer apprehension hantise".split(' ')},
{ word: "pied", synonyms: "peton panard pinceau arpion nougat plantaire".split(' ')},
{ word: "poitrine", synonyms: "torse poitrail thorax buste".split(' ')},
{ word: "reccurent", synonyms: "cyclique periodique renaissant regulier".split(' ')},
{ word: "regle", synonyms: "menstruation menstruel amenorrhee dysmenorrhee menorragies hypermenorrhee hypomenorrhee premenstruel SPM polymenorrhee oligomenorrhee spaniomenorrhee metrorragie menometrorragie".split(' ')},
{ word: "relation", synonyms: "rapport frequentation".split(' ')},
{ word: "respirer", synonyms: "inspirer expirer inspiration expiration respiration respiratoire inspiratoire expiratoire".split(' ')},
{ word: "roter", synonyms: "rot roter eructation hoquet air gaz".split(' ')},
{ word: "saigner", synonyms: "sanguinolent saignant sanglant ensanglanter saignement hemorragie hemorragique".split(' ')},
{ word: "scolaire", synonyms: "ecole lycee college etude scolarite".split(' ')},
{ word: "sec", synonyms: "reche revêche".split(' ')},
{ word: "sein", synonyms: "mamelon mamelle nene teton tetine lolo counou tetasse nichon robert".split(' ')},
{ word: "sommeil", synonyms: "assoupissement assoupir lethargie sieste repos somnolence somnoler torpeur somme roupillon roupiller dodo endormissement dormir".split(' ')},
{ word: "souci", synonyms: "inquietude tourment tracas tracasserie ennui preoccupation emmerdement embêtement soucieux embarras embarrasser angoisser".split(' ')},
{ word: "souffrir", synonyms: "affliction endolorissement supplice torture martyre souffrance".split(' ')},
{ word: "suer", synonyms: "guttation sudorification transpiration transpirer sudation sueur hydrorrhee".split(' ')},
{ word: "tête" , synonyms: "ciboulot crane boule bobine caboche cabeche cafetiere caillou carafon carafe bobeche binette gousse tronche".split(' ')},
{ word: "troube", synonyms: "perturbation desordre derangement alteration affection dereglement probleme".split(' ')},
{ word: "uriner", synonyms: "pisser miction pipi pissouiller pissoter urine".split(' ')},
{ word: "ventre" , synonyms: "bide bidon panse bedaine brioche abdo".split(' ')},
{ word: "verge" , synonyms: "bite zob queue penis zeb quequette".split(' ')},
{ word: "vertebre" , synonyms: "intervertebral intervertebraux vertebrale vertebral vertebraux".split(' ')},
{ word: "vomir", synonyms: "renvoi vomissement vomi vomissure degueuler renvoyer gerber gerbe regurgitation regurgiter".split(' ')},
{ word: "vulve", synonyms: "vulvaire schneck chatte moule pussy foufoune minou con abricot".split(' ')},
{ word: "contraction", synonyms: "contractions contracture contractures contracter contracte contractes contractee contractees".split(' ') },
{ word: "derme", synonyms: "dermatologie dermatologue dermique dermatologies dermatologues dermiques dermatome dermatomes".split(' ') },
{ word: "digestion", synonyms: "digestions digestif digestifs digestive digestives digerer digere digeres digeree digerees".split(' ') },
{ word: "epuisement", synonyms: "epuise epuises epuisee epuisees".split(' ') },
{ word: "ereintement", synonyms: "ereinte ereintes ereintee ereintees".split(' ') },
{ word: "extenuation", synonyms: "extenuement extenue extenues extenuee extenuees".split(' ') },
{ word: "faible", synonyms: "faiblesse affaiblissement affaibli affaiblir affaiblis affaiblie affaiblies affaiblissant affaiblissants affaiblissante affaiblissantes".split(' ') },
{ word: "harassement", synonyms: "harasse harasses harassee harassees".split(' ') },
{ word: "parodontal", synonyms: "parodontie parodonties parodontale parodontales parodontite parodontites parodontologie".split(' ') },
{ word: "pet", synonyms: "peter pete petes petee petees".split(' ') },
{ word: "sang", synonyms: "sanguin sanguins sanguine sanguines sanguinolent sanguinolents sanguinolente sanguinolentes saignant sanglant ensanglante saignante sanglante ensanglantee saignantes sanglantes ensanglantees".split(' ') },
{ word: "sensible", synonyms: "sensibilite sensibilites sensibilisation sensiblement".split(' ') },
{ word: "surmenage", synonyms: "surmene surmenes surmenee surmenees".split(' ') },
{ word: "synovie", synonyms: "synovies synoviale synoviales".split(' ') },
]

function cleanForSearch(phrase) {
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
      const synonym = synonyms.find(s => s.synonyms.includes(w))
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



export { slugify, cleanForSearch, bbcode }
