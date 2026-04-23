import { AppShell } from '@/components/features/shell/AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
