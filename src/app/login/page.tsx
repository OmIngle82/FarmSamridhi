
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth, type UserRole } from "@/contexts/auth-context"
import { Leaf, LogIn } from "lucide-react"
import { useI18n } from '@/contexts/i18n-context'

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["farmer", "distributor", "retailer", "consumer"]),
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

export default function LoginPage() {
  const router = useRouter()
  const { t } = useI18n();
  const { toast } = useToast()
  const { login, signup } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", role: "farmer" },
  })

  const onLoginSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true)
    const user = await login(data.email, data.password)
    if (user) {
      toast({ title: t('loginSuccessTitle'), description: t('welcomeBack', { name: user.name }) })
      router.push(`/${user.role}`)
    } else {
      toast({ variant: "destructive", title: t('loginFailedTitle'), description: t('invalidCredentials') })
      setIsSubmitting(false)
    }
  }

  const onSignupSubmit: SubmitHandler<SignupFormData> = async (data) => {
    setIsSubmitting(true)
    const user = await signup(data)
    if (user) {
      toast({ title: t('signupSuccessTitle'), description: t('welcomeToFarmSamridhi') })
      router.push(`/${user.role}`)
    } else {
      toast({ variant: "destructive", title: t('signupFailedTitle'), description: t('accountExistsError') })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Tabs defaultValue="login" className="w-[450px]">
        <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2 text-foreground">
                <Leaf className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold font-headline">FarmSamridhi</span>
            </Link>
        </div>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">{t('login')}</TabsTrigger>
          <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>{t('login')}</CardTitle>
              <CardDescription>{t('loginDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('email')}</Label>
                  <Input id="login-email" type="email" placeholder="user@example.com" {...loginForm.register("email")} />
                  {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('password')}</Label>
                  <Input id="login-password" type="password" {...loginForm.register("password")} />
                  {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t('loggingIn') : t('login')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>{t('signUp')}</CardTitle>
              <CardDescription>{t('signupDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{t('fullName')}</Label>
                  <Input id="signup-name" placeholder={t('yourName')} {...signupForm.register("name")} />
                  {signupForm.formState.errors.name && <p className="text-sm text-destructive">{signupForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('email')}</Label>
                  <Input id="signup-email" type="email" placeholder="user@example.com" {...signupForm.register("email")} />
                   {signupForm.formState.errors.email && <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('password')}</Label>
                  <Input id="signup-password" type="password" {...signupForm.register("password")} />
                   {signupForm.formState.errors.password && <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label>{t('iAmA')}</Label>
                    <select {...signupForm.register("role")} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="farmer">{t('roleFarmer')}</option>
                        <option value="distributor">{t('roleDistributor')}</option>
                        <option value="retailer">{t('roleRetailer')}</option>
                        <option value="consumer">{t('roleConsumer')}</option>
                    </select>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                   {isSubmitting ? t('creatingAccount') : t('createAccount')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
