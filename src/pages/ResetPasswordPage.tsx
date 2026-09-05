import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthBackdrop } from '@/components/common/AuthBackdrop'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/auth/AuthProvider'
import { supabaseAuth } from '@/lib/supabaseAuthClient'

// Reached only via the link in a password-reset email — Supabase turns that
// link into a real (recovery) session on load, which useAuth() sees like
// any other session. No link, no session: nothing to reset.
export function ResetPasswordPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (password !== confirmPassword) return
    setError(null)
    setSubmitting(true)
    const { error: updateError } = await supabaseAuth.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    // Still signed in (from the recovery link) — /login's own redirect
    // logic takes it from here, straight into the admin panel.
    navigate('/login', { replace: true })
  }

  return (
    <AuthBackdrop>
      <Card className="w-full max-w-sm border-white/40 bg-card/70 shadow-2xl backdrop-blur-xl dark:border-white/10">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-lg">Set a new password</CardTitle>
          <CardDescription>Ista Spices admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? null : !session ? (
            <p className="text-sm text-muted-foreground">
              This reset link is invalid or has expired. Request a new one from the{' '}
              <a href="/login" className="underline underline-offset-2">
                sign-in page
              </a>
              .
            </p>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reset-password">New password</Label>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reset-confirm">Confirm password</Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords don&apos;t match.</p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full gap-1.5"
                disabled={submitting || password !== confirmPassword || !password}
              >
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Update password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthBackdrop>
  )
}
