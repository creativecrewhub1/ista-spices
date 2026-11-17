import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/shop/CartContext'
import { useUnits } from '@/data/queries'
import { formatCurrency } from '@/lib/format'
import { formatPack } from '@/lib/packLabel'
import { productImage } from '@/lib/productImage'
import type { CatalogProduct } from '@/data/types'

interface SpicestProductGridProps {
  products?: CatalogProduct[]
}

const FEATURED_COUNT = 4

export function SpicestProductGrid({ products }: SpicestProductGridProps) {
  const featured = (products ?? []).filter((product) => product.packSizes.length > 0).slice(0, FEATURED_COUNT)
  const [activeId, setActiveId] = useState<string | null>(null)
  const { items, addItem, updateQty } = useCart()
  const { data: units = [] } = useUnits()
  const selectedId = featured.some((product) => product.id === activeId) ? activeId : featured[0]?.id

  return (
    <section id="products" className="scroll-mt-20 overflow-hidden bg-[#211711] py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#f4a66b]">The ISTA collection</p>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">Good food begins <span className="italic text-[#f28c43]">here.</span></h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#e7d5c6] sm:text-base">Discover the flavours that bring warmth, colour and character to your table.</p>
          </div>
          <Link to="/shop/all" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#fffaf3] px-5 text-sm font-semibold text-[#39251a] transition-colors hover:bg-[#f8ddc5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">View all products <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>

        {featured.length === 0 ? (
          <p className="rounded-2xl border border-white/20 p-8 text-center text-[#e7d5c6]">No products are available right now.</p>
        ) : (
          <div className="flex flex-col gap-3 lg:h-[560px] lg:flex-row" aria-label="Featured products">
            {featured.map((product, index) => {
              const active = product.id === selectedId
              const pack = product.packSizes[0]
              const quantity = items.find((item) => item.productId === product.id && item.packQty === pack.qty)?.qty ?? 0
              return (
                <article
                  key={product.id}
                  onMouseEnter={() => setActiveId(product.id)}
                  onFocusCapture={() => setActiveId(product.id)}
                  className={`relative isolate overflow-hidden rounded-[28px] bg-[#f7f1e8] text-[#2b1b12] transition-[flex,height] duration-500 ease-out motion-reduce:transition-none lg:h-full ${active ? 'h-[410px] lg:flex-[4.5]' : 'h-20 lg:flex-1'}`}
                >
                  <img src={productImage(product.imageUrl)} alt="" loading="lazy" className={`absolute inset-0 h-full w-full object-contain transition-transform duration-500 motion-reduce:transition-none ${active ? 'scale-100 p-5 pb-36 lg:p-8 lg:pb-44' : 'scale-105 p-2 lg:p-0'}`} />
                  <div className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a120d] via-[#1a120d]/85 to-transparent ${active ? 'h-[65%]' : 'h-full lg:h-[70%]'}`} />
                  <span className={`absolute left-5 top-4 z-10 text-xs font-bold tracking-[0.16em] ${active ? 'text-[#d85818]' : 'text-white lg:text-[#d85818]'}`}>{String(index + 1).padStart(2, '0')}</span>

                  {active ? (
                    <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white sm:p-7 lg:p-9">
                      <h3 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{product.name}</h3>
                      <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-[#f3e6dc]">{product.description || 'A flavourful addition to the meals you make and the moments you share.'}</p>
                      <p className="mt-3 text-xs font-medium text-[#ffb37b]">{formatPack(pack.qty, product.salesUnit, units)} · {formatCurrency(pack.price)} per pack</p>
                      <div className="mt-5 flex items-center gap-3">
                        {quantity > 0 ? (
                          <div className="inline-flex h-11 items-center gap-3 rounded-full bg-[#e85d19] px-1 text-white" role="group" aria-label={`${product.name} quantity`}>
                            <button type="button" onClick={() => updateQty(product.id, pack.qty, quantity - 1)} aria-label={`Decrease ${product.name} quantity`} className="flex size-9 items-center justify-center rounded-full hover:bg-white/20"><Minus className="size-4" /></button>
                            <span className="min-w-5 text-center text-sm font-semibold tabular-nums" aria-live="polite">{quantity}</span>
                            <button type="button" onClick={() => updateQty(product.id, pack.qty, quantity + 1)} aria-label={`Increase ${product.name} quantity`} className="flex size-9 items-center justify-center rounded-full hover:bg-white/20"><Plus className="size-4" /></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => addItem(product, pack.qty, 1)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e85d19] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#ca4b0e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ShoppingBag className="size-4" aria-hidden="true" /> Add to cart</button>
                        )}
                        <span className="hidden text-xs italic text-[#f4d1b6] sm:inline">A little spice changes everything.</span>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setActiveId(product.id)} aria-label={`View ${product.name}`} aria-expanded={false} className="absolute inset-0 z-10 flex items-end p-4 text-left text-white focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#e85d19] lg:items-center lg:justify-end lg:p-5">
                      <span className="truncate font-display text-lg font-semibold lg:[writing-mode:vertical-rl] lg:rotate-180 lg:overflow-visible lg:whitespace-nowrap">{product.name}</span>
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
