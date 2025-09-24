
"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { DashboardCard } from "@/components/dashboard-card"
import { DollarSign, Download, PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getFarmerData, addExpense, applyForLoan } from '@/ai/flows/farmer-flow'
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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


const loanSchema = z.object({
    amount: z.coerce.number().min(1000, "Loan amount must be at least ₹1,000"),
    purpose: z.string().min(10, "Please provide a more detailed purpose."),
});

type LoanFormData = z.infer<typeof loanSchema>;

const expenseSchema = z.object({
    category: z.string().min(1, "Category is required."),
    amount: z.coerce.number().min(1, "Amount must be greater than 0."),
    date: z.date({ required_error: "Please select a date."}),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;


export default function FarmerFinancesPage() {
  const { t } = useI18n();
  const { toast } = useToast()
  const queryClient = useQueryClient();
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false)
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false)

  const { data: farmerData, isLoading: loading, error } = useQuery({
      queryKey: ['farmerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" })
  });
  
  const payments = farmerData?.payments;

  const loanForm = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: { amount: 10000, purpose: "" },
  });

  const expenseForm = useForm<ExpenseFormData>({
      resolver: zodResolver(expenseSchema),
      defaultValues: { category: "", amount: 0, date: new Date() },
  });

  const applyLoanMutation = useMutation({
    mutationFn: (data: LoanFormData) => applyForLoan({ ...data, farmerId: "FARM001" }),
    onSuccess: () => {
        setIsLoanDialogOpen(false);
        loanForm.reset();
        toast({
            title: t('loanAppSubmitted'),
            description: t('loanAppUnderReview')
        });
    },
    onError: (err) => {
        toast({ variant: "destructive", title: t('error'), description: "Could not submit loan application."});
        console.error(err);
    }
  });

  const addExpenseMutation = useMutation({
    mutationFn: (data: Omit<ExpenseFormData, 'date'> & { date: string }) => addExpense({ ...data, farmerId: "FARM001" }),
    onSuccess: () => {
        setIsExpenseSheetOpen(false);
        expenseForm.reset();
        toast({
            title: t('expenseAdded'),
            description: t('expenseRecordedSuccess')
        });
    },
    onError: (err) => {
        toast({ variant: "destructive", title: t('error'), description: "Could not record expense."});
        console.error(err);
    }
  });

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

  const handleLoanSubmit = (data: LoanFormData) => {
    applyLoanMutation.mutate(data);
  }
  
  const handleExpenseSubmit = (data: ExpenseFormData) => {
    addExpenseMutation.mutate({ ...data, date: format(data.date, "yyyy-MM-dd")});
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
            <Form {...loanForm}>
            <form onSubmit={loanForm.handleSubmit(handleLoanSubmit)} className="space-y-4">
                 <FormField
                    control={loanForm.control}
                    name="amount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('amount')} (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={loanForm.control}
                    name="purpose"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('purpose')}</FormLabel>
                        <FormControl>
                            <Textarea placeholder={t('loanPurposePlaceholder')} {...field}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">{t('cancel')}</Button>
                    </DialogClose>
                    <Button type="submit" disabled={applyLoanMutation.isPending}>
                        {applyLoanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('submitApplication')}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
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
            <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4 py-4">
                 <FormField
                    control={expenseForm.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('category')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectCategory')} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="seeds">{t('seeds')}</SelectItem>
                                <SelectItem value="fertilizer">{t('fertilizer')}</SelectItem>
                                <SelectItem value="pesticides">{t('pesticides')}</SelectItem>
                                <SelectItem value="labor">{t('labor')}</SelectItem>
                                <SelectItem value="equipment">{t('equipment')}</SelectItem>
                                <SelectItem value="other">{t('other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={expenseForm.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('amount')} (₹)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="5000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={expenseForm.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>{t('dateOfExpense')}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>{t('pickADate')}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <SheetFooter className="pt-4">
                    <SheetClose asChild>
                        <Button type="button" variant="secondary">{t('cancel')}</Button>
                    </SheetClose>
                    <Button type="submit" disabled={addExpenseMutation.isPending}>
                         {addExpenseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('saveExpense')}
                    </Button>
                </SheetFooter>
            </form>
            </Form>
        </SheetContent>
    </Sheet>
    </>
  )
}
