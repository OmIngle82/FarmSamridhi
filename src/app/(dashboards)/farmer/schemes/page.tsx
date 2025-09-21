"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "@/components/dashboard-card"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { getFarmerData } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"

export default function FarmerSchemesPage() {
  const { toast } = useToast()

  const { data: schemes, isLoading: loading, error } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const data = await getFarmerData({ farmerId: "FARM001" });
      return data.schemes;
    }
  });

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch schemes:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load government schemes.",
        })
    }
  }, [error, toast]);


  const showToast = (title: string, description: string) => {
    toast({
        title,
        description,
    });
  };

  return (
    <DashboardCard
      title="Government Schemes"
      description="Stay updated on all beneficial government programs for farmers."
    >
      {loading ? (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : !schemes || schemes.length === 0 ? (
         <div className="text-center text-muted-foreground">No schemes available at the moment.</div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
            {schemes.map(scheme => (
                <AccordionItem value={scheme.name} key={scheme.name}>
                    <AccordionTrigger>{scheme.name}</AccordionTrigger>
                    <AccordionContent>
                        <p className="mb-2">{scheme.description}</p>
                        <p><strong className="font-medium">Eligibility: </strong>{scheme.eligibility}</p>
                        <Button variant="link" className="px-0 h-auto mt-2" onClick={() => showToast('Learn More', `Opening details for ${scheme.name}`)}>Learn More</Button>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      )}
    </DashboardCard>
  )
}
