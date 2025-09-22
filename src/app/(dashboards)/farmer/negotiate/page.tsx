
"use client"

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { type Order, getFarmerData } from '@/app/actions/ai-actions'
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
    }, [error, toast, t]);
    
    if (!order && !loading) {
        return null;
    }

    return (
       <NegotiationChat
            order={order || null}
            isLoading={loading}
            backLinkHref="/farmer/orders"
            backLinkText={t('backToOrders')}
            chatDescription={`${t('conversationWith')} ${order?.customer}.`}
            quickReply1={`${t('iCanAccept')} ₹${(order ? order.amount * 1.05 : 0).toLocaleString()}`}
            quickReply2={`${t('myFinalPriceIs')} ₹${(order ? order.amount : 0).toLocaleString()}`}
            onAcceptOffer={() => toast({title: t('offerAccepted'), description: t('youHaveAcceptedBuyerPrice')})}
       />
    );
}

export default function FarmerNegotiatePage() {
    const { t } = useI18n();
    return (
        <Suspense fallback={<DashboardCard title={`${t('loading')}...`}><Skeleton className="h-96 w-full" /></DashboardCard>}>
            <NegotiateContent />
        </Suspense>
    );
}
