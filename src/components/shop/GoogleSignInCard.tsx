import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from './GoogleIcon'
import { useAuth } from '@/auth/AuthProvider'

interface GoogleSignInCardProps {
  title: string
  description?: string
}

/** Shared "sign in with Google" prompt used at checkout and on the orders page — same card, same copy pattern. */
export function GoogleSignInCard({ title, description }: GoogleSignInCardProps) {
  const { signInWithGoogle } = useAuth()

  return (
    <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/10 shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? <p className="mb-4 text-sm text-muted-foreground">{description}</p> : null}
        <Button variant="outline" className="w-full gap-2" onClick={() => signInWithGoogle()}>
          <GoogleIcon />
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  )
}
