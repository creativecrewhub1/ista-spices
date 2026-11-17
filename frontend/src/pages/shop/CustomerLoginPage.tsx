import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
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

  const inputClass = 'h-12 w-full rounded-full border border-[#d8aa80] bg-[#fffaf5] px-5 text-sm text-[#2b1b12] outline-none transition-colors focus:border-[#d75a17] focus:ring-2 focus:ring-[#d75a17]/20'

  return (
    <main className="flex min-h-svh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_15%_15%,#f5dfc6,transparent_35%),radial-gradient(circle_at_85%_90%,#f2d6bc,transparent_32%),#fff9f1] px-4 py-6 font-sans text-[#2b1b12] sm:px-8 sm:py-12">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-[#eed9c6] bg-[#fbf0e4] shadow-[0_26px_70px_rgba(91,59,29,0.18)] lg:min-h-[700px] lg:grid-cols-[0.95fr_1.05fr]" aria-label="Customer account">
        <div className="relative min-h-[200px] overflow-hidden bg-[#e9ba92] sm:min-h-[280px] lg:min-h-full" aria-hidden="true">
          <div className="absolute inset-y-0 left-[27%] w-[45%] bg-[#e6a975]/45" />
          <div className="absolute -left-20 top-0 size-72 rounded-full border border-[#a06037]/20 sm:size-96" />
          <img src="/images/spicest/hero_spices.png" alt="" className="absolute left-[-9%] top-[-25%] h-[150%] w-[115%] object-contain drop-shadow-[0_20px_25px_rgba(73,36,15,0.22)] sm:left-[-5%] lg:left-[-10%] lg:top-[-10%] lg:h-[120%] lg:w-[120%]" />
          <img src="/images/spicest/star_anise_float.png" alt="" className="absolute bottom-[-12%] right-[-8%] w-32 rotate-[-20deg] drop-shadow-xl sm:w-44 lg:w-52" />
        </div>
        <div className="flex flex-col px-6 pb-8 pt-6 sm:px-12 sm:pb-12 sm:pt-9 lg:px-14 xl:px-20">
          <header className="flex items-center justify-between gap-4">
            <span className="font-display text-3xl font-bold tracking-wide text-[#d85818]">ISTA</span>
            <span className="text-xs font-medium text-[#886a58] sm:text-sm">A world of flavour awaits.</span>
          </header>
          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-10 sm:py-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#b85a21]">Welcome to ISTA</p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-[#422719] sm:text-5xl">{mode === 'login' ? 'Craving something good?' : 'Come on in.'}</h1>
            <p className="mb-7 mt-4 text-base text-[#806653]">{mode === 'login' ? 'Sign in for the flavours you love.' : 'Create an account and start exploring.'}</p>

        <div className="mb-6 grid grid-cols-2 rounded-full bg-[#edddcc] p-1" aria-label="Account mode">
          {(['login', 'signup'] as const).map(value => (
            <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setMessage('') }} className={`min-h-11 rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d85818] ${mode === value ? 'bg-[#d85818] text-white shadow-sm' : 'text-[#715642] hover:text-[#2b1b12]'}`}>{value === 'login' ? 'Log in' : 'Sign up'}</button>
          ))}
        </div>

        <form onSubmit={submit} className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold">Email<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className={inputClass} /></label>
          <label className="grid gap-2 text-sm font-semibold">Password
            <span className="relative block"><input type={visible ? 'text' : 'password'} required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} className={`${inputClass} pr-12`} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-1 flex w-11 items-center justify-center text-[#6e5849] focus-visible:outline-2 focus-visible:outline-[#ef580c]">{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></span>
          </label>
          <button disabled={busy} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,#c94c0d,#ed802d)] font-semibold text-white shadow-[0_8px_18px_rgba(197,79,15,0.2)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d85818] disabled:opacity-60">{busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          {message && <p role="status" className="text-center text-sm text-[#a53e19]">{message}</p>}
        </form>

            <div className="my-6 flex items-center gap-4 text-sm text-[#906e57] before:h-px before:flex-1 before:bg-[#d9b99d] after:h-px after:flex-1 after:bg-[#d9b99d]">or</div>
            <GoogleSignInButton className="h-12 rounded-full border-[#d8aa80] bg-transparent font-semibold text-[#2b1b12] hover:bg-white/70" />
            <p className="mt-5 text-center text-xs leading-5 text-[#906e57]">Your next favourite flavour is one sign in away.</p>
          </div>
          <p className="border-t border-[#e4cbb4] pt-4 text-center text-xs text-[#987965]">Made for good food and good company.</p>
        </div>
      </section>
    </main>
  )
}
