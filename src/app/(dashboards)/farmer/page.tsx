"use client"
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
import { DollarSign, Phone, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { getFarmerData } from "@/ai/flows/farmer-flow"
import type { FarmerData } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"

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
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getFarmerData({ farmerId: "FARM001" })
        setFarmerData(data)
      } catch (error) {
        console.error("Failed to fetch farmer data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load farmer dashboard data.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const showToast = (title: string, description: string) => {
    toast({
        title,
        description,
    });
  };

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
            <Button onClick={() => showToast('Add Product', 'Functionality to add a new product is coming soon!')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Button>
            <Button variant="secondary" onClick={() => showToast('Manage Profile', 'Profile management page is not yet available.')}>Manage Profile</Button>
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
                        <Button variant="outline" size="sm" onClick={() => showToast('Negotiate', `Starting negotiation for ${order.id}`)}>Negotiate</Button>
                        <a href={`tel:${order.phone}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8"><Phone className="h-4 w-4"/></Button>
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
              <TableRow key={payment.id} onClick={() => showToast('View Payment', `Viewing details for payment ${payment.id}`)} className="cursor-pointer">
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
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={marketPrices}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="crop"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
             <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="price" fill="var(--color-price)" radius={4} />
            <Bar dataKey="target" fill="var(--color-target)" radius={4} />
          </BarChart>
        </ChartContainer>
      </DashboardCard>

      <DashboardCard
        title="Microcredit Options"
        description="Access loans to grow your farming business."
      >
        <div className="flex flex-col h-full justify-between">
            <p className="text-muted-foreground mb-4">Get quick and easy access to microloans from our partner institutions with competitive interest rates.</p>
            <Button className="w-full mt-auto" onClick={() => showToast('Loan Application', 'Redirecting to loan application portal...')}>
                <DollarSign className="mr-2 h-4 w-4" />
                Apply for a Loan
            </Button>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Government Schemes"
        description="Stay updated on beneficial government programs."
      >
        <Accordion type="single" collapsible className="w-full">
            {schemes.map(scheme => (
                <AccordionItem value={scheme.name} key={scheme.name}>
                    <AccordionTrigger>{scheme.name}</AccordionTrigger>
                    <AccordionContent>
                        <p className="mb-2">{scheme.description}</p>
                        <p><strong className="font-medium">Eligibility: </strong>{scheme.eligibility}</p>
                        <Button variant="link" className="px-0 h-auto mt-2" onClick={() => showToast('Learn More', `Opening details for ${scheme.name}`)}>Learn More</Button>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </DashboardCard>

    </div>
  )
}
