
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
import { getFarmerData } from "@/app/actions/ai-actions"
import type { Order, InventoryItem, FarmerProfile } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import Link from "next/link"
import { useI18n } from '@/contexts/i18n-context'


export default function DistributorDashboard() {
  const { t } = useI18n();
  const { toast } = useToast()

  const { data, isLoading: loading, error } = useQuery({
      queryKey: ['farmerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" }),
      select: (data) => ({ orders: data.orders as Order[], inventory: data.inventory as InventoryItem[], farmers: data.farmers as FarmerProfile[] })
  });

  const orders = data?.orders;
  const inventory = data?.inventory;
  const farmers = data?.farmers;

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch distributor data:", error)
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('distributorDataError'),
        })
    }
  }, [error, toast, t]);
  
  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
      <DashboardCard
        title={t('verifiedFarmers')}
        description={t('connectWithTrustedFarmers')}
        className="lg:col-span-1"
      >
        <div className="space-y-4">
          {loading ? (
             [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
             ))
          ) : !farmers || farmers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">{t('noFarmersFound')}</div>
          ) : (
            farmers.map((farmer) => {
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
            })
          )}
           <Button className="w-full mt-4" asChild>
                <Link href="/distributor/new-order">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('initiateNewOrder')}
                </Link>
            </Button>
        </div>
      </DashboardCard>

      <DashboardCard
        title={t('orderManagement')}
        description={t('trackAndManageOrders')}
        className="lg:col-span-2"
      >
        {loading ? (
            <Skeleton className="h-60 w-full" />
        ) : !orders || orders.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">{t('noOrdersFound')}</div>
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
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/distributor/negotiate?orderId=${order.id}`}>{t('negotiate')}</Link>
                        </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </DashboardCard>

      <DashboardCard
        title={t('inventoryTracking')}
        description={t('monitorStockLevels')}
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
            <div className="text-center text-muted-foreground py-12">{t('noInventoryData')}</div>
        ) : (
            <div className="space-y-6">
            {inventory.map((item) => (
                <div key={item.item}>
                <div className="flex justify-between mb-1">
                    <span className="font-medium">{item.item}</span>
                    <span className={`text-sm ${item.level < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>{t(item.status.replace(/\s+/g, '').toLowerCase() as any) || item.status}</span>
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
