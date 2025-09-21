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
import { getFarmerData } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"

const chartConfig = {
  price: {
    label: "Current MSP (₹/quintal)",
    color: "hsl(var(--chart-1))",
  },
  target: {
    label: "Target Price (₹/quintal)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function FarmerMarketPage() {
  const { toast } = useToast()

  const { data: marketPrices, isLoading: loading, error } = useQuery({
    queryKey: ['marketPrices'],
    queryFn: async () => {
        const data = await getFarmerData({ farmerId: "FARM001" });
        return data.marketPrices;
    }
  });

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch market prices:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load market prices.",
        })
    }
  }, [error, toast]);


  return (
    <DashboardCard
      title="Live Market Prices (MSP)"
      description="Current Minimum Support Prices for key crops across the market."
    >
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : !marketPrices || marketPrices.length === 0 ? (
         <div className="text-center text-muted-foreground">No market data available.</div>
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
