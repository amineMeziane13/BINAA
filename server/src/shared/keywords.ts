// BTP Ontology: Maps primary professions/concepts to related terms
const ONTOLOGY: Record<string, string[]> = {
  'plombier': ['eau', 'fuite', 'tuyau', 'robinet', 'evier', 'canalisation', 'chauffage', 'gaz', 'sanitaire', 'debouchage', 'plomberie'],
  'electricien': ['courant', 'prise', 'cable', 'lumiere', 'eclairage', 'disjoncteur', 'panne', 'electricite', 'tableau', 'fil'],
  'macon': ['mur', 'beton', 'brique', 'ciment', 'construction', 'dalle', 'fondation', 'renovation', 'gros oeuvre', 'maconnerie', 'parpaing'],
  'peintre': ['peinture', 'mur', 'couleur', 'plafond', 'facade', 'revetement', 'renovation', 'decor', 'enduit'],
  'menuisier': ['bois', 'porte', 'fenetre', 'meuble', 'placard', 'sur mesure', 'parquet', 'renovation', 'menuiserie', 'aluminium', 'pvc'],
  'carreleur': ['carrelage', 'faience', 'sol', 'mur', 'salle de bain', 'cuisine', 'dalle', 'renovation', 'joint'],
  'climaticien': ['climatisation', 'froid', 'chaud', 'air', 'clim', 'ventilation', 'chauffage', 'frigo', 'climatiseur'],
  'serrurier': ['serrure', 'cle', 'porte', 'verrou', 'ouverture', 'blindee', 'urgence', 'clef', 'serrurerie'],
  'vitrier': ['vitre', 'fenetre', 'verre', 'casse', 'miroir', 'vitrerie'],
  'jardinier': ['jardin', 'arbre', 'gazon', 'plante', 'taille', 'herbe', 'exterieur'],
};

export const extractKeywords = (text: string): string[] => {
  if (!text) return [];

  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ') // Keep alphanumeric and hyphens
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(' ').filter(word => word.length > 2);

  // BTP & Construction specific stop words (French)
  const stopWords = new Set([
    'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'vers', 'chez', 'pres', 'tout', 'tous',
    'faire', 'besoin', 'cherche', 'urgent', 'tres', 'peu', 'plus', 'moins', 'bien', 'mal',
    'bon', 'mauvais', 'grand', 'petit', 'nouveau', 'ancien', 'vieux', 'jeune', 'beau',
    'gros', 'fin', 'fort', 'faible', 'haut', 'bas', 'long', 'court', 'large', 'etroit',
    'avoir', 'etre', 'suis', 'es', 'est', 'sommes', 'etes', 'sont', 'ai', 'as', 'a', 'avons', 'avez', 'ont',
    'les', 'des', 'ces', 'ses', 'mes', 'tes', 'nos', 'vos', 'leur', 'leurs',
    'qui', 'que', 'quoi', 'dont', 'ou', 'quand', 'comment', 'pourquoi', 'combien',
    'ici', 'la', 'bas', 'haut', 'gauche', 'droite', 'devant', 'derriere', 'entre', 'parmi',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on', 'ca', 'ce', 'ceci', 'cela',
    'recherche', 'svp', 'bonjour', 'merci', 'salam', 'salut'
  ]);

  const uniqueWords = new Set<string>();
  
  words.forEach(word => {
    if (!stopWords.has(word)) {
      uniqueWords.add(word);
    }
  });

  // Semantic Expansion: if any extracted word matches a key or a value in the ontology,
  // we add the key (the root profession/concept) to the keywords.
  // This helps bridge the gap between "fuite" (client) and "plombier" (artisan).
  const expanded = new Set(uniqueWords);
  uniqueWords.forEach(word => {
    Object.entries(ONTOLOGY).forEach(([profession, relatedTerms]) => {
      // If the word is the profession itself, or one of its related terms
      if (word === profession || relatedTerms.some(term => term.includes(word) || word.includes(term))) {
        expanded.add(profession);
        // We could also add all related terms, but adding the root profession is usually enough
        // to match with the artisan's skills (which will also be expanded to the root profession).
      }
    });
  });

  return Array.from(expanded);
};
