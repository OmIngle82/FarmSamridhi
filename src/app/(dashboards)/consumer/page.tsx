
"use client"

import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "@/components/dashboard-card"
import { QrCode, Camera, ScanLine, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getProductJourney } from '@/ai/flows/journey-flow'
import type { ProductJourneyData } from '@/ai/flows/journey-flow'
import { ProductJourney } from '@/components/product-journey'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '@/contexts/i18n-context'

export default function ConsumerDashboard() {
  const { t } = useI18n();
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [scannedProductId, setScannedProductId] = useState<string | null>(null);
  
  const { data: journeyData, isFetching: isFetchingJourney, error, isSuccess } = useQuery({
    queryKey: ['productJourney', scannedProductId],
    queryFn: () => getProductJourney({ productId: scannedProductId! }),
    enabled: !!scannedProductId,
  });

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch journey data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load product journey.",
      });
      setScannedProductId(null);
    }
  }, [error, toast]);
  

  const handleSimulateScan = () => {
    setIsScanning(false)
    setScannedProductId("PROD001");
  }

  const handleStartScan = () => {
    // In a real app, this would open the camera. For this simplified version,
    // we'll show a dialog explaining the feature is simulated.
    setIsScanning(true)
  }

  const handleCloseScanner = () => {
    setIsScanning(false);
  }
  
  const resetJourney = () => {
    setScannedProductId(null);
  }

  if (isFetchingJourney) {
    return (
      <DashboardCard title={t('tracingProductJourney')} description={t('fetchingJourneyDescription')}>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardCard>
    )
  }

  if (journeyData && isSuccess) {
    return (
        <ProductJourney journeyData={journeyData} onReset={resetJourney} />
    )
  }

  return (
    <>
      <DashboardCard
        title={t('traceYourFoodJourney')}
        description={t('scanQrDescription')}
      >
        <div className="flex flex-col gap-4 items-center justify-center text-center h-full p-8">
            <QrCode className="w-24 h-24 text-primary" strokeWidth={1} />
            <h3 className="text-2xl font-semibold mt-4">{t('readyToScan')}</h3>
            <p className="text-muted-foreground max-w-sm">
                {t('positionQrCode')}
            </p>
          <div className="flex gap-4 mt-6">
            <Button size="lg" onClick={handleStartScan}>
                <Camera className="mr-2 h-5 w-5" /> {t('startScanning')}
            </Button>
            <Button size="lg" variant="outline" onClick={handleSimulateScan}>
                <ScanLine className="mr-2 h-5 w-5" /> {t('simulateScan')}
            </Button>
          </div>
        </div>
      </DashboardCard>
      
      <AlertDialog open={isScanning} onOpenChange={setIsScanning}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('scanProductQrCode')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('centerQrCode')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"/>
             </div>
            <Alert variant="default" className="w-3/4 bg-background">
                <AlertTitle>Live Scanning Not Implemented</AlertTitle>
                <AlertDescription>
                    The live QR code scanning feature is not implemented in this prototype to ensure compatibility. Please use the &quot;Simulate Scan&quot; button on the dashboard to see the product journey feature.
                </AlertDescription>
            </Alert>
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleCloseScanner}>
                <X className="mr-2 h-4 w-4" /> {t('cancel')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
