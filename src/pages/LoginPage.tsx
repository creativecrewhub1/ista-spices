import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Flame, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/auth/AuthProvider'
import { useAuthStatus } from '@/data/queries'
import { useSignUpAdmin } from '@/data/mutations'
import { supabaseAuth } from '@/lib/supabaseAuthClient'

export function LoginPage() {
  const { session, loading: sessionLoading } = useAuth()
  const statusQuery = useAuthStatus()
  const signUpAdmin = useSignUpAdmin()

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signInError, setSignInError] = useState<string | null>(null)
  const [signInLoading, setSignInLoading] = useState(false)

  if (!sessionLoading && session) {
    return <Navigate to="/" replace />
  }

  const adminExists = statusQuery.data?.adminExists ?? true
  const activeMode = adminExists ? 'sign-in' : mode

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    setSignInError(null)
    setSignInLoading(true)
    const { error } = await supabaseAuth.auth.signInWithPassword({ email, password })
    setSignInLoading(false)
    if (error) setSignInError(error.message)
  }

  function handleSignUp(event: FormEvent) {
    event.preventDefault()
    if (password !== confirmPassword) return
    signUpAdmin.mutate({ email, password })
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Flame className="size-5" aria-hidden="true" />
          </span>
          <CardTitle className="text-lg">Ista Spices</CardTitle>
          <CardDescription>Admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {!adminExists && (
            <Tabs
              value={activeMode}
              onValueChange={(v) => setMode(v as 'sign-in' | 'sign-up')}
              className="mb-4"
            >
              <TabsList className="w-full">
                <TabsTrigger value="sign-in" className="flex-1">
                  Sign in
                </TabsTrigger>
                <TabsTrigger value="sign-up" className="flex-1">
                  Sign up
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {activeMode === 'sign-in' ? (
            <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
              {!adminExists && (
                <p className="text-xs text-muted-foreground">
                  No admin account yet — switch to the Sign up tab to create one.
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {signInError && <p className="text-sm text-destructive">{signInError}</p>}
              <Button type="submit" className="w-full gap-1.5" disabled={signInLoading}>
                {signInLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Sign in
              </Button>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
              <p className="text-xs text-muted-foreground">
                Creates the one admin account for this panel. Sign-up disappears once it exists.
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="signup-confirm">Confirm password</Label>
                <Input
                  id="signup-confirm"
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
              {signUpAdmin.isError && (
                <p className="text-sm text-destructive">{(signUpAdmin.error as Error).message}</p>
              )}
              <Button
                type="submit"
                className="w-full gap-1.5"
                disabled={signUpAdmin.isPending || password !== confirmPassword || !password}
              >
                {signUpAdmin.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Create admin account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
