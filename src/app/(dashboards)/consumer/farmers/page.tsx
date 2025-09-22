
"use client"

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getFarmerData } from '@/app/actions/ai-actions'
import type { FavoriteFarmer } from '@/ai/flows/farmer-flow'

import { DashboardCard } from '@/components/dashboard-card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'
import { placeholderImages } from '@/lib/placeholder-images'
import { Star, MessageCircle, Info } from 'lucide-react'


export default function FavoriteFarmersPage() {
  const { t } = useI18n();
  const { toast } = useToast()

  const { data: favoriteFarmers, isLoading, error } = useQuery({
      queryKey: ['consumerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" }), // Placeholder ID
      select: (data) => data.favoriteFarmers,
  });

  useEffect(() => {
    if (error) {
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('favoriteFarmersError'),
        })
    }
  }, [error, toast, t]);

  return (
    <DashboardCard
      title={t('favoriteFarmers')}
      description={t('favoriteFarmersDescription')}
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : !favoriteFarmers || favoriteFarmers.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
            <Star className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="font-medium">{t('noFavoriteFarmers')}</p>
            <p className="text-sm">{t('noFavoriteFarmersDescription')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteFarmers.map(farmer => {
             const avatar = placeholderImages.find(p => p.id === farmer.avatarId);
            return (
              <div key={farmer.id} className="border rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      {avatar && <AvatarImage src={avatar.imageUrl} alt={farmer.name} />}
                      <AvatarFallback>{farmer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{farmer.name}</h3>
                      <p className="text-sm text-muted-foreground">{farmer.location}</p>
                    </div>
                  </div>
                  <p className="text-sm">
                    <strong className="font-medium">{t('specialty')}: </strong>
                    <span className="text-muted-foreground">{farmer.specialty}</span>
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="w-full" onClick={() => toast({ title: t('comingSoon'), description: t('viewProductsSoon') })}>
                    <Info className="mr-2 h-4 w-4" /> {t('viewProducts')}
                  </Button>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => toast({ title: t('comingSoon'), description: t('sendMessageSoon') })}>
                    <MessageCircle className="mr-2 h-4 w-4" /> {t('contact')}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardCard>
  )
}
