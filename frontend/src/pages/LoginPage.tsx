import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Flame, Loader2 } from 'lucide-react'
import { AuthBackdrop } from '@/components/common/AuthBackdrop'
import { GoogleSignInButton } from '@/components/shop/GoogleSignInButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/auth/AuthProvider'
import { useAuthStatus } from '@/data/queries'
import { useSignUpAdmin } from '@/data/mutations'
import { supabaseAuth } from '@/lib/supabaseAuthClient'

export function LoginPage() {
  const { session, role, loading: sessionLoading } = useAuth()
  const location = useLocation()
  const statusQuery = useAuthStatus()
  const signUpAdmin = useSignUpAdmin()

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signInError, setSignInError] = useState<string | null>(null)
  const [signInLoading, setSignInLoading] = useState(false)

  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)

  if (!sessionLoading && session) {
    // One login page for everyone — where you land depends on who you are,
    // not which form you happened to use. `from` is set when a protected
    // route redirected here (e.g. an admin page bounced an unauthenticated
    // visitor); otherwise fall back to each role's home.
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? (role === 'admin' ? '/' : '/shop')} replace />
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

  async function handleSendReset(event: FormEvent) {
    event.preventDefault()
    setResetError(null)
    setResetLoading(true)
    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setResetLoading(false)
    if (error) setResetError(error.message)
    else setResetSent(true)
  }

  return (
    <AuthBackdrop>
      <Card className="w-full max-w-sm border-white/40 bg-card/70 shadow-2xl backdrop-blur-xl dark:border-white/10">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Flame className="size-5" aria-hidden="true" />
          </span>
          <CardTitle className="text-lg">Ista Spices</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
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

          {activeMode === 'sign-in' && forgotMode ? (
            <form className="flex flex-col gap-4" onSubmit={handleSendReset}>
              <p className="text-xs text-muted-foreground">
                {resetSent
                  ? "If an admin account uses that email, we've sent a reset link — check your inbox."
                  : "Enter the admin account's email and we'll send a password reset link."}
              </p>
              {!resetSent && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
              {resetError && <p className="text-sm text-destructive">{resetError}</p>}
              {!resetSent && (
                <Button type="submit" className="w-full gap-1.5" disabled={resetLoading}>
                  {resetLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Send reset link
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setForgotMode(false)
                  setResetSent(false)
                  setResetError(null)
                }}
              >
                Back to sign in
              </Button>
            </form>
          ) : activeMode === 'sign-in' ? (
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
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

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Separator className="flex-1" />
                or
                <Separator className="flex-1" />
              </div>

              <GoogleSignInButton />
              <p className="text-center text-xs text-muted-foreground">
                Shopping? Continue with Google — admin sign-in is email and password only.
              </p>
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
    </AuthBackdrop>
  )
}
