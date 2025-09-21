"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardCard } from "@/components/dashboard-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getOrder, type Order } from '@/ai/flows/farmer-flow'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Message {
  sender: 'farmer' | 'buyer';
  text: string;
}

function NegotiateContent() {
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const orderId = searchParams.get('orderId')
    
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const chatEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function fetchOrder() {
            if (!orderId) {
                setLoading(false)
                toast({ variant: "destructive", title: "Error", description: "No order ID provided." })
                return
            }
            try {
                const fetchedOrder = await getOrder(orderId)
                if (fetchedOrder) {
                    setOrder(fetchedOrder)
                    setMessages([
                        { sender: 'buyer', text: `Hello! We'd like to place an order for ₹${fetchedOrder.amount.toLocaleString()}.` },
                        { sender: 'buyer', text: `We can offer ₹${(fetchedOrder.amount * 0.9).toLocaleString()} for this bulk purchase.` },
                    ])
                } else {
                     toast({ variant: "destructive", title: "Error", description: "Order not found." })
                }
            } catch (error) {
                console.error("Failed to fetch order:", error)
                toast({ variant: "destructive", title: "Error", description: "Could not load order details." })
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [orderId, toast])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])


    const handleSendMessage = () => {
        if (newMessage.trim() === "") return
        const currentMessages = [...messages, { sender: 'farmer' as 'farmer', text: newMessage }]
        setMessages(currentMessages)
        setNewMessage("")

        // Simulate buyer response
        setTimeout(() => {
            setMessages([...currentMessages, { sender: 'buyer', text: "Let me check with my team." }])
        }, 1500)
    }

    if (loading) {
        return (
            <DashboardCard title="Loading Negotiation..." description="Please wait...">
                <Skeleton className="h-96 w-full" />
            </DashboardCard>
        )
    }
    
    if (!order) {
         return (
            <DashboardCard title="Order Not Found" description="The requested order could not be found.">
                <Link href="/farmer/orders">
                    <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Orders</Button>
                </Link>
            </DashboardCard>
        )
    }

    return (
        <DashboardCard
            title={`Negotiating Order: ${order.id}`}
            description={`Conversation with ${order.customer}.`}
        >
            <div className="flex flex-col h-[65vh]">
                <div className="flex-grow overflow-y-auto p-4 border rounded-t-lg bg-muted/20 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'farmer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'farmer' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
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
                        />
                        <Button onClick={handleSendMessage}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                     <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setNewMessage(`I can accept ₹${(order.amount * 0.95).toLocaleString()}.`)}>Suggest: ₹{(order.amount * 0.95).toLocaleString()}</Button>
                        <Button variant="outline" size="sm" onClick={() => setNewMessage(`My final offer is ₹${order.amount.toLocaleString()}.`)}>Stick to Original Price</Button>
                        <Button variant="secondary" size="sm" onClick={() => toast({title: "Offer Accepted!", description: "You have accepted the buyer's offer."})}>Accept Offer</Button>
                    </div>
                </div>
            </div>
        </DashboardCard>
    )
}

export default function FarmerNegotiatePage() {
    return (
        <Suspense fallback={<DashboardCard title="Loading..."><Skeleton className="h-96 w-full" /></DashboardCard>}>
            <NegotiateContent />
        </Suspense>
    )
}
