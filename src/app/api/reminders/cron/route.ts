import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import webpush from 'web-push'

/**
 * GET /api/reminders/cron
 * Runs hourly via Vercel Cron.
 * Finds due reminders and dispatches Web Push notifications.
 *
 * Vercel Cron config in vercel.json:
 * { "crons": [{ "path": "/api/reminders/cron", "schedule": "0 * * * *" }] }
 */
export async function GET(req: NextRequest) {
  // Verify Vercel Cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Find reminders due within the next hour, not yet delivered
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*, equipment:equipment_id(brand, model)')
    .lte('due_at', oneHourFromNow.toISOString())
    .is('delivered_at', null)
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!reminders?.length) {
    return NextResponse.json({ ok: true, dispatched: 0 })
  }

  // Setup web-push
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  let dispatched = 0

  for (const reminder of reminders) {
    // Get tech push subscription
    const { data: authUser } = await supabase.auth.admin.getUserById(reminder.tech_id)
    const sub = authUser?.user?.user_metadata?.push_subscription

    if (!sub) continue

    try {
      const subscription = JSON.parse(sub) as webpush.PushSubscription

      const kindLabel =
        reminder.kind === 'preventive_6mo' ? 'Mantenimiento Preventivo' : 'Garantía por Vencer'
      const eqName =
        reminder.equipment
          ? `${reminder.equipment.brand} ${reminder.equipment.model ?? ''}`.trim()
          : 'Equipo'

      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: `Refrigest — ${kindLabel}`,
          body: `${eqName} — Recordatorio programado`,
          icon: '/icons/192.png',
          badge: '/icons/192.png',
        })
      )

      // Mark as delivered
      await supabase
        .from('reminders')
        .update({ delivered_at: new Date().toISOString() })
        .eq('id', reminder.id)

      dispatched++
    } catch (err) {
      console.error(`[cron] Failed to push notification for reminder ${reminder.id}:`, err)
    }
  }

  return NextResponse.json({ ok: true, dispatched })
}
