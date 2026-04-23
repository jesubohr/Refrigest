'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Next.js App Router error boundary for the (app) route group.
 * Catches runtime errors thrown in any page or layout below it.
 */
export default function AppError({ error, reset }: Props) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden />
      <div>
        <p className="text-balance font-semibold">Algo salió mal</p>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          {error.message ?? 'Error inesperado'}
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={reset}>
        <RefreshCw className="mr-2 size-4" aria-hidden />
        Reintentar
      </Button>
    </div>
  )
}
