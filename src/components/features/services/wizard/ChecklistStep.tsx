'use client'

import { useForm } from 'react-hook-form'
import { Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useServiceDraft } from '@/hooks/useServiceDraft'
import type { Checklist } from '@/core/schemas/service'

const VISUAL_ITEMS = [
  { id: 'condenser_clean', label: 'Condensador limpio' },
  { id: 'evaporator_clean', label: 'Evaporador limpio' },
  { id: 'filters_clean', label: 'Filtros limpios' },
  { id: 'no_oil_leaks', label: 'Sin pérdidas de aceite' },
  { id: 'connections_tight', label: 'Conexiones eléctricas firmes' },
  { id: 'no_ice', label: 'Sin formación de hielo' },
]

export function ChecklistStep() {
  const { setChecklist, setStep } = useServiceDraft()

  const form = useForm<{
    visual: Record<string, boolean>
    high_side_psi: string
    low_side_psi: string
    amperage_a: string
    voltage_v: string
    supply_c: string
    return_c: string
  }>({
    defaultValues: {
      visual: {},
      high_side_psi: '',
      low_side_psi: '',
      amperage_a: '',
      voltage_v: '',
      supply_c: '',
      return_c: '',
    },
  })

  type FormData = {
    visual: Record<string, boolean>
    high_side_psi: string
    low_side_psi: string
    amperage_a: string
    voltage_v: string
    supply_c: string
    return_c: string
  }

  function onSubmit(data: FormData) {
    const checklist: Partial<Checklist> = {
      visual_inspection: VISUAL_ITEMS.map((item) => ({
        id: item.id,
        label: item.label,
        checked: data.visual[item.id] ?? false,
      })),
      pressures: {
        high_side_psi: data.high_side_psi ? parseFloat(data.high_side_psi) : null,
        low_side_psi: data.low_side_psi ? parseFloat(data.low_side_psi) : null,
      },
      electrical: {
        amperage_a: data.amperage_a ? parseFloat(data.amperage_a) : null,
        voltage_v: data.voltage_v ? parseFloat(data.voltage_v) : null,
      },
      temperatures: {
        supply_c: data.supply_c ? parseFloat(data.supply_c) : null,
        return_c: data.return_c ? parseFloat(data.return_c) : null,
      },
      custom_items: [],
    }

    setChecklist(checklist)
    setStep(4)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="mb-1 text-balance text-base font-semibold">Checklist + Lecturas</h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Completá las lecturas de presiones, corriente y temperatura.
        </p>
      </div>

      {/* Pressures */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Gauge className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium">Presiones</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="high_side_psi" className="text-xs">
              Alta (psi)
            </Label>
            <Input
              id="high_side_psi"
              type="number"
              inputMode="decimal"
              placeholder="0"
              className="tabular"
              {...form.register('high_side_psi')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="low_side_psi" className="text-xs">
              Baja (psi)
            </Label>
            <Input
              id="low_side_psi"
              type="number"
              inputMode="decimal"
              placeholder="0"
              className="tabular"
              {...form.register('low_side_psi')}
            />
          </div>
        </div>
      </div>

      {/* Electrical */}
      <div className="space-y-3">
        <span className="text-sm font-medium">Eléctrico</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="amperage_a" className="text-xs">
              Amperaje (A)
            </Label>
            <Input
              id="amperage_a"
              type="number"
              inputMode="decimal"
              placeholder="0"
              className="tabular"
              {...form.register('amperage_a')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="voltage_v" className="text-xs">
              Voltaje (V)
            </Label>
            <Input
              id="voltage_v"
              type="number"
              inputMode="decimal"
              placeholder="0"
              className="tabular"
              {...form.register('voltage_v')}
            />
          </div>
        </div>
      </div>

      {/* Temperatures */}
      <div className="space-y-3">
        <span className="text-sm font-medium">Temperaturas</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="supply_c" className="text-xs">
              Impulsión (°C)
            </Label>
            <Input
              id="supply_c"
              type="number"
              inputMode="decimal"
              placeholder="0"
              className="tabular"
              {...form.register('supply_c')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="return_c" className="text-xs">
              Retorno (°C)
            </Label>
            <Input
              id="return_c"
              type="number"
              inputMode="decimal"
              placeholder="0"
              className="tabular"
              {...form.register('return_c')}
            />
          </div>
        </div>
      </div>

      {/* Visual inspection */}
      <div className="space-y-3">
        <span className="text-sm font-medium">Inspección Visual</span>
        <div className="space-y-2.5">
          {VISUAL_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5">
              <Checkbox
                id={item.id}
                onCheckedChange={(checked) => {
                  form.setValue(`visual.${item.id}`, !!checked)
                }}
              />
              <Label htmlFor={item.id} className="cursor-pointer font-normal text-sm">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full touch-target">
        Continuar
      </Button>
    </form>
  )
}
