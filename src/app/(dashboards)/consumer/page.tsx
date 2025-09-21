
"use client"

import { useState, useEffect, useRef } from 'react'
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

export default function ConsumerDashboard() {
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [scannedProductId, setScannedProductId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null)

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

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (isScanning) {
      const getCameraPermission = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
          setIsScanning(false)
        }
      };

      getCameraPermission();
      
      return () => {
        // Stop camera stream when component unmounts or scanning stops
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [isScanning, toast]);

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
      <DashboardCard title="Tracing Product Journey..." description="Fetching the story of your food from farm to table.">
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
        title="Trace Your Food's Journey"
        description="Scan the QR code on your product to discover its story, from the farm to your hands. See the farmers who grew it, the path it traveled, and key milestones along the way."
      >
        <div className="flex flex-col gap-4 items-center justify-center text-center h-full p-8">
            <QrCode className="w-24 h-24 text-primary" strokeWidth={1} />
            <h3 className="text-2xl font-semibold mt-4">Ready to Scan</h3>
            <p className="text-muted-foreground max-w-sm">
                Position the product's QR code in front of your camera or simulate a scan to see how it works.
            </p>
          <div className="flex gap-4 mt-6">
            <Button size="lg" onClick={handleStartScan}>
                <Camera className="mr-2 h-5 w-5" /> Start Scanning
            </Button>
            <Button size="lg" variant="outline" onClick={handleSimulateScan}>
                <ScanLine className="mr-2 h-5 w-5" /> Simulate Scan
            </Button>
          </div>
        </div>
      </DashboardCard>
      
      <AlertDialog open={isScanning} onOpenChange={setIsScanning}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Scan Product QR Code</AlertDialogTitle>
            <AlertDialogDescription>
              Center the QR code within the frame to automatically scan it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white/50 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"/>
             </div>
             {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Alert variant="destructive" className="w-3/4">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access in your browser to use this feature. You may need to refresh the page after granting permission.
                        </AlertDescription>
                    </Alert>
                </div>
             )}
          </div>
          <AlertDialogFooter>
            <Button variant="secondary" onClick={handleSimulateScan}>Simulate Scan</Button>
            <Button variant="outline" onClick={handleCloseScanner}>
                <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

    