
"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { type Order, getFarmerData } from '@/ai/flows/farmer-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/components/dashboard-card'
import { NegotiationChat } from '@/components/negotiation-chat'
import { useI18n } from '@/contexts/i18n-context'
import { useQuery } from '@tanstack/react-query'


function NegotiateContent() {
    const { t } = useI18n();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const orderId = searchParams.get('orderId');
    
    const { data: order, isLoading: loading, error } = useQuery({
        queryKey: ['farmerData', 'order', orderId],
        queryFn: () => getFarmerData({ farmerId: "FARM001" }), // Assuming one farmer for now
        enabled: !!orderId,
        select: (data) => data.orders.find(o => o.id === orderId),
    });
    
    useEffect(() => {
        if (error) {
            toast({ variant: "destructive", title: t('error'), description: t('orderNotFound') });
        }
    }, [orderId, toast, t, error]);

    if (!order && !loading) {
        return null;
    }

    return (
        <NegotiationChat
            order={order || null}
            isLoading={loading}
            backLinkHref="/distributor"
            backLinkText={t('backToDashboard')}
            chatDescription={`${t('conversationWith')} ${t('theFarmer')} for order to customer: ${order?.customer}.`}
            quickReply1={`${t('iCanOffer')} ₹${(order ? order.amount * 0.9 : 0).toLocaleString()}`}
            quickReply2={`${t('myFinalOfferIs')} ₹${(order ? order.amount * 0.95 : 0).toLocaleString()}`}
            onAcceptOffer={() => toast({title: t('offerAccepted'), description: t('youHaveAcceptedFarmerPrice')})}
        />
    );
}

export default function DistributorNegotiatePage() {
    const { t } = useI18n();
    return (
        <Suspense fallback={<DashboardCard title={`${t('loading')}...`}><Skeleton className="h-96 w-full" /></DashboardCard>}>
            <NegotiateContent />
        </Suspense>
    );
}
