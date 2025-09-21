
"use client"
import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"

import { DashboardCard } from "@/components/dashboard-card"
import { DollarSign, Download, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getFarmerData } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"

export default function FarmerFinancesPage() {
  const { toast } = useToast()
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)

  const { data: farmerData, isLoading: loading, error } = useQuery({
      queryKey: ['farmerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" })
  });
  
  const payments = farmerData?.payments;

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch financial data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load financial data.",
        })
    }
  }, [error, toast]);


  const totalIncome = payments?.reduce((acc, p) => acc + p.amount, 0) || 0

  const handleLoanSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoanDialogOpen(false);
    toast({
        title: "Loan Application Submitted",
        description: "Your application has been received and is under review."
    });
  }

  const showToast = (title: string, description: string) => {
    toast({ title, description });
  };

  return (
    <>
    <div className="grid gap-6 md:gap-8">
        <DashboardCard
            title="Financial Overview"
            description="Manage your finances, loans, and subsidies."
        >
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
                    <p className="text-2xl font-bold">₹{loading ? <Skeleton className="h-8 w-32 mt-1" /> : totalIncome.toLocaleString()}</p>
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
                <Button onClick={() => setIsLoanDialogOpen(true)}>
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

    <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Apply for Agri-Loan Express</DialogTitle>
                <DialogDescription>
                    Fill in the details below to apply for a loan. We'll get back to you within 2-3 business days.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLoanSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="loan-amount" className="text-right">
                            Amount (₹)
                        </Label>
                        <Input id="loan-amount" type="number" defaultValue="10000" className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="loan-purpose" className="text-right">
                            Purpose
                        </Label>
                        <Textarea id="loan-purpose" placeholder="e.g., Buying seeds, new equipment, etc." className="col-span-3" required/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Submit Application</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  )
}
