import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { mockAddresses, mockCustomer } from '../../data/account'

export function AccountProfilePage() {
  const [form, setForm] = useState({ ...mockCustomer })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    toast.success('Profile updated')
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="mb-4 text-base font-medium text-foreground">Profile</h2>
        <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-name">Full name</Label>
            <Input id="profile-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input id="profile-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Button type="submit" className="mt-2 w-fit">
            Save changes
          </Button>
        </form>
      </div>

      <Separator />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Saved addresses</h2>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="size-3.5" aria-hidden="true" />
            Add address
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mockAddresses.map((address) => (
            <div key={address.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{address.label}</span>
                {address.isDefault ? <Badge variant="outline">Default</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {address.name}
                <br />
                {address.line1}, {address.line2}
                <br />
                {address.city}, {address.state} {address.pincode}
              </p>
              <div className="mt-1 flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                {!address.isDefault ? (
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
