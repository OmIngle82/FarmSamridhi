
"use client"
import Link from "next/link"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import React, { useEffect, useMemo, Suspense } from "react"
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
import { getFarmerData, type Order } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from '@/contexts/i18n-context'

function OrdersContent() {
  const { t } = useI18n();
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const { data: allOrders, isLoading: loading, error } = useQuery({
      queryKey: ['farmerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" }),
      select: (data) => data.orders,
  });

  const statusFilter = searchParams.get('status') || 'all';

  const orders = useMemo(() => {
    if (!allOrders) return [];
    if (statusFilter === 'all') return allOrders;
    return allOrders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
  }, [allOrders, statusFilter]);

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch orders:", error)
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('ordersError'),
        })
    }
  }, [error, toast, t]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
        params.delete('status');
    } else {
        params.set('status', value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }


  return (
    <DashboardCard
      title={t('allOrders')}
      description={t('completeOrderHistory')}
    >
        <Tabs value={statusFilter} onValueChange={handleTabChange} className="mb-4">
            <TabsList>
                <TabsTrigger value="all">{t('all')}</TabsTrigger>
                <TabsTrigger value="pending">{t('pending')}</TabsTrigger>
                <TabsTrigger value="shipped">{t('shipped')}</TabsTrigger>
            </TabsList>
        </Tabs>
      {loading ? (
        <Skeleton className="h-60 w-full" />
      ) : !orders || orders.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">{t('no')} {statusFilter !== 'all' ? t(statusFilter as any) : ''} {t('ordersFound')}.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('orderId')}</TableHead>
              <TableHead>{t('customer')}</TableHead>
              <TableHead>{t('amount')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={order.status === "Pending" ? "destructive" : order.status === "Shipped" ? "secondary" : "default"}>
                    {t(order.status.toLowerCase() as any) || order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/farmer/negotiate?orderId=${order.id}`}><MessageSquare className="mr-2 h-4 w-4"/>{t('negotiate')}</Link>
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

export default function FarmerOrdersPage() {
    return (
        <Suspense>
            <OrdersContent />
        </Suspense>
    )
}
