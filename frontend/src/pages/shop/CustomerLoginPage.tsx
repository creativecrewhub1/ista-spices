import { useState, type FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { supabaseAuth } from '@/lib/supabaseAuthClient'

export function CustomerLoginPage() {
  const { session, role, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && session && role === 'customer') return <Navigate to="/shop" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabaseAuth.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/shop` } })
        if (error) throw error
        setMessage(data.session ? 'Account created. Opening the shop...' : 'Check your email to confirm your account, then log in.')
      } else {
        const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
        if (error) throw error
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api/auth/whoami`, {
          headers: { Authorization: `Bearer ${data.session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
        })
        const profile = response.ok ? await response.json() : null
        if (profile?.role !== 'customer') {
          await supabaseAuth.auth.signOut()
          throw new Error('This page is for customer accounts only.')
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to continue. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-stone-50 p-4 text-stone-900">
      <section className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl" aria-label="Customer account">
        <Link to="/shop" className="text-sm text-stone-600">Back to shop</Link>
        <h1 className="mt-6 text-3xl font-semibold">Customer account</h1>
        <div className="mt-6 grid grid-cols-2 rounded-full bg-stone-100 p-1" aria-label="Account mode">
          <button type="button" aria-pressed={mode === 'login'} onClick={() => setMode('login')} className={`rounded-full p-3 ${mode === 'login' ? 'bg-teal-600 text-white' : ''}`}>Log in</button>
          <button type="button" aria-pressed={mode === 'signup'} onClick={() => setMode('signup')} className={`rounded-full p-3 ${mode === 'signup' ? 'bg-teal-600 text-white' : ''}`}>Sign up</button>
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">Email<input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="rounded-xl border border-stone-300 p-3" /></label>
          <label className="grid gap-2 text-sm font-medium">Password<input type="password" required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} className="rounded-xl border border-stone-300 p-3" /></label>
          <button disabled={busy} className="rounded-full bg-stone-900 p-3 text-white disabled:opacity-50">{busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create customer account'}</button>
          {message && <p role="status" className="text-sm">{message}</p>}
        </form>
      </section>
    </main>
  )
}
