import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { signIn } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email({ message: 'Please enter a valid email address' }),
  password: z.string().trim().min(8, 'Password must be at least 8 characters'),
})
type FormValues = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    const result = await signIn.email({ email: values.email, password: values.password })
    if (result.error) {
      toast.error(result.error.message || 'Invalid credentials')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your credentials to access TransposerX</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitting ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Sign in
              </Button>
            </form>
          )}
          <p className="text-sm text-center text-muted-foreground mt-4">
            No account?{' '}
            <Link to="/register" className="underline underline-offset-4">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
