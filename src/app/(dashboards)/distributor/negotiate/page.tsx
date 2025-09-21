
"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { type Order } from '@/ai/flows/farmer-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/components/dashboard-card'
import { NegotiationChat } from '@/components/negotiation-chat'
import { useI18n } from '@/contexts/i18n-context'


// Mock order data - in a real app, this would be fetched from your database
const mockOrders: Order[] = [
    { id: "ORD001", customer: "BigBasket", amount: 12500, status: "Pending", phone: "9123456780" },
    { id: "ORD002", customer: "Local Mandi", amount: 8200, status: "Shipped", phone: "9123456781" },
    { id: "ORD003", customer: "Reliance Fresh", amount: 25000, status: "Pending", phone: "9123456782" },
];


function NegotiateContent() {
    const { t } = useI18n();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const orderId = searchParams.get('orderId');
    
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            toast({ variant: "destructive", title: t('error'), description: t('noOrderIdProvided') });
            return;
        }

        // Fetch mock order details
        const foundOrder = mockOrders.find(o => o.id === orderId);
        if (foundOrder) {
            setOrder(foundOrder);
        } else {
            toast({ variant: "destructive", title: t('error'), description: t('orderNotFound') });
        }
        setLoading(false);

    }, [orderId, toast, t]);

    if (!order && !loading) {
        return null;
    }

    return (
        <NegotiationChat
            order={order}
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
