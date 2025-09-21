
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
import { DollarSign, MessageCircle, Phone, PlusCircle } from "lucide-react"

const chartData = [
  { crop: "Wheat", price: 2150, target: 2200 },
  { crop: "Tomato", price: 1800, target: 2000 },
  { crop: "Potato", price: 2300, target: 2250 },
  { crop: "Onion", price: 2500, target: 2600 },
  { crop: "Paddy", price: 2040, target: 2100 },
]

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

const orders = [
  { id: "ORD001", customer: "BigBasket", amount: "₹12,500", status: "Pending" },
  { id: "ORD002", customer: "Local Mandi", amount: "₹8,200", status: "Shipped" },
  { id: "ORD003", customer: "Reliance Fresh", amount: "₹25,000", status: "Pending" },
]

const payments = [
    {id: "PAY001", from: "BigBasket", amount: "₹12,500", date: "2024-07-20"},
    {id: "PAY002", from: "Govt. Subsidy", amount: "₹5,000", date: "2024-07-18"},
    {id: "PAY003", from: "Local Mandi", amount: "₹8,200", date: "2024-07-15"},
]

const schemes = [
    {
        name: "PM-KISAN Scheme",
        description: "Income support of ₹6,000/year for all landholding farmer families.",
        eligibility: "All landholding farmer families."
    },
    {
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        description: "Insurance coverage and financial support to farmers in the event of failure of any of the notified crops as a result of natural calamities, pests & diseases.",
        eligibility: "All farmers including sharecroppers and tenant farmers growing notified crops in the notified areas are eligible for coverage."
    },
    {
        name: "Kisan Credit Card (KCC) Scheme",
        description: "Provides farmers with timely access to credit for their cultivation needs as well as for non-farm activities.",
        eligibility: "All farmers - individuals/joint borrowers who are owner cultivators."
    }
]

export default function FarmerDashboard() {
  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        title="Quick Actions"
        className="xl:col-span-4"
      >
        <div className="flex gap-4">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Button>
            <Button variant="secondary">Manage Profile</Button>
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
                <TableCell>{order.amount}</TableCell>
                <TableCell>
                  <Badge variant={order.status === "Pending" ? "destructive" : "secondary"}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm">Negotiate</Button>
                        <Button variant="outline" size="icon" className="h-8 w-8"><Phone className="h-4 w-4"/></Button>
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
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.from}</TableCell>
                <TableCell>{payment.amount}</TableCell>
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
          <BarChart accessibilityLayer data={chartData}>
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
            <Button className="w-full mt-auto">
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
                        <Button variant="link" className="px-0 h-auto mt-2">Learn More</Button>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </DashboardCard>

    </div>
  )
}
