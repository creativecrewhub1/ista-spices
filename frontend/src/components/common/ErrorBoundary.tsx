import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Without this, one component reading a field the API did not send takes the
 * whole admin panel down to a white page — which is what a missing packSizes
 * did. A fault should cost the screen it happened on, not the application.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // The stack is the only clue left once the screen is replaced.
    console.error('Screen failed to render:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <h2 className="font-display text-lg font-black text-slate-900">This screen didn't load</h2>
        <p className="text-sm text-muted-foreground">
          Something on this page failed to render. The rest of the app is still working — try again,
          or move to another screen.
        </p>
        <p className="max-w-full truncate font-mono text-[11px] text-slate-400">
          {this.state.error.message}
        </p>
        <Button variant="outline" onClick={() => this.setState({ error: null })}>
          Try again
        </Button>
      </div>
    )
  }
}
