
"use client"

import { useState, useEffect, useRef } from 'react'
import jsQR from "jsqr"
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
import { getProductJourney, type ProductJourneyData } from '@/ai/flows/journey-flow'
import { ProductJourney } from '@/components/product-journey'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '@/contexts/i18n-context'

export default function ConsumerDashboard() {
  const { t } = useI18n();
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [scannedProductId, setScannedProductId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null);

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
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }

  useEffect(() => {
    let animationFrameId: number | null = null;

    const tick = () => {
       if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
              console.log("Found QR code", code.data);
              setScannedProductId(code.data);
              handleCloseScanner();
            }
          } catch (e) {
            console.error("jsQR error:", e);
          }
        }
      }
      // Check isScanning inside the loop to ensure it stops promptly
      if (isScanning) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };
    
    if (isScanning) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          streamRef.current = stream;
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // The 'loadeddata' event is a good place to start the animation loop
            videoRef.current.onloadeddata = () => {
              animationFrameId = requestAnimationFrame(tick);
            };
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: t('cameraAccessDenied'),
            description: t('enableCameraPermissions'),
          });
          setIsScanning(false)
        }
      };

      getCameraPermission();
    } else {
        stopCamera();
    }
    
    return () => {
      stopCamera();
      if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
      }
    }
  }, [isScanning, toast, t]);


  const handleSimulateScan = () => {
    setIsScanning(false)
    setScannedProductId("PROD001");
  }

  const handleStartScan = () => {
    setScannedProductId(null);
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
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('scanProductQrCode')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('centerQrCode')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
             <canvas ref={canvasRef} className="hidden" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"/>
             </div>
             {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Alert variant="destructive" className="w-3/4">
                        <AlertTitle>{t('cameraAccessRequired')}</AlertTitle>
                        <AlertDescription>
                           {t('allowCameraAccess')}
                        </AlertDescription>
                    </Alert>
                </div>
             )}
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
