import type { Review } from './types'

export const reviews: Review[] = [
  {
    id: 'r-1',
    productId: 'p-1',
    author: 'Meera K.',
    rating: 5,
    date: '2026-08-02',
    title: 'The colour alone tells you it\'s different',
    body: 'I have bought turmeric from three other "premium" brands and this is genuinely a different product. Deep colour, no bitterness, and it dissolves properly instead of clumping.',
    verified: true,
  },
  {
    id: 'r-2',
    productId: 'p-1',
    author: 'Arvind S.',
    rating: 5,
    date: '2026-07-18',
    title: 'Reordering already',
    body: 'Went through a 250g pack in three weeks because I kept using it for everything, including my morning turmeric latte. Worth the price.',
    verified: true,
  },
  {
    id: 'r-3',
    productId: 'p-1',
    author: 'Divya R.',
    rating: 4,
    date: '2026-06-30',
    title: 'Great quality, packaging could be sturdier',
    body: 'The turmeric itself is excellent. The pouch arrived slightly dented but the seal held fine.',
    verified: false,
  },
  {
    id: 'r-4',
    productId: 'p-5',
    author: 'Karthik N.',
    rating: 5,
    date: '2026-08-10',
    title: 'This is what garam masala should smell like',
    body: 'Opened the jar and the aroma filled the kitchen instantly. My biryani has never tasted this balanced.',
    verified: true,
  },
  {
    id: 'r-5',
    productId: 'p-5',
    author: 'Priya M.',
    rating: 5,
    date: '2026-07-22',
    title: 'Gifted this to my mother-in-law',
    body: 'She called me the next day asking where I got it. That says everything.',
    verified: true,
  },
  {
    id: 'r-6',
    productId: 'p-8',
    author: 'Suresh V.',
    rating: 5,
    date: '2026-08-05',
    title: 'Back to how oil used to taste',
    body: 'Grew up on chekku oil at my grandparents\' house. This brought that smell back into my kitchen.',
    verified: true,
  },
  {
    id: 'r-7',
    productId: 'p-9',
    author: 'Anjali T.',
    rating: 5,
    date: '2026-07-29',
    title: 'No refined-coconut aftertaste',
    body: 'You can genuinely taste the difference from the coconut oil sold in supermarkets. Smooth, mild, not overpowering.',
    verified: true,
  },
]

export function reviewsForProduct(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId)
}
