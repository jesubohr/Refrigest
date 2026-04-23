'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import type { Reminder } from '@/core/schemas/reminder'
import { isReminderDueSoon } from '@/core/business/reminderDueDate'
import { CalendarClock, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export function TodayAgenda() {
  const reminders = useLiveQuery(async () => {
    const all = await db.reminders.toArray()
    return all
      .filter((r) => !r.delivered_at && isReminderDueSoon(new Date(r.due_at), 7))
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
  }, [])

  if (reminders === undefined) return null // loading

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
        <CalendarClock className="size-10 opacity-40" aria-hidden />
        <p className="text-pretty text-sm">No hay visitas ni alertas próximas.</p>
        <p className="text-xs opacity-70">Los recordatorios aparecen aquí cuando hay servicios o garantías por vencer.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <ReminderCard key={reminder.id} reminder={reminder} />
      ))}
    </div>
  )
}

function ReminderCard({ reminder }: { reminder: Reminder }) {
  const due = new Date(reminder.due_at)
  const isPreventive = reminder.kind === 'preventive_6mo'
  const isOverdue = due < new Date()

  return (
    <Card className="cursor-pointer transition-colors hover:bg-muted/30">
      <CardContent className="flex items-center gap-3 py-3">
        <div
          className={`flex size-9 items-center justify-center rounded-full ${
            isPreventive ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
          }`}
        >
          {isPreventive ? (
            <CalendarClock className="size-4" aria-hidden />
          ) : (
            <ShieldCheck className="size-4" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {isPreventive ? 'Mantenimiento preventivo' : 'Garantía por vencer'}
          </p>
          <p className="text-pretty text-xs text-muted-foreground">
            {format(due, "d 'de' MMMM", { locale: es })}
          </p>
        </div>

        {isOverdue && (
          <Badge variant="destructive" className="shrink-0 text-xs">
            Vencido
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
