import type { ReactNode } from 'react'

/**
 * Full-screen ambient backdrop for a dedicated auth moment (login) — three
 * large blurred color orbs in the brand's chili/turmeric/accent hues sit
 * behind a frosted glass card. Reserved for standalone auth screens; embedded
 * sign-in prompts (checkout, my-orders) use a lighter glass-card treatment
 * instead so they don't compete with the rest of the page.
 */
export function AuthBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-background px-4">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -right-24 top-1/3 size-96 rounded-full bg-warning/35 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-96 rounded-full bg-accent/25 blur-3xl" />
      </div>
      {children}
    </div>
  )
}
