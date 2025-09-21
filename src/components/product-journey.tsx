"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardCard } from "@/components/dashboard-card"
import type { ProductJourneyData } from "@/ai/flows/journey-flow"
import { ArrowLeft } from "lucide-react"

const iconMap: { [key: string]: React.ReactNode } = {
    seeding: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <path d="M4 22h16"/>
            <path d="M6 18h12"/>
            <path d="M6 14h12"/>
            <path d="M12 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/>
            <path d="M12 14v4"/>
        </svg>
    ),
    harvest: (
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <path d="M8.5 21.5 18 12 16 2l-6 6-1.5-1.5L2 14l6.5 7.5Z"/>
            <path d="m17 8 5 5"/>
        </svg>
    ),
    transit: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
            <path d="M14 9h4l4 4v4h-8v-4h-4V9Z"/>
            <circle cx="7" cy="18" r="2"/>
            <circle cx="17" cy="18" r="2"/>
        </svg>
    ),
    warehouse: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
            <path d="M6 18h12"/>
            <path d="M6 14h12"/>
            <path d="M12 14v4"/>
        </svg>
    ),
    retail: (
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M12 22V12"/>
            <path d="M15 12a3 3 0 0 0-6 0"/>
        </svg>
    ),
}

type ProductJourneyProps = {
    journeyData: ProductJourneyData;
    onReset: () => void;
}

export function ProductJourney({ journeyData, onReset }: ProductJourneyProps) {
    const { product, farmer, journey } = journeyData;

    return (
         <DashboardCard 
            title={`Journey of ${product.name}`}
            description={`Product ID: ${product.id}`}
        >
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-lg bg-secondary/50">
                    <div className="relative w-48 h-32 rounded-md overflow-hidden">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-xl">{product.name}</h3>
                        <p className="text-muted-foreground">Follow the complete journey of this product from the farm to your hands.</p>
                    </div>
                     <Button onClick={onReset} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Scan Another
                    </Button>
                </div>

                 <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Grown with care by</h3>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={farmer.avatar} alt={farmer.name} />
                            <AvatarFallback>{farmer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{farmer.name}</p>
                            <p className="text-sm text-muted-foreground">{farmer.location}</p>
                            <p className="text-xs text-muted-foreground">
                                {farmer.farmSize} farm, member since {farmer.memberSince}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Timeline</h3>
                    <div className="relative pl-8">
                        {/* Vertical Line */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border"></div>

                        {journey.map((step, index) => (
                        <div key={index} className="mb-8 relative">
                            {/* Icon Circle */}
                            <div className="absolute -left-5 top-1 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                {iconMap[step.icon]}
                            </div>
                            
                            <div className="pl-4">
                                <p className="text-sm font-semibold text-primary">{step.date}</p>
                                <h4 className="font-semibold">{step.title}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">{step.location}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
         </DashboardCard>
    )
}
