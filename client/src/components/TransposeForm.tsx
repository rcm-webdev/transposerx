import { useState } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { transpose, formatRx } from '@/lib/transpose'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const EyeSchema = z.object({
  sphere: z.number(),
  cylinder: z.number(),
  axis: z.number().int().min(1).max(180),
})

const FormSchema = z.object({
  od: EyeSchema,
  os: EyeSchema,
})

type FormValues = z.infer<typeof FormSchema>

interface EyeResult {
  sphere: number
  cylinder: number
  axis: number
}

function EyeFields({
  eye,
  prefix,
  register,
  errors,
  result,
}: {
  eye: string
  prefix: 'od' | 'os'
  register: ReturnType<typeof useForm<FormValues>>['register']
  errors: FieldErrors<FormValues>
  result: EyeResult | null
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{eye}</h3>
      <div className="grid grid-cols-3 gap-2">
        {(['sphere', 'cylinder', 'axis'] as const).map(field => (
          <div key={field} className="space-y-1">
            <Label className="text-xs capitalize">{field}</Label>
            <Input
              type="number"
              step={field === 'axis' ? '1' : '0.25'}
              {...register(`${prefix}.${field}`, { valueAsNumber: true })}
              className="h-9"
            />
            {errors[prefix]?.[field] && (
              <p className="text-xs text-destructive">{errors[prefix][field].message}</p>
            )}
          </div>
        ))}
      </div>
      {result && (
        <div className="bg-muted rounded-md p-3 font-mono text-sm">
          {formatRx(result)}
        </div>
      )}
    </div>
  )
}

export function TransposeForm() {
  const queryClient = useQueryClient()
  const [results, setResults] = useState<{ od: EyeResult | null; os: EyeResult | null }>({
    od: null,
    os: null,
  })
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { od: { sphere: 0, cylinder: -0.25, axis: 180 }, os: { sphere: 0, cylinder: -0.25, axis: 180 } },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.transpositions.createBoth({
        od: { inputSphere: values.od.sphere, inputCylinder: values.od.cylinder, inputAxis: values.od.axis },
        os: { inputSphere: values.os.sphere, inputCylinder: values.os.cylinder, inputAxis: values.os.axis },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  })

  const onSubmit = (values: FormValues) => {
    const odResult = transpose({ sphere: values.od.sphere, cylinder: values.od.cylinder, axis: values.od.axis })
    const osResult = transpose({ sphere: values.os.sphere, cylinder: values.os.cylinder, axis: values.os.axis })
    setResults({ od: odResult, os: osResult })
    mutation.mutate(values)
  }

  const handleCopy = async () => {
    if (!results.od && !results.os) return
    const lines = [
      results.od ? `OD: ${formatRx(results.od)}` : '',
      results.os ? `OS: ${formatRx(results.os)}` : '',
    ].filter(Boolean)
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Prescription Transposition</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <EyeFields eye="OD — Right Eye" prefix="od" register={register} errors={errors} result={results.od} />
          <EyeFields eye="OS — Left Eye" prefix="os" register={register} errors={errors} result={results.os} />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Transpose</Button>
            {(results.od || results.os) && (
              <Button type="button" variant="outline" onClick={handleCopy} aria-label={copied ? 'Copied' : 'Copy to clipboard'}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
