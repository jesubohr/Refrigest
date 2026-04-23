'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EquipmentForm } from './EquipmentForm'

interface Props {
  open: boolean
  onOpenChange(open: boolean): void
  branchId: string
}

export function NewEquipmentDialog({ open, onOpenChange, branchId }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Equipo</DialogTitle>
          <DialogDescription className="text-pretty">
            Registrá los datos del equipo de refrigeración.
          </DialogDescription>
        </DialogHeader>
        <EquipmentForm
          branchId={branchId}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
