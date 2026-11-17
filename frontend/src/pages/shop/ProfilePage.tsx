import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Loader2, LocateFixed, Pencil } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorState, LoadingState } from '@/components/common/QueryState'
import { useAuth } from '@/auth/AuthProvider'
import { useMyProfile } from '@/data/queries'
import { useUpdateMyProfile, useDeleteMyAccount, useUploadAvatar } from '@/data/mutations'
import { api } from '@/lib/apiClient'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'

const MAX_AVATAR_BYTES = 3 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Reaching this page at all requires a session — see RequireSession in App.tsx.
export function ProfilePage() {
  const { user, role, signOut } = useAuth()
  const { data: profile, isLoading, error } = useMyProfile()
  const updateProfile = useUpdateMyProfile()
  const deleteAccount = useDeleteMyAccount()
  const uploadAvatar = useUploadAvatar()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Prefills from the saved customer record; falls back to whatever Google
  // provided at signup for a field the customer has never filled in yet.
  useEffect(() => {
    const googleName = user?.user_metadata?.full_name as string | undefined
    const googleAvatar = user?.user_metadata?.avatar_url as string | undefined
    setName(profile?.name ?? googleName ?? '')
    setPhone(profile?.phone ?? '')
    setAddress(profile?.address ?? '')
    setAvatarUrl(profile?.avatarUrl ?? googleAvatar ?? '')
  }, [profile, user])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaved(false)
    updateProfile.mutate({ name, phone, address }, { onSuccess: () => setSaved(true) })
  }

  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets picking the same file again still fire this
    if (!file) return

    setAvatarError(null)
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Photo must be a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Photo must be under 3MB.')
      return
    }

    uploadAvatar.mutate(file, {
      onSuccess: (result) => setAvatarUrl(result.avatarUrl),
      onError: (err) => setAvatarError((err as Error).message),
    })
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported in this browser.')
      return
    }
    setLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
          )
          if (!res.ok) throw new Error('Could not look up an address for your location.')
          const data = await res.json()
          if (!data.display_name) throw new Error('No address found for your location.')
          setAddress(data.display_name)
        } catch (err) {
          setLocationError((err as Error).message)
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : 'Could not get your current location.',
        )
      },
    )
  }

  async function handleExport() {
    setExporting(true)
    try {
      const data = await api.get('/storefront/me/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'ista-spices-my-data.json'
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  function handleDeleteConfirm() {
    deleteAccount.mutate(undefined, {
      onSuccess: async () => {
        await signOut()
        navigate('/shop')
      },
    })
  }

  return (
    <div className={cn('storefront min-h-svh bg-background pb-8 font-sans text-foreground', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
        <h1 className="mb-6 font-display text-3xl font-bold text-foreground sm:text-4xl">Profile</h1>

        {isLoading ? (
          <LoadingState label="Loading your profile…" />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="flex flex-col items-center gap-3 text-center">
                <div className="relative shrink-0">
                  <Avatar className="size-28">
                    <AvatarImage src={avatarUrl || undefined} alt={name} />
                    <AvatarFallback className="bg-primary/15 text-4xl font-semibold text-primary">
                      {(name || user?.email || 'U').slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={uploadAvatar.isPending}
                    aria-label="Change profile photo"
                    className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background shadow-sm transition-colors hover:bg-foreground/90 disabled:opacity-50"
                  >
                    {uploadAvatar.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Pencil className="size-3.5" aria-hidden="true" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <CardTitle className="text-xl">{name || user?.email}</CardTitle>
                  {user?.email ? <p className="text-sm text-muted-foreground">{user.email}</p> : null}
                  {avatarError ? <p className="mt-1 text-xs text-destructive">{avatarError}</p> : null}
                </div>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="profile-name">Full name</Label>
                    <Input id="profile-name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input id="profile-email" value={user?.email ?? ''} disabled />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="profile-address">Delivery address</Label>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={locating}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                      >
                        {locating ? (
                          <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                        ) : (
                          <LocateFixed className="size-3" aria-hidden="true" />
                        )}
                        Use current location
                      </button>
                    </div>
                    <Textarea
                      id="profile-address"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    {locationError ? <p className="text-xs text-destructive">{locationError}</p> : null}
                  </div>
                  {updateProfile.isError ? (
                    <p className="text-sm text-destructive">{(updateProfile.error as Error).message}</p>
                  ) : null}
                  {saved && !updateProfile.isPending ? <p className="text-sm text-success">Saved.</p> : null}
                  <Button type="submit" disabled={updateProfile.isPending} className="w-full gap-1.5 sm:w-auto">
                    {updateProfile.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                    Save changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your data</CardTitle>
                <CardDescription>Download everything this account holds — profile and order history.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={handleExport} disabled={exporting} className="gap-1.5">
                  {exporting ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="size-4" aria-hidden="true" />
                  )}
                  Export my data
                </Button>
              </CardContent>
            </Card>

            {role !== 'admin' ? (
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
                  <CardDescription>
                    Permanently deletes your account and sign-in. Your past orders stay on record for our business
                    accounts, with your personal details removed from them.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                    Delete my account
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This can&apos;t be undone. You&apos;ll be signed out immediately and will need to sign up again to
              order with us in future.
            </DialogDescription>
          </DialogHeader>
          {deleteAccount.isError ? (
            <p className="text-sm text-destructive">{(deleteAccount.error as Error).message}</p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteAccount.isPending}>
              {deleteAccount.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Delete my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
