/**
 * Simple Levenshtein distance algorithm to calculate the edit distance between two words.
 */
function levenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  let i: number, j: number;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

/**
 * Fuzzy search function that matches words in a text against query tokens.
 * Supports substring matching, character sequence match, and typo tolerance via Levenshtein distance.
 */
export function fuzzySearch(text: string, query: string): boolean {
  if (!text || !query) return false;
  
  const cleanText = text.toLowerCase().trim();
  const cleanQuery = query.toLowerCase().trim();
  
  if (cleanText.includes(cleanQuery)) return true;
  
  // If the query is short, only allow substring search to prevent excessive unrelated matches
  if (cleanQuery.length < 3) return false;
  
  const textWords = cleanText.split(/\s+/);
  const queryWords = cleanQuery.split(/\s+/);
  
  // Every word in the query must have a fuzzy match in the text
  return queryWords.every((qw) => {
    return textWords.some((tw) => {
      // Direct substring match for this word
      if (tw.includes(qw) || qw.includes(tw)) return true;
      
      // Typo-tolerance threshold:
      // Allow 1 typo for words of length 3-4, and 2 typos for longer words
      const maxDistance = qw.length <= 4 ? 1 : 2;
      const distance = levenshteinDistance(tw, qw);
      
      return distance <= maxDistance;
    });
  });
}
