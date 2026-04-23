'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertTriangle className="size-10 text-destructive" aria-hidden />
          <div>
            <p className="text-balance font-semibold">Algo salió mal</p>
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              {this.state.error?.message ?? 'Error desconocido'}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            <RefreshCw className="mr-2 size-4" aria-hidden />
            Reintentar
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
