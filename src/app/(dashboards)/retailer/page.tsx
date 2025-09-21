import Image from 'next/image'
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
import { placeholderImages } from "@/lib/placeholder-images"
import { PackageSearch, Plus, Tractor } from "lucide-react"

const products = [
  { name: "Fresh Tomatoes", farmer: "Suresh Patel", location: "Nashik", price: "₹25/kg", avatarId: "product-tomato" },
  { name: "Organic Wheat", farmer: "Priya Singh", location: "Hapur", price: "₹30/kg", avatarId: "product-wheat" },
  { name: "Himalayan Potatoes", farmer: "Anil Kumar", location: "Moga", price: "₹20/kg", avatarId: "product-potato" },
  { name: "Sweet Corn", farmer: "Suresh Patel", location: "Nashik", price: "₹15/piece", avatarId: "product-corn" },
]

const transactions = [
    { id: "TRN001", date: "2024-07-21", item: "Fresh Tomatoes", amount: "₹5,000", status: "Completed" },
    { id: "TRN002", date: "2024-07-20", item: "Organic Wheat", amount: "₹12,000", status: "Completed" },
    { id: "TRN003", date: "2024-07-19", item: "Himalayan Potatoes", amount: "₹4,000", status: "Completed" },
]

export default function RetailerDashboard() {
  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
      <DashboardCard
        title="Source Traceable Products"
        description="Find fresh produce directly from farmers."
        className="lg:col-span-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const image = placeholderImages.find(p => p.id === product.avatarId);
            return (
              <div key={product.name} className="border rounded-lg overflow-hidden group">
                <div className="relative h-40">
                  <Image src={image?.imageUrl || ""} alt={product.name} layout="fill" objectFit="cover" data-ai-hint={image?.imageHint} />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">from {product.farmer}</p>
                  <p className="text-sm text-muted-foreground">{product.location}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-lg">{product.price}</span>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" /> Buy
                    </Button>
                  </div>
                   <Button variant="outline" size="sm" className="w-full mt-2">
                        <PackageSearch className="mr-2 h-4 w-4" /> Trace Origin
                    </Button>
                </div>
              </div>
            )
          })}
        </div>
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
              <TableRow key={transaction.id}>
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
