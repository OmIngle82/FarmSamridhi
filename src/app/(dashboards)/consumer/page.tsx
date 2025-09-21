"use client"

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardCard } from "@/components/dashboard-card"
import { placeholderImages } from "@/lib/placeholder-images"
import { Star, QrCode, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const purchases = [
  { id: "P001", name: "Fresh Tomatoes", farmer: "Suresh Patel", avatarId: "product-tomato", date: "2024-07-22", rating: 0 },
  { id: "P002", name: "Organic Wheat", farmer: "Priya Singh", avatarId: "product-wheat", date: "2024-07-20", rating: 5 },
]

export default function ConsumerDashboard() {
  const { toast } = useToast()
  const [ratings, setRatings] = useState(purchases.reduce((acc, p) => ({...acc, [p.id]: p.rating }), {} as Record<string, number>));
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({});

  const handleSetRating = (id: string, rating: number) => {
    setRatings(prev => ({...prev, [id]: rating}));
  }
  
  const handleSetHoverRating = (id: string, rating: number) => {
    setHoverRatings(prev => ({...prev, [id]: rating}));
  }

  const showToast = (title: string, description: string) => {
    toast({
        title,
        description,
    });
  };

  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
      <DashboardCard
        title="Track Product Journey"
        description="Scan a QR code or enter the ID to see your food's story."
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input placeholder="Enter Product ID" />
            <Button onClick={() => showToast('Product Tracking', 'Feature coming soon!')}>Track</Button>
          </div>
          <Button variant="outline" className="w-full" onClick={() => showToast('QR Scanner', 'Opening QR code scanner...')}>
            <QrCode className="mr-2 h-4 w-4" /> Scan QR Code
          </Button>
        </div>
      </DashboardCard>
      
      <DashboardCard
        title="Rate Products & Provide Feedback"
        description="Help farmers and other consumers with your reviews."
        className="lg:col-span-2"
      >
        <div className="space-y-6">
          {purchases.map(purchase => {
            const image = placeholderImages.find(p => p.id === purchase.avatarId);
            const currentRating = ratings[purchase.id] || 0;
            const hoverRating = hoverRatings[purchase.id] || 0;

            return (
              <div key={purchase.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
                <div className='flex items-center gap-4 flex-1'>
                    <Avatar className="h-16 w-16">
                    <AvatarImage src={image?.imageUrl} alt={purchase.name} data-ai-hint={image?.imageHint} />
                    <AvatarFallback>{purchase.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                    <h3 className="font-semibold">{purchase.name}</h3>
                    <p className="text-sm text-muted-foreground">From {purchase.farmer}</p>
                    <p className="text-xs text-muted-foreground">Purchased on {purchase.date}</p>
                    </div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    <div className="flex items-center" onMouseLeave={() => handleSetHoverRating(purchase.id, 0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                            key={star}
                            className={`h-6 w-6 cursor-pointer transition-colors ${
                                (hoverRating || currentRating) >= star
                                ? 'text-accent fill-accent'
                                : 'text-muted-foreground/50'
                            }`}
                            onMouseEnter={() => handleSetHoverRating(purchase.id, star)}
                            onClick={() => {
                                handleSetRating(purchase.id, star)
                                showToast('Rating Submitted', `You rated ${purchase.name} ${star} stars.`)
                            }}
                            />
                        ))}
                    </div>
                    <div className="flex w-full gap-2">
                        <Input placeholder="Leave feedback..." className="h-9"/>
                        <Button size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => showToast('Feedback Sent', 'Thank you for your feedback!')}><Send className="h-4 w-4"/></Button>
                    </div>
                </div>
              </div>
            )
          })}
        </div>
      </DashboardCard>
    </div>
  )
}
