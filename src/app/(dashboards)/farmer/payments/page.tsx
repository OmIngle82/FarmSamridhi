"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardCard } from "@/components/dashboard-card"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { getFarmerData } from "@/ai/flows/farmer-flow"
import type { FarmerData } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"

export default function FarmerPaymentsPage() {
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
          description: "Could not load payments.",
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

  return (
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
  )
}
