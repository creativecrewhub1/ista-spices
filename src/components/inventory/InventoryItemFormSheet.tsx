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
  Package,
  Tag,
  Scale,
  AlertCircle,
  ImageIcon,
  Eye,
  Trash2,
  Upload,
  Check,
} from 'lucide-react'
import type { InventoryItem, InventoryItemType } from '@/data/types'

interface InventoryItemFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem | null
  defaultType: InventoryItemType
  onSave: (item: InventoryItem) => void
}

function emptyItem(type: InventoryItemType): InventoryItem {
  return {
    id: '',
    type,
    name: '',
    description: '',
    unit: 'kg',
    quantityOnHand: 0,
    lowStockThreshold: 0,
    isActive: true,
    imageUrl: null,
  }
}

export function InventoryItemFormSheet({
  open,
  onOpenChange,
  item,
  defaultType,
  onSave,
}: InventoryItemFormSheetProps) {
  const [draft, setDraft] = useState<InventoryItem>(item ?? emptyItem(defaultType))
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setDraft(item ?? emptyItem(defaultType))
  }, [item, defaultType, open])

  const isEditing = Boolean(item)
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
                  {isEditing ? 'Edit Item' : 'Add New Item'}
                </SheetTitle>
                <SheetDescription className="text-xs font-medium text-slate-500">
                  {isEditing ? 'Update details for this stock item.' : 'Add a raw material or B2B stock item.'}
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
            {/* Item Name */}
            <div className="space-y-1.5">
              <Label htmlFor="item-name" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Package className="size-3.5 text-orange-500" /> Item Name
              </Label>
              <Input
                id="item-name"
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Black Peppercorns"
                className="rounded-2xl border-slate-200 bg-slate-50/70 py-2.5 px-3.5 text-sm font-semibold focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="item-description" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Description
              </Label>
              <Textarea
                id="item-description"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Raw black peppercorns, ungrounded..."
                rows={2}
                className="rounded-2xl border-slate-200 bg-slate-50/70 p-3 text-sm font-medium focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 resize-none"
              />
            </div>

            {/* Category Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Tag className="size-3.5 text-orange-500" /> Category Type
              </Label>
              <Select
                value={draft.type}
                onValueChange={(v: InventoryItemType) => setDraft({ ...draft, type: v })}
              >
                <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 py-2.5 px-3.5 font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 p-1">
                  <SelectItem value="raw_material" className="rounded-xl font-semibold cursor-pointer">Raw Material</SelectItem>
                  <SelectItem value="b2b" className="rounded-xl font-semibold cursor-pointer">B2B Product</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metrics: Unit, In Hand, Alert */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="item-unit" className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1">
                  <Scale className="size-3 text-slate-400" /> Unit
                </Label>
                <Input
                  id="item-unit"
                  required
                  value={draft.unit}
                  onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                  placeholder="kg"
                  className="rounded-2xl border-slate-200 bg-slate-50/70 py-2 px-3 text-sm font-bold text-center"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="item-qty" className="text-[11px] font-bold uppercase text-slate-600">
                  In Hand
                </Label>
                {/* On-hand is the balance of the stock ledger. Typing over it
                    here would put this screen and Stock back out of step, so
                    it is shown rather than edited. */}
                <Input
                  id="item-qty"
                  readOnly
                  disabled
                  value={draft.quantityOnHand}
                  className="rounded-2xl border-slate-200 bg-slate-100 py-2 px-3 text-center text-sm font-bold text-slate-500"
                />
                <p className="text-[10px] font-medium text-slate-400">Changes via Stock in</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="item-threshold" className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1">
                  <AlertCircle className="size-3 text-rose-400" /> Min Alert
                </Label>
                <Input
                  id="item-threshold"
                  type="number"
                  min={0}
                  value={draft.lowStockThreshold}
                  onChange={(e) => setDraft({ ...draft, lowStockThreshold: Number(e.target.value) })}
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
                        {draft.name || 'Stock Item Photo'}
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
                {isEditing ? 'Save Changes' : 'Add Item'}
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
