
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { DashboardCard } from "@/components/dashboard-card"
import { placeholderImages } from "@/lib/placeholder-images"
import { MessageCircle, Phone, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getFarmerData } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import Link from "next/link"

const farmers = [
  { name: "Suresh Patel", location: "Nashik, Maharashtra", avatarId: "avatar-1", phone: "9876543210" },
  { name: "Priya Singh", location: "Hapur, Uttar Pradesh", avatarId: "avatar-2", phone: "9876543211" },
  { name: "Anil Kumar", location: "Moga, Punjab", avatarId: "avatar-3", phone: "9876543212" },
]

export default function DistributorDashboard() {
  const { toast } = useToast()

  const { data, isLoading: loading, error } = useQuery({
      queryKey: ['farmerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" }),
      select: (data) => ({ orders: data.orders, inventory: data.inventory })
  });

  const orders = data?.orders;
  const inventory = data?.inventory;

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch distributor data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load distributor data.",
        })
    }
  }, [error, toast]);
  
  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
      <DashboardCard
        title="Verified Farmers"
        description="Connect with trusted farmers."
        className="lg:col-span-1"
      >
        <div className="space-y-4">
          {farmers.map((farmer) => {
            const avatar = placeholderImages.find(p => p.id === farmer.avatarId);
            return (
              <div key={farmer.name} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={avatar?.imageUrl} alt={farmer.name} data-ai-hint={avatar?.imageHint} />
                    <AvatarFallback>{farmer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{farmer.name}</p>
                    <p className="text-sm text-muted-foreground">{farmer.location}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                    <a href={`tel:${farmer.phone}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
                    </a>
                    <a href={`sms:${farmer.phone}`}>
                      <Button variant="outline" size="icon" className="h-8 w-8"><MessageCircle className="h-4 w-4" /></Button>
                    </a>
                </div>
              </div>
            )
          })}
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Initiate a new order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Feature Coming Soon!</AlertDialogTitle>
                  <AlertDialogDescription>
                    The ability to initiate a new order directly from the dashboard is currently under development. Please check back later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>OK</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Order Management"
        description="Track and manage all your orders."
        className="lg:col-span-2"
      >
        {loading ? (
            <Skeleton className="h-60 w-full" />
        ) : !orders || orders.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No orders found.</div>
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
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/distributor/negotiate?orderId=${order.id}`}>Negotiate</Link>
                        </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </DashboardCard>

      <DashboardCard
        title="Inventory Tracking"
        description="Monitor your current stock levels."
        className="lg:col-span-3"
      >
        {loading ? (
             <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i}>
                        <div className="flex justify-between mb-1">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        ) : !inventory || inventory.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No inventory data found.</div>
        ) : (
            <div className="space-y-6">
            {inventory.map((item) => (
                <div key={item.item}>
                <div className="flex justify-between mb-1">
                    <span className="font-medium">{item.item}</span>
                    <span className={`text-sm ${item.level < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>{item.status}</span>
                </div>
                <Progress value={item.level} aria-label={`${item.item} stock level`} />
                </div>
            ))}
            </div>
        )}
      </DashboardCard>
    </div>
  )
}
