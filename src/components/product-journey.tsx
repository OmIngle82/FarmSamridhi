
"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardCard } from "@/components/dashboard-card"
import type { ProductJourneyData } from "@/ai/flows/journey-flow"
import { ArrowLeft, Sprout, Milestone, Truck, Warehouse, Store } from "lucide-react"
import { useI18n } from "@/contexts/i18n-context"

const iconMap: { [key: string]: React.ReactNode } = {
    seeding: <Sprout className="h-5 w-5 text-primary" />,
    harvest: <Milestone className="h-5 w-5 text-primary" />,
    transit: <Truck className="h-5 w-5 text-primary" />,
    warehouse: <Warehouse className="h-5 w-5 text-primary" />,
    retail: <Store className="h-5 w-5 text-primary" />,
}

type ProductJourneyProps = {
    journeyData: ProductJourneyData;
    onReset: () => void;
    resetText?: string;
}

export function ProductJourney({ journeyData, onReset, resetText }: ProductJourneyProps) {
    const { t } = useI18n();
    const { product, farmer, journey } = journeyData;
    const effectiveResetText = resetText || t('scanAnother');

    return (
         <DashboardCard 
            title={`${t('journeyOf')} ${product.name}`}
            description={`${t('productId')}: ${product.id}`}
        >
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-lg bg-secondary/50">
                    <div className="relative w-48 h-32 rounded-md overflow-hidden">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-xl">{product.name}</h3>
                        <p className="text-muted-foreground">{t('followJourney')}</p>
                    </div>
                     <Button onClick={onReset} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        {effectiveResetText}
                    </Button>
                </div>

                 <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{t('grownWithCareBy')}</h3>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={farmer.avatar} alt={farmer.name} />
                            <AvatarFallback>{farmer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{farmer.name}</p>
                            <p className="text-sm text-muted-foreground">{farmer.location}</p>
                            <p className="text-xs text-muted-foreground">
                                {farmer.farmSize} farm, {t('memberSince')} {farmer.memberSince}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('timeline')}</h3>
                    <div className="relative pl-8">
                        {/* Vertical Line */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border"></div>

                        {journey.map((step, index) => (
                        <div key={index} className="mb-8 relative">
                            {/* Icon Circle */}
                            <div className="absolute -left-5 top-1 h-8 w-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                {iconMap[step.icon] || <Milestone className="h-5 w-5 text-primary" />}
                            </div>
                            
                            <div className="pl-4">
                                <p className="text-sm font-semibold text-primary">{step.date}</p>
                                <h4 className="font-semibold">{t(step.icon as any) || step.title}</h4>
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
