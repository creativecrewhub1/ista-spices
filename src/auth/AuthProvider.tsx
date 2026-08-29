import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabaseAuth } from '@/lib/supabaseAuthClient'
import { api } from '@/lib/apiClient'

export type UserRole = 'admin' | 'customer'

interface AuthContextValue {
  session: Session | null
  user: User | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Role isn't in the Supabase session itself — it lives in our own
    // `profiles` table, so every session change needs one round trip to
    // /auth/whoami to learn it (this is also what tells the frontend apart
    // an admin from a Google-signed-in customer). Session and role are set
    // together, only once role resolves — setting `session` first would let
    // ProtectedRoute see a truthy session with a stale/null `role` for one
    // render and permanently redirect a fresh admin login to /shop before
    // the real role ever arrives.
    async function sync(newSession: Session | null) {
      if (!newSession) {
        setSession(null)
        setRole(null)
        return
      }
      let resolvedRole: UserRole | null = null
      try {
        const whoami = await api.get<{ email: string; role: UserRole }>('/auth/whoami')
        resolvedRole = whoami.role
      } catch {
        resolvedRole = null
      }
      setRole(resolvedRole)
      setSession(newSession)
    }

    supabaseAuth.auth.getSession().then(async ({ data }) => {
      await sync(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange((_event, newSession) => {
      sync(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    role,
    loading,
    signOut: async () => {
      await supabaseAuth.auth.signOut()
    },
    signInWithGoogle: async () => {
      // Google only ever produces role='customer' (see the DB trigger) —
      // always land back on the storefront, never the admin panel.
      await supabaseAuth.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/shop` },
      })
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
