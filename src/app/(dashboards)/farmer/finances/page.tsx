
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useI18n } from '@/contexts/i18n-context'


export default function FarmerFinancesPage() {
  const { t } = useI18n();
  const { toast } = useToast()
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false)
  const [expenseDate, setExpenseDate] = useState<Date>()

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
          title: t('error'),
          description: t('financialDataError'),
        })
    }
  }, [error, toast, t]);


  const totalIncome = payments?.reduce((acc, p) => acc + p.amount, 0) || 0

  const handleLoanSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoanDialogOpen(false);
    toast({
        title: t('loanAppSubmitted'),
        description: t('loanAppUnderReview')
    });
  }
  
  const handleExpenseSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsExpenseSheetOpen(false);
    toast({
        title: t('expenseAdded'),
        description: t('expenseRecordedSuccess')
    });
  }

  const handleDownloadReport = () => {
    let reportContent = `${t('financialReport')}\n`;
    reportContent += "====================\n\n";
    reportContent += `${t('totalIncome')}: ₹${totalIncome.toLocaleString()}\n\n`;
    reportContent += `${t('allPayments')}:\n`;
    if (payments) {
        payments.forEach(p => {
            reportContent += `- ID: ${p.id}, ${t('from')}: ${p.from}, ${t('amount')}: ₹${p.amount.toLocaleString()}, ${t('date')}: ${p.date}\n`;
        });
    } else {
        reportContent += `${t('noPaymentsRecorded')}.\n`;
    }

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
        title: t('reportDownloaded'),
        description: t('financialReportSaved'),
    });
  };

  return (
    <>
    <div className="grid gap-6 md:gap-8">
        <DashboardCard
            title={t('financialOverview')}
            description={t('manageFinancesLoansSubsidies')}
        >
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('totalIncome')}</h3>
                    <div className="text-2xl font-bold">
                        {loading ? (
                            <Skeleton className="h-8 w-32 mt-1" />
                        ) : (
                            `₹${totalIncome.toLocaleString()}`
                        )}
                    </div>
                </div>
                <div className="border p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('activeLoans')}</h3>
                    <div className="text-2xl font-bold">₹0</div>
                     <p className="text-xs text-muted-foreground">{t('noActiveLoans')}</p>
                </div>
                 <div className="border p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('subsidiesReceived')}</h3>
                    <div className="text-2xl font-bold">₹5,000</div>
                    <p className="text-xs text-muted-foreground">{t('from')} Govt. Subsidy</p>
                </div>
            </div>
             <div className="flex gap-4 mt-6">
                <Button onClick={() => setIsLoanDialogOpen(true)}>
                    <DollarSign className="mr-2 h-4 w-4" /> {t('applyForLoan')}
                </Button>
                <Button variant="outline" onClick={() => setIsExpenseSheetOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('addExpense')}
                </Button>
                <Button variant="outline" onClick={handleDownloadReport}>
                    <Download className="mr-2 h-4 w-4" /> {t('downloadReport')}
                </Button>
            </div>
        </DashboardCard>

        <DashboardCard
            title={t('allPayments')}
            description={t('completePaymentHistory')}
        >
        {loading ? (
            <Skeleton className="h-60 w-full" />
        ) : !payments || payments.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">{t('noPaymentsFound')}</div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>{t('paymentId')}</TableHead>
                <TableHead>{t('from')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                <TableHead className="text-right">{t('date')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payments.map((payment) => (
                <TableRow key={payment.id} onClick={() => toast({ title: t('viewDetailsDemoTitle'), description: t('viewDetailsDemoDescription')})} className="cursor-pointer">
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
                <DialogTitle>{t('applyForAgriLoan')}</DialogTitle>
                <DialogDescription>
                    {t('fillLoanDetails')}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLoanSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="loan-amount" className="text-right">
                            {t('amount')} (₹)
                        </Label>
                        <Input id="loan-amount" type="number" defaultValue="10000" className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="loan-purpose" className="text-right">
                            {t('purpose')}
                        </Label>
                        <Textarea id="loan-purpose" placeholder={t('loanPurposePlaceholder')} className="col-span-3" required/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">{t('cancel')}</Button>
                    </DialogClose>
                    <Button type="submit">{t('submitApplication')}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    
    <Sheet open={isExpenseSheetOpen} onOpenChange={setIsExpenseSheetOpen}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>{t('addNewExpense')}</SheetTitle>
                <SheetDescription>
                    {t('keepTrackOfExpenses')}
                </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleExpenseSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="expense-category">{t('category')}</Label>
                        <Select required>
                            <SelectTrigger id="expense-category">
                                <SelectValue placeholder={t('selectCategory')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="seeds">{t('seeds')}</SelectItem>
                                <SelectItem value="fertilizer">{t('fertilizer')}</SelectItem>
                                <SelectItem value="pesticides">{t('pesticides')}</SelectItem>
                                <SelectItem value="labor">{t('labor')}</SelectItem>
                                <SelectItem value="equipment">{t('equipment')}</SelectItem>
                                <SelectItem value="other">{t('other')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expense-amount">{t('amount')} (₹)</Label>
                        <Input id="expense-amount" type="number" placeholder="5000" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expense-date">{t('dateOfExpense')}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !expenseDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {expenseDate ? format(expenseDate, "PPP") : <span>{t('pickADate')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={expenseDate}
                                onSelect={setExpenseDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="button" variant="secondary">{t('cancel')}</Button>
                    </SheetClose>
                    <Button type="submit">{t('saveExpense')}</Button>
                </SheetFooter>
            </form>
        </SheetContent>
    </Sheet>
    </>
  )
}
