export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-dvh items-center justify-center bg-background px-4">
      {children}
    </main>
  )
}
