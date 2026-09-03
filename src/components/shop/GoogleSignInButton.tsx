import { Button } from '@/components/ui/button'
import { GoogleIcon } from './GoogleIcon'
import { useAuth } from '@/auth/AuthProvider'
import { cn } from '@/lib/utils'

/** Always lands on the customer home page (/shop) once the OAuth round trip completes — the cart survives in localStorage regardless of where sign-in started. */
export function GoogleSignInButton({ className }: { className?: string }) {
  const { signInWithGoogle } = useAuth()

  return (
    <Button
      type="button"
      variant="outline"
      className={cn('w-full gap-2', className)}
      onClick={() => signInWithGoogle()}
    >
      <GoogleIcon />
      Continue with Google
    </Button>
  )
}
