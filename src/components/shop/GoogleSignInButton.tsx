import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from './GoogleIcon'
import { useAuth } from '@/auth/AuthProvider'
import { cn } from '@/lib/utils'

/** Returns the user to whatever page they clicked this on, once the OAuth round trip completes. */
export function GoogleSignInButton({ className }: { className?: string }) {
  const { signInWithGoogle } = useAuth()
  const location = useLocation()

  return (
    <Button
      type="button"
      variant="outline"
      className={cn('w-full gap-2', className)}
      onClick={() => signInWithGoogle(location.pathname)}
    >
      <GoogleIcon />
      Continue with Google
    </Button>
  )
}
