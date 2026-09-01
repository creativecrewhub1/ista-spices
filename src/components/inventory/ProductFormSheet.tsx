import { useEffect, useState, useRef } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pencil,
  Plus,
  Flame,
  Tag,
  Percent,
  Layers,
  ImageIcon,
  Eye,
  Trash2,
  Upload,
  Check,
} from 'lucide-react'
import type { PackSizeLabel, Product, ProductCategory, SpiceLevel } from '@/data/types'

interface ProductFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: (product: Product) => void
}

const allPackSizes: PackSizeLabel[] = ['250g', '500g', '1kg', '2kg']

const emptyProduct: Product = {
  id: '',
  name: '',
  category: 'spice-powder',
  description: '',
  packSizes: [
    { size: '250g', price: 0 },
    { size: '500g', price: 0 },
    { size: '1kg', price: 0 },
    { size: '2kg', price: 0 },
  ],
  discountPercent: 0,
  spiceLevel: null,
  imageUrl: null,
  batchCapacity: 30,
  unitsPackedThisBatch: 0,
  stockLevel: 'ok',
  isActive: true,
}

export function ProductFormSheet({ open, onOpenChange, product, onSave }: ProductFormSheetProps) {
  const [draft, setDraft] = useState<Product>(product ?? emptyProduct)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setDraft(product ?? emptyProduct)
  }, [product, open])

  const isEditing = Boolean(product)
  const hasImage = Boolean(draft.imageUrl && draft.imageUrl.trim().length > 0)

  const handleRemoveImage = () => {
    setDraft({ ...draft, imageUrl: null })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setDraft({ ...draft, imageUrl: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  function updatePackPrice(size: PackSizeLabel, price: number) {
    setDraft((prev) => ({
      ...prev,
      packSizes: prev.packSizes.map((pack) => (pack.size === size ? { ...pack, price } : pack)),
    }))
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md p-6 bg-white border-l border-slate-200">
          
          {/* Styled Sheet Header */}
          <SheetHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-xs">
                {isEditing ? <Pencil className="size-5" /> : <Plus className="size-5" />}
              </span>
              <div>
                <SheetTitle className="font-display text-xl font-black text-slate-900">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </SheetTitle>
                <SheetDescription className="text-xs font-medium text-slate-500">
                  {isEditing
                    ? 'Update details for this spice or oil.'
                    : 'Add a freshly made spice powder or cooking oil.'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form
            className="flex flex-col gap-5 py-6"
            onSubmit={(event) => {
              event.preventDefault()
              onSave(draft)
            }}
          >
            {/* Product Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Flame className="size-3.5 text-orange-500" /> Product Name
              </Label>
              <Input
                id="name"
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Turmeric Powder"
                className="rounded-2xl border-slate-200 bg-slate-50/70 py-2.5 px-3.5 text-sm font-semibold focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Sourcing, grind, or pressing notes"
                rows={2}
                className="rounded-2xl border-slate-200 bg-slate-50/70 p-3 text-sm font-medium focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 resize-none"
              />
            </div>

            {/* Category & Spice Level */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Tag className="size-3.5 text-orange-500" /> Category
                </Label>
                <Select
                  value={draft.category}
                  onValueChange={(v: ProductCategory) =>
                    setDraft({ ...draft, category: v, spiceLevel: v === 'cooking-oil' ? null : draft.spiceLevel })
                  }
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 py-2.5 px-3 font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 p-1">
                    <SelectItem value="spice-powder" className="rounded-xl font-semibold cursor-pointer">Spice Powder</SelectItem>
                    <SelectItem value="cooking-oil" className="rounded-xl font-semibold cursor-pointer">Cooking Oil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Spice Level
                </Label>
                <Select
                  value={draft.spiceLevel ?? 'none'}
                  onValueChange={(v: SpiceLevel | 'none') =>
                    setDraft({ ...draft, spiceLevel: v === 'none' ? null : v })
                  }
                  disabled={draft.category === 'cooking-oil'}
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 py-2.5 px-3 font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 p-1">
                    <SelectItem value="none" className="rounded-xl font-semibold cursor-pointer">Not applicable</SelectItem>
                    <SelectItem value="mild" className="rounded-xl font-semibold cursor-pointer">Mild</SelectItem>
                    <SelectItem value="medium" className="rounded-xl font-semibold cursor-pointer">Medium</SelectItem>
                    <SelectItem value="hot" className="rounded-xl font-semibold cursor-pointer">Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pack Sizes & Pricing */}
            <div className="space-y-2 pt-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Pack Sizes & Pricing (&#8377;)</span>
              </Label>
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50/60 p-3 rounded-2xl border border-slate-200/70">
                {allPackSizes.map((size) => {
                  const pack = draft.packSizes.find((p) => p.size === size)
                  return (
                    <div key={size} className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-xs font-bold text-slate-600 pl-1">{size}</span>
                      <Input
                        id={`pack-${size}`}
                        type="number"
                        min={0}
                        value={pack?.price ?? 0}
                        onChange={(e) => updatePackPrice(size, Number(e.target.value))}
                        className="w-20 h-8 text-right rounded-lg border-slate-200 bg-slate-50 text-xs font-bold focus:bg-white"
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Discount & Batch Capacity */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="discount" className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1">
                  <Percent className="size-3 text-rose-500" /> Discount %
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  max={100}
                  value={draft.discountPercent}
                  onChange={(e) => setDraft({ ...draft, discountPercent: Number(e.target.value) })}
                  className="rounded-2xl border-slate-200 bg-slate-50/70 py-2 px-3 text-sm font-bold text-center"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacity" className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1">
                  <Layers className="size-3 text-amber-500" /> Batch Cap
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  value={draft.batchCapacity}
                  onChange={(e) => setDraft({ ...draft, batchCapacity: Number(e.target.value) })}
                  className="rounded-2xl border-slate-200 bg-slate-50/70 py-2 px-3 text-sm font-bold text-center"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unitsPacked" className="text-[11px] font-bold uppercase text-slate-600">
                  In Hand
                </Label>
                <Input
                  id="unitsPacked"
                  type="number"
                  min={0}
                  value={draft.unitsPackedThisBatch}
                  onChange={(e) => setDraft({ ...draft, unitsPackedThisBatch: Number(e.target.value) })}
                  className="rounded-2xl border-slate-200 bg-slate-50/70 py-2 px-3 text-sm font-bold text-center"
                />
              </div>
            </div>

            {/* UPLOAD IMAGE SECTION */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-orange-500" /> Product Image
                </Label>
                {hasImage && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="size-3" /> Image Uploaded
                  </span>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* CASE 1: IMAGE IS PRESENT -> SHOW PREVIEW & REMOVE BUTTON */}
              {hasImage ? (
                <div className="rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="relative size-20 rounded-2xl overflow-hidden border border-orange-200 shadow-sm shrink-0 bg-slate-100 group">
                      <img
                        src={draft.imageUrl!}
                        alt="Product preview"
                        className="size-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="block text-xs font-bold text-slate-900 truncate">
                        {draft.name || 'Product Photo'}
                      </span>
                      <span className="block text-[11px] font-mono text-slate-500 truncate">
                        {draft.imageUrl?.startsWith('data:') ? 'Custom Uploaded File' : draft.imageUrl}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Full Preview & Remove Button */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewModalOpen(true)}
                      className="rounded-2xl border-orange-200 bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 text-xs font-bold gap-1.5"
                    >
                      <Eye className="size-3.5" />
                      <span>Full Preview</span>
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 text-xs font-bold gap-1.5"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Remove Photo</span>
                    </Button>
                  </div>
                </div>
              ) : (
                /* CASE 2: NO IMAGE -> DIRECT UPLOAD IMAGE DROPZONE BUTTON */
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-3xl border-2 border-dashed border-orange-300 bg-orange-50/40 p-6 text-center space-y-3 hover:bg-orange-50/80 hover:border-orange-500 transition-all cursor-pointer group"
                >
                  <div className="flex size-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    <Upload className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      Upload Image
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Click to choose an image file from your device (PNG, JPG, WebP)
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 shadow-xs"
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>

            {/* Sheet Footer Submit Button */}
            <SheetFooter className="pt-4 px-0">
              <Button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-3 text-sm shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01]"
              >
                {isEditing ? 'Save Changes' : 'Add Product'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* FULL IMAGE PREVIEW DIALOG MODAL */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-slate-900">
              Photo Preview: {draft.name}
            </DialogTitle>
          </DialogHeader>

          {draft.imageUrl && (
            <div className="space-y-4 pt-2">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                <img
                  src={draft.imageUrl}
                  alt={draft.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleRemoveImage()
                    setPreviewModalOpen(false)
                  }}
                  className="rounded-2xl text-xs font-bold gap-1.5"
                >
                  <Trash2 className="size-3.5" /> Remove Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewModalOpen(false)}
                  className="rounded-2xl text-xs font-semibold"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
