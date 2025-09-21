
"use client"

import Image from 'next/image'
import Link from 'next/link'
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
import { DashboardCard } from "@/components/dashboard-card"
import { PackageSearch, Plus, Tractor } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { getFarmerData, type Product } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from '@tanstack/react-query'

const transactions = [
    { id: "TRN001", date: "2024-07-21", item: "Fresh Tomatoes", amount: "₹5,000", status: "Completed" },
    { id: "TRN002", date: "2024-07-20", item: "Organic Wheat", amount: "₹12,000", status: "Completed" },
    { id: "TRN003", date: "2024-07-19", item: "Himalayan Potatoes", amount: "₹4,000", status: "Completed" },
]

export default function RetailerDashboard() {
  const { toast } = useToast()

  const { data: products, isLoading: loading, error } = useQuery({
    queryKey: ['farmerData'],
    queryFn: () => getFarmerData({ farmerId: "FARM001" }),
    select: (data) => data.products,
  });

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch products:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load products.",
        })
    }
  }, [error, toast]);


  const showToast = (title: string, description: string) => {
    toast({
        title,
        description,
    });
  };

  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
      <DashboardCard
        title="Source Traceable Products"
        description="Find fresh produce directly from farmers."
        className="lg:col-span-3"
      >
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        ) : !products || products.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No products available.</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <div key={product.id} className="border rounded-lg overflow-hidden group">
                    <div className="relative h-40 bg-muted">
                    {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" />}
                    </div>
                    <div className="p-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">from Suresh Patel</p>
                    <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-lg">₹{product.price}/kg</span>
                        <Button size="sm" onClick={() => showToast('Purchase (Demo)', `This would add ${product.name} to a cart.`)}>
                        <Plus className="mr-1 h-4 w-4" /> Buy
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                        <Link href={`/journey?productId=${product.id}`}>
                            <PackageSearch className="mr-2 h-4 w-4" /> Trace Origin
                        </Link>
                    </Button>
                    </div>
                </div>
            ))}
            </div>
        )}
      </DashboardCard>
      
      <DashboardCard
        title="Manage Transactions"
        description="Your recent procurement history."
        className="lg:col-span-3"
      >
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>

              <TableHead>Item</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} onClick={() => showToast('View Details (Demo)', 'In a real app, this would open a detailed view for the transaction.')} className="cursor-pointer">
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.item}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell className="text-right">
                  <Badge>{transaction.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardCard>
    </div>
  )
}
