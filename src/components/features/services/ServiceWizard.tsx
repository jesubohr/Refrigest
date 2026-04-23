'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useServiceDraft } from '@/hooks/useServiceDraft'
import { ClientStep } from './wizard/ClientStep'
import { BranchStep } from './wizard/BranchStep'
import { EquipmentStep } from './wizard/EquipmentStep'
import { ChecklistStep } from './wizard/ChecklistStep'
import { PhotoStep } from './wizard/PhotoStep'
import { VoiceNoteStep } from './wizard/VoiceNoteStep'
import { PartsStep } from './wizard/PartsStep'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

const STEPS = [
  'Cliente',
  'Sucursal',
  'Equipo',
  'Checklist',
  'Fotos',
  'Nota de Voz',
  'Partes',
] as const

export function ServiceWizard() {
  const { currentStep, setStep } = useServiceDraft()

  const stepComponents = [
    <ClientStep key="client" />,
    <BranchStep key="branch" />,
    <EquipmentStep key="equipment" />,
    <ChecklistStep key="checklist" />,
    <PhotoStep key="photo" />,
    <VoiceNoteStep key="voice" />,
    <PartsStep key="parts" />,
  ]

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Paso {currentStep + 1} de {STEPS.length}
          </span>
          <span className="font-medium">{STEPS[currentStep]}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Back button */}
      {currentStep > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => setStep(currentStep - 1)}
        >
          <ChevronLeft className="mr-1 size-4" aria-hidden />
          Atrás
        </Button>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {stepComponents[currentStep]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
