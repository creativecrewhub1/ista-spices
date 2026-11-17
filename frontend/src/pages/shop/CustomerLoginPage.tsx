import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Flame, Loader2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { supabaseAuth } from '@/lib/supabaseAuthClient'
import { api } from '@/lib/apiClient'
import { GoogleSignInButton } from '@/components/shop/GoogleSignInButton'

export function CustomerLoginPage() {
  const { session, role, loading } = useAuth()
  const location = useLocation()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from
  if (!loading && session && role === 'customer') return <Navigate to={from?.startsWith('/shop/') ? from : '/shop'} replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabaseAuth.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/shop` } })
        if (error) throw error
        setMessage(data.session ? 'Welcome to ISTA. Opening the shop...' : 'Check your inbox to confirm your email, then log in.')
      } else {
        const { error } = await supabaseAuth.auth.signInWithPassword({ email, password })
        if (error) throw error
        const profile = await api.get<{ role: string }>('/auth/whoami')
        if (profile.role !== 'customer') {
          await supabaseAuth.auth.signOut()
          throw new Error('This login is for customer accounts only.')
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to continue. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'h-11 w-full rounded-full border border-[#f0d5b5] bg-[#e8effc] px-4 text-sm text-[#2b1b12] outline-none transition-colors focus:border-[#e85d19] focus:ring-2 focus:ring-[#e85d19]/20'

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#fffaf3] px-4 py-10 font-sans text-[#2b1b12] sm:px-6">
      <section className="w-full max-w-[480px] rounded-[26px] border border-[#eadccc] bg-white/90 p-5 shadow-[0_24px_55px_rgba(91,59,29,0.2)] sm:p-7" aria-label="Customer account">
        <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#ef580c] text-white shadow-lg shadow-[#ef580c]/25" aria-hidden="true"><Flame size={24} /></span>
        <header className="mb-7 text-center">
          <h1 className="font-display text-2xl font-medium">Ista Spices</h1>
          <p className="mt-1 text-base text-[#906e57]">{mode === 'login' ? 'Sign in to your account' : 'Create your customer account'}</p>
        </header>

        <div className="mb-6 grid grid-cols-2 rounded-full bg-[#fff1e0] p-1" aria-label="Account mode">
          {(['login', 'signup'] as const).map(value => (
            <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setMessage('') }} className={`min-h-10 rounded-full text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef580c] ${mode === value ? 'bg-[#ef580c] text-white' : 'text-[#8b6a53] hover:text-[#2b1b12]'}`}>{value === 'login' ? 'Log in' : 'Sign up'}</button>
          ))}
        </div>

        <form onSubmit={submit} className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold">Email<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className={inputClass} /></label>
          <label className="grid gap-2 text-sm font-semibold">Password
            <span className="relative block"><input type={visible ? 'text' : 'password'} required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} className={`${inputClass} pr-12`} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-1 flex w-11 items-center justify-center text-[#6e5849] focus-visible:outline-2 focus-visible:outline-[#ef580c]">{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></span>
          </label>
          <button disabled={busy} className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#ef580c] font-semibold text-white transition-colors hover:bg-[#d44c09] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef580c] disabled:opacity-60">{busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          {message && <p role="status" className="text-center text-sm text-[#a53e19]">{message}</p>}
        </form>

        <div className="my-6 flex items-center gap-4 text-sm text-[#906e57] before:h-px before:flex-1 before:bg-[#f0d5b5] after:h-px after:flex-1 after:bg-[#f0d5b5]">or</div>
        <GoogleSignInButton className="h-11 rounded-full border-[#f0d5b5] bg-transparent font-semibold text-[#2b1b12] hover:bg-[#fff1e0]" />
        <p className="mt-5 text-center text-xs leading-5 text-[#906e57]">Continue with Google or use your customer email account.</p>
      </section>
    </main>
  )
}
