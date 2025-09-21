
"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"

import { DashboardCard } from "@/components/dashboard-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { diagnosePlant, type DiagnosePlantOutput } from "@/ai/flows/diagnose-plant-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { Upload, X, Sparkles, Wand, Leaf, HeartPulse, BrainCircuit, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react"
import { useI18n } from '@/contexts/i18n-context'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const diagnosisSchema = z.object({
  image: z.string().min(1, "Please upload an image."),
  description: z.string().min(1, "Please provide a brief description."),
})

type DiagnosisFormData = z.infer<typeof diagnosisSchema>

export default function CropHealthPage() {
  const { t } = useI18n();
  const { toast } = useToast()
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosePlantOutput | null>(null);

  const form = useForm<DiagnosisFormData>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: { image: "", description: "" },
  })

  const diagnosisMutation = useMutation({
    mutationFn: (data: { photoDataUri: string; description: string }) => diagnosePlant(data),
    onSuccess: (data) => {
      setDiagnosisResult(data);
      toast({
        title: t('diagnosisComplete'),
        description: t('diagnosisResultsBelow'),
      });
    },
    onError: (error) => {
      console.error("Diagnosis failed:", error);
      toast({
        variant: "destructive",
        title: t('diagnosisFailed'),
        description: t('diagnosisError'),
      });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setImagePreview(dataUrl)
        form.setValue("image", dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const removeImage = () => {
    setImagePreview(null);
    form.setValue("image", "");
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }
  
  const resetForm = () => {
    form.reset();
    removeImage();
    setDiagnosisResult(null);
  }

  const onSubmit: SubmitHandler<DiagnosisFormData> = (data) => {
    diagnosisMutation.mutate({
      photoDataUri: data.image,
      description: data.description
    });
  }

  return (
    <DashboardCard
        title={t('cropHealthDiagnosis')}
        description={t('cropHealthDescription')}
    >
        <div className="grid gap-8 md:grid-cols-2">
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label>{t('plantImage')}</Label>
                            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            {imagePreview ? (
                                <div className="relative group">
                                <Image src={imagePreview} alt="Plant preview" width={400} height={300} className="rounded-lg object-cover w-full aspect-[4/3]" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={removeImage}>
                                    <X className="h-4 w-4" />
                                </Button>
                                </div>
                            ) : (
                                <Button type="button" variant="outline" className="w-full h-48 border-dashed flex flex-col items-center justify-center" onClick={() => document.getElementById('image-upload')?.click()}>
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="text-muted-foreground mt-2">{t('uploadAPhoto')}</span>
                                </Button>
                            )}
                            {form.formState.errors.image && <p className="text-sm font-medium text-destructive">{form.formState.errors.image.message}</p>}
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('symptomsDescription')}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={t('symptomsPlaceholder')} {...field} rows={4} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-2">
                            <Button type="submit" className="w-full" disabled={diagnosisMutation.isPending}>
                                {diagnosisMutation.isPending ? <Sparkles className="mr-2 h-4 w-4 animate-pulse" /> : <Wand className="mr-2 h-4 w-4" />}
                                {diagnosisMutation.isPending ? t('diagnosing') : t('diagnosePlant')}
                            </Button>
                             {diagnosisResult && (
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    {t('startNewDiagnosis')}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
            
            <div>
                 <h3 className="text-lg font-semibold mb-4">{t('diagnosisResult')}</h3>
                 <div className="border rounded-lg p-6 min-h-[400px] bg-muted/20">
                     {diagnosisMutation.isPending ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="pt-4 space-y-2">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                     ) : !diagnosisResult ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <BrainCircuit className="h-16 w-16 mb-4" />
                            <p>{t('resultsAppearHere')}</p>
                        </div>
                     ) : (
                        <div className="space-y-6">
                            {!diagnosisResult.identification.isPlant ? (
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-5 w-5" />
                                    <p>{t('notAPlant')}</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <h4 className="font-semibold text-xl flex items-center gap-2">
                                            <Leaf className="h-5 w-5 text-primary" />
                                            {diagnosisResult.identification.commonName}
                                        </h4>
                                        <p className="text-sm text-muted-foreground italic">{diagnosisResult.identification.latinName}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="font-semibold flex items-center gap-2">
                                            <HeartPulse className="h-5 w-5 text-primary" />
                                            {t('healthStatus')}
                                        </h5>
                                        <div className={`flex items-center gap-2 p-3 rounded-md ${diagnosisResult.diagnosis.isHealthy ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                                            {diagnosisResult.diagnosis.isHealthy ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
                                            <p className="text-sm">{diagnosisResult.diagnosis.healthDescription}</p>
                                        </div>
                                    </div>

                                    {!diagnosisResult.diagnosis.isHealthy && (
                                        <>
                                             <div className="space-y-2">
                                                <h5 className="font-semibold flex items-center gap-2">
                                                    <BrainCircuit className="h-5 w-5 text-primary" />
                                                    {t('likelyCause')}
                                                </h5>
                                                <p className="text-sm bg-background p-3 rounded-md">{diagnosisResult.diagnosis.cause}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="font-semibold flex items-center gap-2">
                                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                                    {t('remediationPlan')}
                                                </h5>
                                                <p className="text-sm bg-background p-3 rounded-md whitespace-pre-wrap">{diagnosisResult.diagnosis.remediation}</p>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                     )}
                 </div>
            </div>
        </div>
    </DashboardCard>
  )
}
