import { useEffect, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ErrorState, LoadingState } from '@/components/common/QueryState'
import { useAuth } from '@/auth/AuthProvider'
import { useMyProfile } from '@/data/queries'
import { useUpdateMyProfile } from '@/data/mutations'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'

// Reaching this page at all requires a session — see RequireSession in App.tsx.
export function ProfilePage() {
  const { user } = useAuth()
  const { data: profile, isLoading, error } = useMyProfile()
  const updateProfile = useUpdateMyProfile()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saved, setSaved] = useState(false)

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
    updateProfile.mutate({ name, phone, address, avatarUrl }, { onSuccess: () => setSaved(true) })
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
          <Card>
            <CardHeader className="flex-row items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={avatarUrl || undefined} alt={name} />
                <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">
                  {(name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">{name || user?.email}</CardTitle>
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
                  <Label htmlFor="profile-address">Delivery address</Label>
                  <Textarea
                    id="profile-address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-avatar">Photo URL</Label>
                  <Input
                    id="profile-avatar"
                    type="url"
                    placeholder="https://…"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
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
        )}
      </div>
    </div>
  )
}
