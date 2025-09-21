
"use client"

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { DashboardCard } from '@/components/dashboard-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getProductJourney } from '@/ai/flows/journey-flow';
import { ProductJourney } from '@/components/product-journey';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


function JourneyContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const { toast } = useToast();

    const { data: journeyData, isFetching, error, isSuccess } = useQuery({
        queryKey: ['productJourney', productId],
        queryFn: () => getProductJourney({ productId: productId! }),
        enabled: !!productId,
        retry: false,
    });

    if (!productId) {
        return (
            <DashboardCard title="No Product Selected" description="Please go back and select a product to trace its journey." >
                <Button variant="outline" asChild>
                    <Link href="/retailer"><ArrowLeft className="mr-2 h-4 w-4" />Back to Retailer Dashboard</Link>
                </Button>
            </DashboardCard>
        );
    }
    
    if (isFetching) {
        return (
            <DashboardCard title="Tracing Product Journey..." description="Fetching the story of your food from farm to table.">
                <div className="space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </DashboardCard>
        );
    }

    if (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: `Could not load product journey for ${productId}.`,
        });
         return (
            <DashboardCard title="Error" description={`Could not load journey for product ID: ${productId}`}>
                 <Button variant="outline" asChild>
                    <Link href="/retailer"><ArrowLeft className="mr-2 h-4 w-4" />Back to Retailer Dashboard</Link>
                </Button>
            </DashboardCard>
        );
    }

    if (journeyData && isSuccess) {
        return <ProductJourney journeyData={journeyData} onReset={() => window.history.back()} resetText="Go Back" />;
    }

    return null;
}


export default function JourneyPage() {
    return (
        <Suspense fallback={<DashboardCard title="Loading Journey..."><Skeleton className="h-96 w-full" /></DashboardCard>}>
            <JourneyContent />
        </Suspense>
    );
}
