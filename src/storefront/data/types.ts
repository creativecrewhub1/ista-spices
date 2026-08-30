export type ProductCategory = 'spice-powders' | 'cooking-oils' | 'blends' | 'gift-sets'

export type ProductAccent =
  | 'turmeric'
  | 'chilli'
  | 'coriander'
  | 'garam-masala'
  | 'pepper'
  | 'oil-gold'
  | 'oil-green'
  | 'sesame'

export interface ProductVariant {
  id: string
  label: string
  price: number
  compareAtPrice?: number
}

export type ProductBadge = 'bestseller' | 'new' | 'limited'

export interface Product {
  id: string
  slug: string
  name: string
  category: ProductCategory
  tagline: string
  description: string
  story: string
  variants: ProductVariant[]
  rating: number
  reviewCount: number
  badges: ProductBadge[]
  spiceLevel: 'mild' | 'medium' | 'hot' | null
  origin: string
  inStock: boolean
  accent: ProductAccent
}

export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  date: string
  title: string
  body: string
  verified: boolean
}

export interface CategoryInfo {
  id: ProductCategory
  label: string
  description: string
  accent: ProductAccent
}
