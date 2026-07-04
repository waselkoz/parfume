import { Product } from "@/context/AppContext";

export function getRecommendations(currentProduct: Product, allProducts: Product[], limit: number = 4): Product[] {
  // Extract all notes for the current product into a single array for easy matching
  const currentNotes = [
    ...(currentProduct.topNotes || []),
    ...(currentProduct.heartNotes || []),
    ...(currentProduct.baseNotes || [])
  ].map(note => note.toLowerCase().trim());

  const scoredProducts = allProducts
    .filter(p => p.id !== currentProduct.id)
    .map(product => {
      let score = 0;

      // 1. Same Category (+2)
      if (product.category === currentProduct.category) {
        score += 2;
      }

      // 2. Same Brand (+1)
      if (product.brand && currentProduct.brand && product.brand === currentProduct.brand) {
        score += 1;
      }

      // 3. Shared Olfactory Notes (+3 per matching note)
      const productNotes = [
        ...(product.topNotes || []),
        ...(product.heartNotes || []),
        ...(product.baseNotes || [])
      ].map(note => note.toLowerCase().trim());

      const sharedNotes = productNotes.filter(note => currentNotes.includes(note));
      score += sharedNotes.length * 3;

      return { product, score };
    });

  // Sort by score descending. If tied, sort by rating descending.
  scoredProducts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (b.product.rating || 0) - (a.product.rating || 0);
  });

  return scoredProducts.slice(0, limit).map(item => item.product);
}
