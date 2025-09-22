
"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import Image from "next/image"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardCard } from "@/components/dashboard-card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useToast } from "@/hooks/use-toast"
import { addProduct, getFarmerData, updateProduct, deleteProduct, suggestProductDetails } from "@/app/actions/ai-actions"
import type { Product } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { Upload, X, Trash2, Edit, Sparkles, Loader2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useI18n } from '@/contexts/i18n-context'

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  image: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

function ProductsPageContent() {
  const { t } = useI18n();
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false);
  const suggestionAppliedRef = useRef(false);

  const { data: products = [], isLoading: loading, error } = useQuery<Product[]>({
      queryKey: ['farmerData'],
      queryFn: () => getFarmerData({ farmerId: "FARM001" }),
      select: (data) => data.products,
  });

  useEffect(() => {
    if (error) {
        console.error("Failed to fetch products:", error)
        toast({
          variant: "destructive",
          title: t('error'),
          description: t('productsError'),
        })
    }
  }, [error, toast, t]);

  const addProductMutation = useMutation({
    mutationFn: (newProduct: Omit<ProductFormData, 'id'>) => addProduct({ farmerId: "FARM001", ...newProduct }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerData'] });
      toast({ title: t('success'), description: t('productAddedSuccess') });
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to add product:", error)
      toast({ variant: "destructive", title: t('error'), description: t('addProductError') });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct: Product) => updateProduct(updatedProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerData'] });
      toast({ title: t('success'), description: t('productUpdatedSuccess') });
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to update product:", error);
      toast({ variant: "destructive", title: t('error'), description: t('updateProductError') });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct({ productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerData'] });
      toast({ title: t('success'), description: t('productDeletedSuccess') });
    },
    onError: (error) => {
      console.error("Failed to delete product:", error);
      toast({ variant: "destructive", title: t('error'), description: t('deleteProductError') });
    },
  });


  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      image: "",
    },
  })
  
  useEffect(() => {
    const newProductName = searchParams.get("newProductName");
    if (newProductName && form.getValues('name') !== newProductName && !isEditing) {
        if (!suggestionAppliedRef.current) {
            suggestionAppliedRef.current = true;
            form.setValue("name", newProductName);
            toast({
                title: t('addNewProduct'),
                description: `${t('generatingSuggestionsFor')} "${newProductName}"...`,
            });

            const getSuggestions = async () => {
                setIsSuggesting(true);
                try {
                    const suggestions = await suggestProductDetails({ productName: newProductName });
                    form.setValue("description", suggestions.description);
                    form.setValue("image", suggestions.imageUrl);
                    setImagePreview(suggestions.imageUrl);
                    toast({
                        title: t('suggestionsApplied'),
                        description: t('suggestionsAppliedDescription'),
                    });
                } catch (err) {
                    console.error("Failed to get suggestions:", err);
                    toast({
                        variant: "destructive",
                        title: t('suggestionFailed'),
                        description: t('suggestionFailedDescription'),
                    });
                } finally {
                    setIsSuggesting(false);
                }
            };

            getSuggestions();
        }
    }
  }, [searchParams, form, toast, isEditing, t]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setImagePreview(dataUrl)
        form.setValue("image", dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const removeImage = () => {
    setImagePreview(null);
    form.setValue("image", "");
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }
  
  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      image: "",
    })
    removeImage()
    setIsEditing(false)
    suggestionAppliedRef.current = false;
  }

  const handleEditClick = (product: Product) => {
    setIsEditing(true);
    form.reset(product);
    setImagePreview(product.image || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  
  const handleDeleteClick = (productId: string) => {
     deleteProductMutation.mutate(productId);
  }


  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    if (isEditing) {
      updateProductMutation.mutate(data as Product);
    } else {
      addProductMutation.mutate(data);
    }
  }

  const isMutating = addProductMutation.isPending || updateProductMutation.isPending;

  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
      <DashboardCard
        title={isEditing ? t('editProduct') : t('addNewProduct')}
        description={isEditing ? t('updateProductItem') : t('fillProductDetails')}
        className="lg:col-span-1"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <div className="space-y-2">
              <Label>{t('productImage')}</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isMutating}
              />
              {imagePreview ? (
                 <div className="relative group">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      width={400}
                      height={300}
                      className="rounded-lg object-cover w-full aspect-[4/3]"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeImage}
                      disabled={isMutating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed flex flex-col items-center justify-center"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isSuggesting || isMutating}
                >
                  {isSuggesting ? (
                    <>
                      <Sparkles className="h-8 w-8 animate-pulse text-primary" />
                      <span className="text-muted-foreground mt-2">{t('generatingImage')}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-muted-foreground mt-2">{t('uploadImage')}</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('productName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('productNamePlaceholder')} {...field} disabled={isMutating}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>{t('description')}</FormLabel>
                     {isSuggesting && <span className="text-xs text-muted-foreground">{t('generating')}...</span>}
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder={t('productDescriptionPlaceholder')}
                      {...field}
                      disabled={isSuggesting || isMutating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pricePerKg')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25" {...field} disabled={isMutating}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('quantity')} (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} disabled={isMutating}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
                {isEditing && (
                    <Button type="button" variant="secondary" className="w-full" onClick={resetForm} disabled={isMutating}>
                        {t('cancel')}
                    </Button>
                )}
                <Button type="submit" className="w-full" disabled={isSuggesting || isMutating}>
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {addProductMutation.isPending ? t('adding') : updateProductMutation.isPending ? t('saving') : isEditing ? t('saveChanges') : t('addProduct')}
                </Button>
            </div>
          </form>
        </Form>
      </DashboardCard>
      <DashboardCard
        title={t('myProducts')}
        description={t('yourProductList')}
        className="lg:col-span-2"
      >
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                ))}
            </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
            <p className="text-lg font-medium">{t('noProductsYet')}</p>
            <p>{t('useFormToAddProduct')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden group">
                <div className="relative h-48 bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-secondary text-muted-foreground">
                      {t('noImage')}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground h-10 overflow-hidden">{product.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-xl">₹{product.price}/kg</span>
                    <span className="text-sm text-muted-foreground">{product.quantity} {t('kgAvailable')}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                     <Button variant="outline" size="sm" className="w-full" onClick={() => handleEditClick(product)}>
                        <Edit className="mr-2 h-4 w-4" /> {t('edit')}
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full">
                                <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('deleteProductWarning', { productName: product.name })}
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteClick(product.id!)} disabled={deleteProductMutation.isPending}>
                                {deleteProductMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('delete')}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

export default function FarmerProductsPage() {
    const { t } = useI18n();
    return (
        <Suspense fallback={<DashboardCard title={`${t('loading')} ${t('myProducts')}...`}><Skeleton className="h-96 w-full" /></DashboardCard>}>
            <ProductsPageContent />
        </Suspense>
    )
}
