"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "@/components/dashboard-card"
import { DollarSign, Download, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { getFarmerData } from "@/ai/flows/farmer-flow"
import type { FarmerData } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"

export default function FarmerFinancesPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<FarmerData['payments'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getFarmerData({ farmerId: "FARM001" })
        setPayments(data.payments)
      } catch (error) {
        console.error("Failed to fetch payments:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load financial data.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const totalIncome = payments?.reduce((acc, p) => acc + p.amount, 0) || 0

  const showToast = (title: string, description: string) => {
    toast({ title, description });
  };

  return (
    <div className="grid gap-6 md:gap-8">
        <DashboardCard
            title="Financial Overview"
            description="Manage your finances, loans, and subsidies."
        >
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
                    <p className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</p>
                </div>
                <div className="border p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Active Loans</h3>
                    <p className="text-2xl font-bold">₹0</p>
                     <p className="text-xs text-muted-foreground">No active loans</p>
                </div>
                 <div className="border p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Subsidies Received</h3>
                    <p className="text-2xl font-bold">₹5,000</p>
                    <p className="text-xs text-muted-foreground">from Govt. Subsidy</p>
                </div>
            </div>
             <div className="flex gap-4 mt-6">
                <Button onClick={() => showToast('Apply for loan', 'Feature coming soon!')}>
                    <DollarSign className="mr-2 h-4 w-4" /> Apply for Loan
                </Button>
                <Button variant="outline" onClick={() => showToast('Add Expense', 'Feature coming soon!')}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                </Button>
                <Button variant="outline" onClick={() => showToast('Download Report', 'Feature coming soon!')}>
                    <Download className="mr-2 h-4 w-4" /> Download Report
                </Button>
            </div>
        </DashboardCard>

        <DashboardCard
            title="All Payments"
            description="A complete history of all your received payments."
        >
        {loading ? (
            <Skeleton className="h-60 w-full" />
        ) : !payments || payments.length === 0 ? (
            <div className="text-center text-muted-foreground">No payments found.</div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.map((payment) => (
                <TableRow key={payment.id} onClick={() => showToast('View Payment', `Viewing details for payment ${payment.id}`)} className="cursor-pointer">
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.from}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{payment.date}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
        </DashboardCard>
    </div>
  )
}
