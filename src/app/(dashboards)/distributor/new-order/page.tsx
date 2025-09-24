
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from 'next/link'
import Image from 'next/image'

import { DashboardCard } from "@/components/dashboard-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getFarmerData, addOrder } from "@/ai/flows/farmer-flow"
import type { Product, FarmerProfile } from "@/ai/flows/farmer-flow"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { useI18n } from '@/contexts/i18n-context'

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const newOrderSchema = z.object({
  farmerId: z.string().min(1, "A farmer must be selected."),
  items: z.array(orderItemSchema).min(1, "You must add at least one product to the order."),
});

type NewOrderFormData = z.infer<typeof newOrderSchema>;

export default function NewOrderPage() {
  const router = useRouter()
  const { t } = useI18n();
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
      queryKey: ['farmerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" }), // Using FARM001 as a placeholder
      select: (data) => ({ products: data.products, farmers: data.farmers })
  });
  
  const products = data?.products || [];
  const farmers = data?.farmers || [];
  
  const form = useForm<NewOrderFormData>({
    resolver: zodResolver(newOrderSchema),
    defaultValues: {
      farmerId: "",
      items: [{ productId: "", quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const totalAmount = watchItems.reduce((acc, currentItem) => {
      const product = products.find(p => p.id === currentItem.productId);
      return acc + (product ? product.price * currentItem.quantity : 0);
  }, 0);

  const addOrderMutation = useMutation({
    mutationFn: (newOrder: z.infer<typeof newOrderSchema>) => addOrder({ ...newOrder, distributorId: "DIST001" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerData'] });
      toast({ title: t('success'), description: t('newOrderSuccess') });
      router.push("/distributor");
    },
    onError: (error) => {
      console.error("Failed to add order:", error)
      toast({ variant: "destructive", title: t('error'), description: t('newOrderError') });
    },
  });

  useEffect(() => {
    if (error) {
      toast({ variant: "destructive", title: t('error'), description: t('newOrderDataError') });
    }
  }, [error, toast, t]);

  const onSubmit = (data: NewOrderFormData) => {
    addOrderMutation.mutate(data);
  }

  if (isLoading) {
    return (
        <DashboardCard title={t('createNewOrder')} description={t('loadingFarmersAndProducts')}>
            <Skeleton className="w-full h-96" />
        </DashboardCard>
    );
  }


  return (
    <DashboardCard
      title={t('createNewOrder')}
      description={t('selectFarmerAndAddProducts')}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="farmerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('selectFarmer')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} required>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('chooseFarmer')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {farmers.map((farmer: FarmerProfile) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name} - {farmer.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <h3 className="text-lg font-medium mb-2">{t('orderItems')}</h3>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50%]">{t('product')}</TableHead>
                            <TableHead>{t('quantity')} (kg)</TableHead>
                            <TableHead>{t('pricePerKg')}</TableHead>
                            <TableHead>{t('subtotal')}</TableHead>
                            <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => {
                             const selectedProductId = watchItems[index]?.productId;
                             const selectedProduct = products.find(p => p.id === selectedProductId);
                             return (
                                <TableRow key={field.id}>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.productId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} required>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t('selectProduct')} />
                                                            </Trigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {products.map(product => (
                                                                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                     <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" min="1" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>₹{selectedProduct?.price?.toFixed(2) || '0.00'}</TableCell>
                                    <TableCell>₹{(selectedProduct ? selectedProduct.price * watchItems[index].quantity : 0).toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                             )
                        })}
                    </TableBody>
                </Table>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1 })} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> {t('addAnotherProduct')}
            </Button>
             {form.formState.errors.items && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>}
          </div>

          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <h3 className="text-lg font-bold">{t('totalOrderAmount')}:</h3>
                <p className="text-xl font-bold">₹{totalAmount.toFixed(2)}</p>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" asChild>
                <Link href="/distributor"><ArrowLeft className="mr-2 h-4 w-4" /> {t('cancel')}</Link>
            </Button>
            <Button type="submit" disabled={addOrderMutation.isPending}>
                {addOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('submitOrder')}
            </Button>
          </div>
        </form>
      </Form>
    </DashboardCard>
  )
}
