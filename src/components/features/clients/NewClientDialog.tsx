'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ClientForm } from './ClientForm'

interface NewClientDialogProps {
  open: boolean
  onOpenChange(open: boolean): void
}

export function NewClientDialog({ open, onOpenChange }: NewClientDialogProps) {
  const router = useRouter()

  function handleSuccess(wa: string) {
    onOpenChange(false)
    router.push(`/clients/${encodeURIComponent(wa)}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
          <DialogDescription className="text-pretty">
            El número de WhatsApp es el identificador único del cliente.
          </DialogDescription>
        </DialogHeader>
        <ClientForm onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
