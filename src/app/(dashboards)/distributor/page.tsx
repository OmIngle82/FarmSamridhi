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
import { DashboardCard } from "@/components/dashboard-card"
import { placeholderImages } from "@/lib/placeholder-images"
import { MessageCircle, Phone, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const farmers = [
  { name: "Suresh Patel", location: "Nashik, Maharashtra", avatarId: "avatar-1", phone: "9876543210" },
  { name: "Priya Singh", location: "Hapur, Uttar Pradesh", avatarId: "avatar-2", phone: "9876543211" },
  { name: "Anil Kumar", location: "Moga, Punjab", avatarId: "avatar-3", phone: "9876543212" },
]

const orders = [
  { id: "ORD101", farmer: "Suresh Patel", item: "Tomatoes", qty: "500 kg", status: "In Transit" },
  { id: "ORD102", farmer: "Priya Singh", item: "Wheat", qty: "2 Tonnes", status: "Delivered" },
  { id: "ORD103", farmer: "Anil Kumar", item: "Potatoes", qty: "1 Tonne", status: "Pending Pickup" },
]

const inventory = [
  { item: "Tomatoes", level: 75, status: "In Stock" },
  { item: "Wheat", level: 40, status: "Low Stock" },
  { item: "Potatoes", level: 90, status: "In Stock" },
]

export default function DistributorDashboard() {
  const { toast } = useToast()

  const showToast = (title: string, description: string) => {
    toast({
        title,
        description,
    });
  };
  
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
           <Button className="w-full mt-4" onClick={() => showToast('New Order', 'Feature to initiate new order is coming soon!')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Initiate a new order
          </Button>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Order Management"
        description="Track and manage all your orders."
        className="lg:col-span-2"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} onClick={() => showToast('View Order', `Viewing details for order ${order.id}`)} className="cursor-pointer">
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.farmer}</TableCell>
                <TableCell>{order.item}</TableCell>
                <TableCell>{order.qty}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>{order.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardCard>

      <DashboardCard
        title="Inventory Tracking"
        description="Monitor your current stock levels."
        className="lg:col-span-3"
      >
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
      </DashboardCard>
    </div>
  )
}
