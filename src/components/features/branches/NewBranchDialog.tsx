'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BranchForm } from './BranchForm'

interface Props {
  open: boolean
  onOpenChange(open: boolean): void
  clientWa: string
}

export function NewBranchDialog({ open, onOpenChange, clientWa }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva Sucursal</DialogTitle>
          <DialogDescription className="text-pretty">
            Agregá una ubicación donde el cliente tiene equipos.
          </DialogDescription>
        </DialogHeader>
        <BranchForm
          clientWa={clientWa}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
