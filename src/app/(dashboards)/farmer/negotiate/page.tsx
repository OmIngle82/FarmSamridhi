
"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { type Order } from '@/ai/flows/farmer-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardCard } from '@/components/dashboard-card'
import { NegotiationChat } from '@/components/negotiation-chat'


// Mock order data - in a real app, this would be fetched from your database
const mockOrders: Order[] = [
    { id: "ORD001", customer: "BigBasket", amount: 12500, status: "Pending", phone: "9123456780" },
    { id: "ORD002", customer: "Local Mandi", amount: 8200, status: "Shipped", phone: "9123456781" },
    { id: "ORD003", customer: "Reliance Fresh", amount: 25000, status: "Pending", phone: "9123456782" },
];


function NegotiateContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const orderId = searchParams.get('orderId');
    
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            toast({ variant: "destructive", title: "Error", description: "No order ID provided." });
            return;
        }

        // Fetch mock order details
        const foundOrder = mockOrders.find(o => o.id === orderId);
        if (foundOrder) {
            setOrder(foundOrder);
        } else {
            toast({ variant: "destructive", title: "Error", description: "Order not found." });
        }
        setLoading(false);

    }, [orderId, toast]);
    
    if (!order && !loading) {
        return null;
    }

    return (
       <NegotiationChat
            order={order}
            isLoading={loading}
            backLinkHref="/farmer/orders"
            backLinkText="Back to Orders"
            chatDescription={`Conversation with ${order?.customer}.`}
            quickReply1={`I can accept ₹${(order ? order.amount * 1.05 : 0).toLocaleString()}.`}
            quickReply2={`My final price is ₹${(order ? order.amount : 0).toLocaleString()}.`}
            onAcceptOffer={() => toast({title: "Offer Accepted!", description: "You have accepted the buyer's price."})}
       />
    );
}

export default function FarmerNegotiatePage() {
    return (
        <Suspense fallback={<DashboardCard title="Loading..."><Skeleton className="h-96 w-full" /></DashboardCard>}>
            <NegotiateContent />
        </Suspense>
    );
}
