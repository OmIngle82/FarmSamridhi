
"use client"

import { useState, useEffect, useRef } from 'react'
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
  sender: 'farmer' | 'distributor';
  text: string;
  timestamp: Timestamp | null;
}

interface NegotiationChatProps {
    order: Order | null;
    isLoading: boolean;
    backLinkHref: string;
    backLinkText: string;
    chatDescription: string;
    quickReply1: string;
    quickReply2: string;
    onAcceptOffer: () => void;
}


export function NegotiationChat({ order, isLoading, backLinkHref, backLinkText, chatDescription, quickReply1, quickReply2, onAcceptOffer }: NegotiationChatProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!order?.id) return;

        const messagesCollection = collection(db, 'negotiations', order.id, 'messages');
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
    }, [order?.id, toast]);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async () => {
        if (newMessage.trim() === "" || !order?.id || !user) return;
        setIsSending(true);
        const messagesCollection = collection(db, 'negotiations', order.id, 'messages');
        
        try {
            await addDoc(messagesCollection, {
                text: newMessage,
                sender: user.role,
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

    if (isLoading) {
        return (
            <DashboardCard title="Loading Negotiation..." description="Please wait...">
                <Skeleton className="h-96 w-full" />
            </DashboardCard>
        );
    }
    
    if (!order) {
         return (
            <DashboardCard title="Order Not Found" description="The requested order could not be found.">
                <Link href={backLinkHref}>
                    <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />{backLinkText}</Button>
                </Link>
            </DashboardCard>
        );
    }

    return (
        <DashboardCard
            title={`Negotiating Order: ${order.id}`}
            description={chatDescription}
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
                        <Button variant="outline" size="sm" onClick={() => setNewMessage(quickReply1)}>Suggest Offer</Button>
                        <Button variant="outline" size="sm" onClick={() => setNewMessage(quickReply2)}>Final Offer</Button>
                        <Button variant="secondary" size="sm" onClick={onAcceptOffer}>Accept Offer</Button>
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
}

