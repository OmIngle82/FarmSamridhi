
"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "@/components/dashboard-card"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { getFarmerData } from "@/app/actions/ai-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useI18n } from '@/contexts/i18n-context'

export default function FarmerSchemesPage() {
  const { t } = useI18n();
  const { toast } = useToast()

  const { data: schemes, isLoading: loading, error } = useQuery({
    queryKey: ['farmerData'],
    queryFn: () => getFarmerData({ farmerId: "FARM001" }),
    select: (data) => data.schemes,
  });

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch schemes:", error)
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('schemesError'),
        })
    }
  }, [error, toast, t]);

  return (
    <DashboardCard
      title={t('govtSchemes')}
      description={t('stayUpdatedOnSchemes')}
    >
      {loading ? (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : !schemes || schemes.length === 0 ? (
         <div className="text-center text-muted-foreground py-12">{t('noSchemesAvailable')}</div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
            {schemes.map(scheme => (
                <AccordionItem value={scheme.name} key={scheme.name}>
                    <AccordionTrigger>{scheme.name}</AccordionTrigger>
                    <AccordionContent>
                        <p className="mb-2">{scheme.description}</p>
                        <p><strong className="font-medium">{t('eligibility')}: </strong>{scheme.eligibility}</p>
                        <Button variant="link" className="px-0 h-auto mt-2" asChild>
                           <Link href={`https://www.google.com/search?q=${encodeURIComponent(scheme.name)}`} target="_blank" rel="noopener noreferrer">{t('learnMore')}</Link>
                        </Button>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      )}
    </DashboardCard>
  )
}
