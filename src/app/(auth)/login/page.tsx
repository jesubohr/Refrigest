'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'motion/react'
import { Loader2, Snowflake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const passwordSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

const magicLinkSchema = z.object({
  email: z.string().email('Email inválido'),
})

type PasswordForm = z.infer<typeof passwordSchema>
type MagicLinkForm = z.infer<typeof magicLinkSchema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<'password' | 'magic'>('password')
  const [magicSent, setMagicSent] = useState(false)

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const magicForm = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
  })

  async function onPasswordSubmit(data: PasswordForm) {
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      toast.error(error.message)
      return
    }
    router.push('/today')
    router.refresh()
  }

  async function onMagicSubmit(data: MagicLinkForm) {
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: { emailRedirectTo: `${window.location.origin}/today` },
    })
    if (error) {
      toast.error(error.message)
      return
    }
    setMagicSent(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full max-w-sm"
    >
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Snowflake className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-balance text-xl">Refrigest</CardTitle>
          <CardDescription className="text-pretty">Ingresa a tu cuenta</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="w-full">
              <TabsTrigger value="password" className="flex-1">
                Contraseña
              </TabsTrigger>
              <TabsTrigger value="magic" className="flex-1">
                Magic Link
              </TabsTrigger>
            </TabsList>

            {/* Password tab */}
            <TabsContent value="password">
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="mt-4 space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="pw-email">Email</Label>
                  <Input
                    id="pw-email"
                    type="email"
                    autoComplete="email"
                    placeholder="tecnico@ejemplo.com"
                    {...passwordForm.register('email')}
                  />
                  {passwordForm.formState.errors.email && (
                    <p className="text-destructive text-xs">
                      {passwordForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pw-password">Contraseña</Label>
                  <Input
                    id="pw-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...passwordForm.register('password')}
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="text-destructive text-xs">
                      {passwordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full touch-target"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting && (
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  )}
                  Ingresar
                </Button>
              </form>
            </TabsContent>

            {/* Magic link tab */}
            <TabsContent value="magic">
              {magicSent ? (
                <div className="mt-4 rounded-lg border border-border p-4 text-center text-sm text-pretty text-muted-foreground">
                  ✅ Revisá tu email — enviamos un link de acceso.
                </div>
              ) : (
                <form
                  onSubmit={magicForm.handleSubmit(onMagicSubmit)}
                  className="mt-4 space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="ml-email">Email</Label>
                    <Input
                      id="ml-email"
                      type="email"
                      autoComplete="email"
                      placeholder="tecnico@ejemplo.com"
                      {...magicForm.register('email')}
                    />
                    {magicForm.formState.errors.email && (
                      <p className="text-destructive text-xs">
                        {magicForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full touch-target"
                    disabled={magicForm.formState.isSubmitting}
                  >
                    {magicForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    )}
                    Enviar Magic Link
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
