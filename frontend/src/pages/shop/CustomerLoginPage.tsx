import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { supabaseAuth } from '@/lib/supabaseAuthClient'
import { api } from '@/lib/apiClient'

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

  return (
    <main className="grid min-h-svh bg-[#f7f2ea] text-[#271b15] lg:grid-cols-[minmax(0,1fr)_minmax(450px,0.86fr)]">
      <section className="relative hidden min-h-svh overflow-hidden bg-[#23160f] lg:block" aria-label="ISTA spices">
        <img src="/images/spicest/hero_desi_masale_bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b0f09]/90 via-[#1b0f09]/25 to-[#1b0f09]/20" />
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <span className="font-display text-4xl font-bold tracking-wide text-white">ISTA</span>
          <div className="max-w-lg text-white">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">From our kitchen to yours</p>
            <h2 className="font-display text-5xl leading-tight xl:text-6xl">A little spice makes everything better.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/80">Discover authentic flavours, thoughtfully crafted and delivered to your door.</p>
          </div>
        </div>
      </section>
      <section className="flex min-h-svh flex-col px-5 py-6 sm:px-12 lg:px-14 xl:px-24">
        <header className="flex items-center justify-between gap-4">
          <span className="font-display text-3xl font-bold tracking-wide text-[#e85d19] lg:hidden">ISTA</span>
          <span className="hidden lg:block" />
          <span className="text-sm text-[#7d7067]">A world of flavour awaits.</span>
        </header>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-14">
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-[#d85618]">Welcome to ISTA</p>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{mode === 'login' ? 'Good to have you back.' : 'Join the table.'}</h1>
            <p className="mt-4 text-sm leading-6 text-[#776a61]">{mode === 'login' ? 'Sign in to explore your favourites and continue shopping.' : 'Create your customer account and start exploring.'}</p>
          </div>
          <div className="mb-8 grid grid-cols-2 rounded-full bg-[#ece4d9] p-1" aria-label="Account mode">
            {(['login', 'signup'] as const).map(value => (
              <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setMessage('') }} className={`min-h-11 rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e85d19] ${mode === value ? 'bg-[#e85d19] text-white shadow-sm' : 'text-[#695b51] hover:text-[#271b15]'}`}>{value === 'login' ? 'Log in' : 'Sign up'}</button>
            ))}
          </div>
          <form onSubmit={submit} className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold">Email address<input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} className="h-13 rounded-xl border border-[#d9cfc3] bg-white px-4 font-normal outline-none transition-colors placeholder:text-[#aaa099] focus:border-[#e85d19] focus:ring-2 focus:ring-[#e85d19]/15" /></label>
            <label className="grid gap-2 text-sm font-semibold">Password<span className="relative block"><input type={visible ? 'text' : 'password'} required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder="Enter your password" value={password} onChange={event => setPassword(event.target.value)} className="h-13 w-full rounded-xl border border-[#d9cfc3] bg-white px-4 pr-12 font-normal outline-none transition-colors placeholder:text-[#aaa099] focus:border-[#e85d19] focus:ring-2 focus:ring-[#e85d19]/15" /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#82766d] hover:text-[#e85d19]">{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
            <button disabled={busy} className="mt-2 flex h-13 items-center justify-center gap-2 rounded-full bg-[#e85d19] px-6 font-semibold text-white transition-colors hover:bg-[#cb4c11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e85d19] disabled:opacity-60">{busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'} {!busy && <ArrowRight size={18} aria-hidden="true" />}</button>
            {message && <p role="status" className="text-sm text-[#a63b15]">{message}</p>}
          </form>
          <p className="mt-8 text-center text-xs leading-5 text-[#8a7b70]">By continuing, you agree to shop with ISTA.</p>
        </div>
        <footer className="flex justify-between gap-4 border-t border-[#e6dbcf] pt-5 text-xs text-[#8a7b70]"><span>ISTA Spices</span><Link to="/login" className="hover:text-[#e85d19]">Staff sign in</Link></footer>
      </section>
    </main>
  )
}
