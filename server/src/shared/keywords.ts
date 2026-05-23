export const extractKeywords = (text: string): string[] => {
  if (!text) return [];

  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ') // Keep alphanumeric and hyphens
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(' ').filter(word => word.length > 2); // Ignore very short words like 'et', 'le', 'la', 'un'

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
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on', 'ca', 'ce', 'ceci', 'cela'
  ]);

  const uniqueWords = new Set<string>();
  
  words.forEach(word => {
    if (!stopWords.has(word)) {
      uniqueWords.add(word);
    }
  });

  return Array.from(uniqueWords);
};
