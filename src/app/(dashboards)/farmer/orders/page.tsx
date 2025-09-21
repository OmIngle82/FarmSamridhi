"use client"
import Link from "next/link"
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
import { MessageSquare, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { getOrders } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"

export default function FarmerOrdersPage() {
  const { toast } = useToast()

  const { data: orders, isLoading: loading, error } = useQuery({
      queryKey: ['farmerOrders'],
      queryFn: () => getOrders("FARM001")
  });

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch orders:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load orders.",
        })
    }
  }, [error, toast]);


  return (
    <DashboardCard
      title="All Orders"
      description="A complete history of all your orders."
    >
      {loading ? (
        <Skeleton className="h-60 w-full" />
      ) : !orders || orders.length === 0 ? (
        <div className="text-center text-muted-foreground">No orders found.</div>
      ) : (
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
                  <Badge variant={order.status === "Pending" ? "destructive" : order.status === "Shipped" ? "secondary" : "default"}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/farmer/negotiate?orderId=${order.id}`}><MessageSquare className="mr-2 h-4 w-4"/>Negotiate</Link>
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
      )}
    </DashboardCard>
  )
}