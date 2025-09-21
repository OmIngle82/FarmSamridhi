"use client"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import type { ChartConfig } from "@/components/ui/chart"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

import { DashboardCard } from "@/components/dashboard-card"
import { DollarSign, MessageSquare, Phone, PlusCircle } from "lucide-react"
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

export default function FarmerDashboard() {
  const { toast } = useToast()

  const { data: farmerData, isLoading: loading, error } = useQuery({
      queryKey: ['farmerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" })
  });

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch farmer data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load farmer dashboard data.",
        })
    }
  }, [error, toast]);


  if (loading) {
    return (
        <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
            <DashboardCard title="Quick Actions" className="xl:col-span-4">
                 <div className="flex gap-4">
                    <Skeleton className="h-10 w-44" />
                    <Skeleton className="h-10 w-36" />
                </div>
            </DashboardCard>
            <DashboardCard title="Pending Orders" className="lg:col-span-2">
                <Skeleton className="h-40 w-full" />
            </DashboardCard>
            <DashboardCard title="Recent Payments" className="lg:col-span-2">
                <Skeleton className="h-40 w-full" />
            </DashboardCard>
            <DashboardCard title="Live Market Prices (MSP)" className="xl:col-span-2">
                 <Skeleton className="h-56 w-full" />
            </DashboardCard>
            <DashboardCard title="Microcredit Options">
                <Skeleton className="h-32 w-full" />
            </DashboardCard>
             <DashboardCard title="Government Schemes">
                <Skeleton className="h-32 w-full" />
            </DashboardCard>
        </div>
    )
  }

  if (!farmerData) {
    return <div className="text-center">No data available for this farmer.</div>
  }

  const { orders, payments, marketPrices, schemes } = farmerData

  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        title="Quick Actions"
        className="xl:col-span-4"
      >
        <div className="flex gap-4">
            <Button asChild>
                <Link href="/farmer/products">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
                </Link>
            </Button>
            <Button variant="secondary" asChild>
                <Link href="/farmer/profile">Manage Profile</Link>
            </Button>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Pending Orders"
        description="Orders that require your attention."
        className="lg:col-span-2"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={order.status === "Pending" ? "destructive" : "secondary"}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/farmer/negotiate?orderId=${order.id}`}><MessageSquare className="mr-2 h-4 w-4" />Negotiate</Link>
                        </Button>
                        <a href={`tel:${order.phone}`}>
                          <Button variant="outline" size="icon" className="h-9 w-9"><Phone className="h-4 w-4"/></Button>
                        </a>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardCard>
      
      <DashboardCard
        title="Recent Payments"
        description="Latest transactions to your account."
        className="lg:col-span-2"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} onClick={() => toast({title: 'View Payment', description:`Viewing details for payment ${payment.id}`})} className="cursor-pointer">
                <TableCell className="font-medium">{payment.from}</TableCell>
                <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">{payment.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardCard>

      <DashboardCard
        title="Live Market Prices (MSP)"
        description="Current Minimum Support Prices for key crops."
        className="xl:col-span-2"
      >
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart accessibilityLayer data={marketPrices.slice(0, 5)}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="crop" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis hide/>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="price" fill="var(--color-price)" radius={4} />
            </BarChart>
        </ChartContainer>
      </DashboardCard>

      <DashboardCard
        title="Microcredit Options"
        description="Explore available financing options."
        className="xl:col-span-1"
       >
        <div className="flex flex-col h-full justify-between">
            <div>
                <h3 className="font-semibold text-lg">Agri-Loan Express</h3>
                <p className="text-muted-foreground text-sm mt-1">Get quick loans up to ₹50,000 with minimal paperwork. Competitive interest rates.</p>
            </div>
            <Button className="mt-4" onClick={() => toast({title: 'Apply Now', description: 'Feature coming soon!'})}>
                <DollarSign className="mr-2 h-4 w-4" /> Apply Now
            </Button>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Government Schemes"
        description="Beneficial programs for farmers."
        className="xl:col-span-1"
      >
        <Accordion type="single" collapsible className="w-full">
            {schemes.slice(0, 1).map(scheme => (
                <AccordionItem value={scheme.name} key={scheme.name}>
                    <AccordionTrigger>{scheme.name}</AccordionTrigger>
                    <AccordionContent>
                        <p className="mb-2 text-sm">{scheme.description}</p>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
         <Button variant="link" className="px-0 h-auto mt-2" asChild>
            <Link href="/farmer/schemes">View all schemes</Link>
        </Button>
      </DashboardCard>

    </div>
  )
}
