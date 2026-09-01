import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { categories } from '../data/products'
import { formatINR } from '../components/PriceTag'
import { DEFAULT_MAX_PRICE, defaultFilters, type ShopFilters } from './types'
import type { ProductCategory } from '../data/types'

const SPICE_LEVELS = ['mild', 'medium', 'hot']

interface FilterPanelProps {
  filters: ShopFilters
  onChange: (filters: ShopFilters) => void
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  function toggleCategory(category: ProductCategory) {
    const has = filters.categories.includes(category)
    onChange({
      ...filters,
      categories: has ? filters.categories.filter((c) => c !== category) : [...filters.categories, category],
    })
  }

  function toggleSpiceLevel(level: string) {
    const has = filters.spiceLevels.includes(level)
    onChange({
      ...filters,
      spiceLevels: has ? filters.spiceLevels.filter((l) => l !== level) : [...filters.spiceLevels, level],
    })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.spiceLevels.length > 0 ||
    filters.inStockOnly ||
    filters.maxPrice < DEFAULT_MAX_PRICE

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Filters</h2>
        {hasActiveFilters ? (
          <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground" onClick={() => onChange(defaultFilters)}>
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</p>
        <div className="flex flex-col gap-2.5">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2.5">
              <Checkbox
                id={`cat-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <Label htmlFor={`cat-${category.id}`} className="text-sm font-normal text-foreground">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Spice level</p>
        <div className="flex flex-col gap-2.5">
          {SPICE_LEVELS.map((level) => (
            <div key={level} className="flex items-center gap-2.5">
              <Checkbox
                id={`level-${level}`}
                checked={filters.spiceLevels.includes(level)}
                onCheckedChange={() => toggleSpiceLevel(level)}
              />
              <Label htmlFor={`level-${level}`} className="text-sm font-normal capitalize text-foreground">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Max price</p>
          <span className="text-sm tabular-nums text-foreground">{formatINR(filters.maxPrice)}</span>
        </div>
        <Slider
          value={[filters.maxPrice]}
          min={100}
          max={DEFAULT_MAX_PRICE}
          step={50}
          onValueChange={([value]) => onChange({ ...filters, maxPrice: value })}
        />
      </div>

      <Separator />

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="in-stock"
          checked={filters.inStockOnly}
          onCheckedChange={(checked) => onChange({ ...filters, inStockOnly: Boolean(checked) })}
        />
        <Label htmlFor="in-stock" className="text-sm font-normal text-foreground">
          In stock only
        </Label>
      </div>
    </div>
  )
}
