
"use client"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import type { ChartConfig } from "@/components/ui/chart"
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart"
import { DashboardCard } from "@/components/dashboard-card"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { getFarmerData } from "@/app/actions/ai-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useI18n } from '@/contexts/i18n-context'

export default function FarmerMarketPage() {
  const { t } = useI18n();
  const { toast } = useToast()

  const chartConfig = {
    price: {
      label: t('currentMSP'),
      color: "hsl(var(--chart-1))",
    },
    target: {
      label: t('targetPrice'),
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  const { data: marketPrices, isLoading: loading, error } = useQuery({
    queryKey: ['farmerData'],
    queryFn: () => getFarmerData({ farmerId: "FARM001" }),
    select: (data) => data.marketPrices,
  });

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch market prices:", error)
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('marketPricesError'),
        })
    }
  }, [error, toast, t]);


  return (
    <DashboardCard
      title={t('liveMarketPrices')}
      description={t('currentMSPsForCrops')}
    >
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : !marketPrices || marketPrices.length === 0 ? (
         <div className="text-center text-muted-foreground py-12">{t('noMarketData')}</div>
      ) : (
        <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
          <BarChart accessibilityLayer data={marketPrices}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="crop"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
             <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            <Bar dataKey="price" fill="var(--color-price)" radius={4} />
            <Bar dataKey="target" fill="var(--color-target)" radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </DashboardCard>
  )
}
