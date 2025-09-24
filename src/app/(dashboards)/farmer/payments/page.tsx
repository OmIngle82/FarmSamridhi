
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
import { getFarmerData } from '@/ai/flows/farmer-flow'
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useI18n } from '@/contexts/i18n-context'

export default function FarmerPaymentsPage() {
  const { t } = useI18n();
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
          title: t('error'),
          description: t('paymentsError'),
        })
    }
  }, [error, toast, t]);


  return (
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
              <TableRow key={payment.id} onClick={() => toast({title: t('viewDetailsDemoTitle'), description: t('viewDetailsDemoDescription')})} className="cursor-pointer">
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
