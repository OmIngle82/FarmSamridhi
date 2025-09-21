
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
import { useI18n } from '@/contexts/i18n-context';


function JourneyContent() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const { t } = useI18n();
    const { toast } = useToast();

    const { data: journeyData, isFetching, error, isSuccess } = useQuery({
        queryKey: ['productJourney', productId],
        queryFn: () => getProductJourney({ productId: productId! }),
        enabled: !!productId,
        retry: false,
    });

    if (!productId) {
        return (
            <DashboardCard title={t('noProductSelected')} description={t('selectProductToTrace')} >
                <Button variant="outline" asChild>
                    <Link href="/retailer"><ArrowLeft className="mr-2 h-4 w-4" />{t('backToRetailerDashboard')}</Link>
                </Button>
            </DashboardCard>
        );
    }
    
    if (isFetching) {
        return (
            <DashboardCard title={t('tracingProductJourney')} description={t('fetchingJourneyDescription')}>
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
            title: t('error'),
            description: `${t('journeyError')} ${productId}.`,
        });
         return (
            <DashboardCard title={t('error')} description={`${t('journeyError')} ${productId}`}>
                 <Button variant="outline" asChild>
                    <Link href="/retailer"><ArrowLeft className="mr-2 h-4 w-4" />{t('backToRetailerDashboard')}</Link>
                </Button>
            </DashboardCard>
        );
    }

    if (journeyData && isSuccess) {
        return <ProductJourney journeyData={journeyData} onReset={() => window.history.back()} resetText={t('goBack')} />;
    }

    return null;
}


export default function JourneyPage() {
    const { t } = useI18n();
    return (
        <Suspense fallback={<DashboardCard title={`${t('loading')} ${t('traceJourney')}...`}><Skeleton className="h-96 w-full" /></DashboardCard>}>
            <JourneyContent />
        </Suspense>
    );
}
