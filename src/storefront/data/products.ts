import type { CategoryInfo, Product } from './types'

function variants(base: number) {
  return [
    { id: '250g', label: '250 g', price: base },
    { id: '500g', label: '500 g', price: Math.round(base * 1.9) },
    { id: '1kg', label: '1 kg', price: Math.round(base * 3.6) },
  ]
}

export const categories: CategoryInfo[] = [
  {
    id: 'spice-powders',
    label: 'Spice Powders',
    description: 'Stone-ground in small batches, within days of roasting.',
    accent: 'turmeric',
  },
  {
    id: 'blends',
    label: 'House Blends',
    description: 'Signature masalas, balanced over three generations.',
    accent: 'garam-masala',
  },
  {
    id: 'cooking-oils',
    label: 'Cooking Oils',
    description: 'Cold-pressed and wood-pressed, unrefined.',
    accent: 'oil-gold',
  },
  {
    id: 'gift-sets',
    label: 'Gift Sets',
    description: 'Curated collections for the kitchens you love.',
    accent: 'garam-masala',
  },
]

export const products: Product[] = [
  {
    id: 'p-1',
    slug: 'sun-dried-turmeric-powder',
    name: 'Sun-Dried Turmeric Powder',
    category: 'spice-powders',
    tagline: 'Stone-ground, deep amber colour',
    description:
      'Turmeric fingers sun-dried on our family farm, then stone-ground within 48 hours of roasting to preserve colour and aroma. No fillers, no anti-caking agents.',
    story:
      'Grown on the same red-soil plots our grandmother once tended, this turmeric is harvested by hand and dried the slow way — under open sun, never in a machine drier. It takes three weeks longer. You can taste the difference in the first spoon of dal.',
    variants: variants(180),
    rating: 4.8,
    reviewCount: 214,
    badges: ['bestseller'],
    spiceLevel: null,
    origin: 'Erode, Tamil Nadu',
    inStock: true,
    accent: 'turmeric',
  },
  {
    id: 'p-2',
    slug: 'kashmiri-red-chilli-powder',
    name: 'Kashmiri Red Chilli Powder',
    category: 'spice-powders',
    tagline: 'Deep colour, gentle heat',
    description:
      'Prized for colour over heat — Kashmiri chillies give curries their signature red without overwhelming the palate. Ground fresh to order in small batches.',
    story:
      'Sourced directly from growers in the Kashmir valley, these chillies are shade-dried to protect their pigment. A spoon of this in tadka turns ordinary ghee into something worth photographing.',
    variants: variants(220),
    rating: 4.7,
    reviewCount: 168,
    badges: [],
    spiceLevel: 'mild',
    origin: 'Kashmir Valley',
    inStock: true,
    accent: 'chilli',
  },
  {
    id: 'p-3',
    slug: 'guntur-chilli-powder',
    name: 'Guntur Chilli Powder',
    category: 'spice-powders',
    tagline: 'For those who like it hot',
    description:
      'One of the hottest chilli varietals grown in India, from the fields of Guntur. A little goes a long way — start with half a spoon.',
    story: 'Guntur farmers have grown this varietal for generations. We buy direct, at harvest price, and grind it within the week.',
    variants: variants(240),
    rating: 4.6,
    reviewCount: 96,
    badges: [],
    spiceLevel: 'hot',
    origin: 'Guntur, Andhra Pradesh',
    inStock: true,
    accent: 'chilli',
  },
  {
    id: 'p-4',
    slug: 'roasted-coriander-powder',
    name: 'Roasted Coriander Powder',
    category: 'spice-powders',
    tagline: 'Citrus-warm, everyday essential',
    description:
      'Coriander seeds dry-roasted in small copper pans before grinding, drawing out a citrus warmth that pre-ground supermarket coriander loses months before it reaches the shelf.',
    story:
      'This is the spice most home cooks under-appreciate — until they taste it fresh. Roasted in-house, ground the same afternoon, packed the same evening.',
    variants: variants(140),
    rating: 4.7,
    reviewCount: 132,
    badges: [],
    spiceLevel: null,
    origin: 'Kota, Rajasthan',
    inStock: true,
    accent: 'coriander',
  },
  {
    id: 'p-5',
    slug: 'signature-garam-masala',
    name: 'Signature Garam Masala',
    category: 'blends',
    tagline: 'Twelve whole spices, one balance',
    description:
      'Our great-grandmother’s ratio of twelve whole spices, dry-roasted separately and blended in small batches so no single note overpowers the rest.',
    story:
      'Every household in Tamil Nadu has an opinion about garam masala. This is ours — unchanged since 1962, adjusted only for the seasonality of cardamom.',
    variants: variants(260),
    rating: 4.9,
    reviewCount: 301,
    badges: ['bestseller'],
    spiceLevel: 'medium',
    origin: 'House blend',
    inStock: true,
    accent: 'garam-masala',
  },
  {
    id: 'p-6',
    slug: 'south-indian-sambar-powder',
    name: 'South Indian Sambar Powder',
    category: 'blends',
    tagline: 'Lentil-forward, tamarind-ready',
    description:
      'A roasted lentil and spice blend built for sambar — balanced to work with tamarind and vegetables without needing anything else added.',
    story: 'This recipe travelled with our family from a kitchen in Thanjavur. We’ve kept the roast dark, the way it was meant to be.',
    variants: variants(190),
    rating: 4.6,
    reviewCount: 89,
    badges: [],
    spiceLevel: 'medium',
    origin: 'House blend',
    inStock: true,
    accent: 'garam-masala',
  },
  {
    id: 'p-7',
    slug: 'tangy-rasam-powder',
    name: 'Tangy Rasam Powder',
    category: 'blends',
    tagline: 'Peppery, bright, comforting',
    description:
      'A peppery, tamarind-friendly rasam blend, roasted dark for depth. Comfort food in a jar.',
    story: 'The blend our founder’s mother made every Sunday, bottled without changing a single ratio.',
    variants: variants(175),
    rating: 4.5,
    reviewCount: 54,
    badges: ['new'],
    spiceLevel: 'medium',
    origin: 'House blend',
    inStock: true,
    accent: 'garam-masala',
  },
  {
    id: 'p-8',
    slug: 'wood-pressed-groundnut-oil',
    name: 'Wood-Pressed Groundnut Oil',
    category: 'cooking-oils',
    tagline: 'Slow-pressed, unrefined',
    description:
      'Pressed the traditional way in a wooden churner (chekku), at low speed and low heat — a process that keeps the natural aroma and nutrients intact.',
    story:
      'Most oil today is extracted with heat and solvents for yield. We press slower, get less oil per kilo of groundnut, and think it’s worth it.',
    variants: variants(260),
    rating: 4.8,
    reviewCount: 178,
    badges: ['bestseller'],
    spiceLevel: null,
    origin: 'Wood-pressed, Tamil Nadu',
    inStock: true,
    accent: 'oil-gold',
  },
  {
    id: 'p-9',
    slug: 'virgin-coconut-oil',
    name: 'Virgin Coconut Oil',
    category: 'cooking-oils',
    tagline: 'Cold-pressed, no heat used',
    description:
      'Extracted from fresh coconut milk without applying heat — a slower method that retains a delicate coconut aroma often lost in commercial refining.',
    story: 'Made in small batches from coconuts harvested within 48 hours of pressing, from groves along the Kerala backwaters.',
    variants: variants(300),
    rating: 4.9,
    reviewCount: 245,
    badges: ['bestseller'],
    spiceLevel: null,
    origin: 'Kerala backwaters',
    inStock: true,
    accent: 'oil-green',
  },
  {
    id: 'p-10',
    slug: 'cold-pressed-sesame-oil',
    name: 'Cold-Pressed Sesame Oil',
    category: 'cooking-oils',
    tagline: 'Nutty, traditional, gingelly',
    description:
      'Traditional wood-pressed gingelly oil with a deep nutty aroma, ideal for tempering and traditional South Indian cooking.',
    story: 'Pressed the same way for four generations, using sesame seeds sourced from the same three farming families each year.',
    variants: variants(320),
    rating: 4.7,
    reviewCount: 112,
    badges: [],
    spiceLevel: null,
    origin: 'Wood-pressed, Tamil Nadu',
    inStock: true,
    accent: 'sesame',
  },
  {
    id: 'p-11',
    slug: 'extra-virgin-olive-oil',
    name: 'Extra Virgin Olive Oil',
    category: 'cooking-oils',
    tagline: 'First cold-press, imported',
    description:
      'A well-balanced, first cold-press extra virgin olive oil — grassy, peppery on the finish, suited to finishing dishes rather than high-heat cooking.',
    story: 'Imported in small casks and bottled to order, so what you receive was pressed within the same season.',
    variants: variants(520),
    rating: 4.6,
    reviewCount: 61,
    badges: [],
    spiceLevel: null,
    origin: 'Mediterranean import',
    inStock: true,
    accent: 'oil-green',
  },
  {
    id: 'p-12',
    slug: 'single-origin-black-pepper',
    name: 'Single-Origin Black Pepper',
    category: 'spice-powders',
    tagline: 'Malabar pepper, freshly ground',
    description:
      'Malabar peppercorns ground fresh to order — sharper and more aromatic than pre-ground pepper that has already lost its volatile oils.',
    story: 'Grown on the slopes of the Western Ghats, where pepper has been cultivated for over two thousand years.',
    variants: variants(240),
    rating: 4.8,
    reviewCount: 143,
    badges: [],
    spiceLevel: 'hot',
    origin: 'Western Ghats, Kerala',
    inStock: true,
    accent: 'pepper',
  },
  {
    id: 'p-13',
    slug: 'the-everyday-essentials-set',
    name: 'The Everyday Essentials Set',
    category: 'gift-sets',
    tagline: 'Five spices, one gift box',
    description:
      'Turmeric, Kashmiri chilli, coriander, garam masala, and black pepper — the five jars every kitchen reaches for, in a hand-finished gift box.',
    story: 'Our most-gifted set. Arrives in recyclable kraft packaging with a handwritten note card, no plastic wrap.',
    variants: [
      { id: 'set', label: 'Gift box (5 jars)', price: 1450 },
    ],
    rating: 4.9,
    reviewCount: 87,
    badges: ['bestseller'],
    spiceLevel: null,
    origin: 'Curated set',
    inStock: true,
    accent: 'garam-masala',
  },
  {
    id: 'p-14',
    slug: 'the-cold-pressed-oil-trio',
    name: 'The Cold-Pressed Oil Trio',
    category: 'gift-sets',
    tagline: 'Groundnut, coconut, sesame',
    description:
      'Three of our most-loved wood-pressed oils in 250ml bottles, packaged together for kitchens that care where their oil comes from.',
    story: 'A set built for someone starting their unrefined-oil journey — enough of each to find a favourite.',
    variants: [
      { id: 'set', label: 'Gift box (3 bottles)', price: 1290 },
    ],
    rating: 4.8,
    reviewCount: 42,
    badges: ['new'],
    spiceLevel: null,
    origin: 'Curated set',
    inStock: true,
    accent: 'oil-gold',
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, count)
}
