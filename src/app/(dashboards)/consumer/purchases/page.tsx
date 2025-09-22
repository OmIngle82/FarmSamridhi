
"use client"

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getFarmerData } from '@/app/actions/ai-actions'
import type { Purchase } from '@/ai/flows/farmer-flow'

import { DashboardCard } from '@/components/dashboard-card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'
import { PackageSearch, ShoppingCart } from 'lucide-react'


export default function MyPurchasesPage() {
  const { t } = useI18n();
  const { toast } = useToast()

  const { data: purchases, isLoading, error } = useQuery({
      queryKey: ['consumerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" }), // Placeholder ID
      select: (data) => data.purchases,
  });

  useEffect(() => {
    if (error) {
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('myPurchasesError'),
        })
    }
  }, [error, toast, t]);

  return (
    <DashboardCard
      title={t('myPurchases')}
      description={t('myPurchasesDescription')}
    >
      {isLoading ? (
        <Skeleton className="h-60 w-full" />
      ) : !purchases || purchases.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
            <ShoppingCart className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="font-medium">{t('noPurchases')}</p>
            <p className="text-sm">{t('noPurchasesDescription')}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">{t('product')}</TableHead>
              <TableHead>{t('productName')}</TableHead>
              <TableHead>{t('purchaseDate')}</TableHead>
              <TableHead>{t('price')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <Image src={purchase.image} alt={purchase.productName} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{purchase.productName}</TableCell>
                <TableCell>{purchase.date}</TableCell>
                <TableCell>₹{purchase.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/journey?productId=${purchase.productId}`}>
                      <PackageSearch className="mr-2 h-4 w-4" /> {t('traceJourney')}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardCard>
  )
}
