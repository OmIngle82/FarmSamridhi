
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
import { useEffect } from "react"
import { getFarmerData } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"

export default function FarmerPaymentsPage() {
  const { toast } = useToast()

  const { data: payments, isLoading: loading, error } = useQuery({
    queryKey: ['farmerData'],
    queryFn: () => getFarmerData({ farmerId: "FARM001" }),
    select: (data) => data.payments,
  });

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch payments:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load payments.",
        })
    }
  }, [error, toast]);


  return (
    <DashboardCard
      title="All Payments"
      description="A complete history of all your received payments."
    >
      {loading ? (
        <Skeleton className="h-60 w-full" />
      ) : !payments || payments.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No payments found.</div>
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
              <TableRow key={payment.id} onClick={() => toast({title: 'View Details (Demo)', description: 'In a real app, this would open a detailed view for the payment.'})} className="cursor-pointer">
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
