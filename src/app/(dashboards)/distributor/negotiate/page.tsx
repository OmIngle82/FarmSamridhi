"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, type Timestamp } from "firebase/firestore";

import { DashboardCard } from "@/components/dashboard-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { type Order } from '@/ai/flows/farmer-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Send } from 'lucide-react'
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context'

interface Message {
  id?: string;
  sender: 'farmer' | 'buyer';
  text: string;
  timestamp: Timestamp | null;
}

// Mock order data - in a real app, this would be fetched from your database
const mockOrders: Order[] = [
    { id: "ORD001", customer: "BigBasket", amount: 12500, status: "Pending", phone: "9123456780" },
    { id: "ORD002", customer: "Local Mandi", amount: 8200, status: "Shipped", phone: "9123456781" },
    { id: "ORD003", customer: "Reliance Fresh", amount: 25000, status: "Pending", phone: "9123456782" },
];


function NegotiateContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const orderId = searchParams.get('orderId');
    
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!orderId) return;

        const messagesCollection = collection(db, 'negotiations', orderId, 'messages');
        const q = query(messagesCollection, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs: Message[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                msgs.push({
                    id: doc.id,
                    sender: data.sender,
                    text: data.text,
                    timestamp: data.timestamp,
                });
            });
            setMessages(msgs);
        }, (error) => {
            console.error("Error fetching messages:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load chat history." });
        });

        return () => unsubscribe();
    }, [orderId, toast]);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async () => {
        if (newMessage.trim() === "" || !orderId || !user) return;
        setIsSending(true);
        const messagesCollection = collection(db, 'negotiations', orderId, 'messages');
        
        try {
            await addDoc(messagesCollection, {
                text: newMessage,
                sender: user.role, // Assuming the logged in user is the sender
                timestamp: serverTimestamp(),
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: "destructive", title: "Error", description: "Message could not be sent." });
        } finally {
            setIsSending(false);
        }
    }

    if (loading) {
        return (
            <DashboardCard title="Loading Negotiation..." description="Please wait...">
                <Skeleton className="h-96 w-full" />
            </DashboardCard>
        );
    }
    
    if (!order) {
         return (
            <DashboardCard title="Order Not Found" description="The requested order could not be found.">
                <Link href="/distributor">
                    <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
                </Link>
            </DashboardCard>
        );
    }

    return (
        <DashboardCard
            title={`Negotiating Order: ${order.id}`}
            description={`Conversation with Farmer for customer: ${order.customer}.`}
        >
            <div className="flex flex-col h-[65vh]">
                <div className="flex-grow overflow-y-auto p-4 border rounded-t-lg bg-muted/20 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={msg.id || index} className={`flex items-end gap-2 ${msg.sender === user?.role ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === user?.role ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-x border-b rounded-b-lg">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Type your message..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={isSending}
                        />
                        <Button onClick={handleSendMessage} disabled={isSending}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                     <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setNewMessage(`I can offer ₹${(order.amount * 0.9).toLocaleString()} for this order.`)}>Suggest: ₹{(order.amount * 0.9).toLocaleString()}</Button>
                        <Button variant="outline" size="sm" onClick={() => setNewMessage(`Can you do ₹${(order.amount * 0.95).toLocaleString()}?`)}>Counter-offer</Button>
                        <Button variant="secondary" size="sm" onClick={() => toast({title: "Offer Accepted!", description: "You have accepted the farmer's price."})}>Accept Offer</Button>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
}

export default function DistributorNegotiatePage() {
    return (
        <Suspense fallback={<DashboardCard title="Loading..."><Skeleton className="h-96 w-full" /></DashboardCard>}>
            <NegotiateContent />
        </Suspense>
    );
}