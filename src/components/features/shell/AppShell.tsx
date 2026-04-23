'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarClock,
  Users,
  ShieldCheck,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SyncStatusBar } from './SyncStatusBar'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { href: '/today', label: 'Hoy', icon: CalendarClock },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/warranties', label: 'Garantías', icon: ShieldCheck },
  { href: '/inventory', label: 'Inventario', icon: Package },
]

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors touch-target',
        'min-w-[56px] rounded-lg',
        active
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="size-5" aria-hidden />
      <span>{label}</span>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-dvh flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border md:bg-sidebar">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <span className="font-semibold text-sidebar-foreground">Refrigest</span>
          <ThemeToggle className="ml-auto" />
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors touch-target',
                pathname.startsWith(item.href)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
              aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <SyncStatusBar />
        <main className="flex-1 overflow-auto">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="safe-bottom flex items-center justify-around border-t border-border bg-background pb-0 md:hidden">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </nav>
      </div>
    </div>
  )
}
