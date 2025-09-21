"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DashboardCard } from "@/components/dashboard-card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { addProduct, getProducts, type Product } from "@/ai/flows/farmer-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { Upload, X } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  image: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export default function FarmerProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
    async function fetchProducts() {
      try {
        setLoading(true)
        const fetchedProducts = await getProducts({ farmerId: "FARM001" })
        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Failed to fetch products:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load products.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [toast])

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
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }


  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    try {
      const newProduct = await addProduct({
        farmerId: "FARM001",
        ...data,
      })
      setProducts((prev) => [...prev, newProduct])
      toast({
        title: "Success",
        description: "Product added successfully.",
      })
      form.reset()
      removeImage()
    } catch (error) {
      console.error("Failed to add product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add product.",
      })
    }
  }

  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
      <DashboardCard
        title="Add a New Product"
        description="Fill out the details to list a new item for sale."
        className="lg:col-span-1"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <div className="space-y-2">
              <Label>Product Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
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
                    >
                      <X className="h-4 w-4" />
                    </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span>Upload Image</span>
                  </div>
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Fresh Tomatoes" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Organically grown, hand-picked tomatoes from our farm."
                      {...field}
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
                    <FormLabel>Price (₹ per kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="25" {...field} />
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
                    <FormLabel>Quantity (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </form>
        </Form>
      </DashboardCard>
      <DashboardCard
        title="My Products"
        description="A list of all your current products."
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
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="text-lg font-medium">No products yet.</p>
            <p>Use the form on the left to add your first product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden group">
                <div className="relative h-48 bg-muted">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground h-10 overflow-hidden">{product.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-xl">₹{product.price}/kg</span>
                    <span className="text-sm text-muted-foreground">{product.quantity} kg available</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                     <Button variant="outline" size="sm" className="w-full" onClick={() => toast({title: "Coming Soon", description:"Editing products will be available soon."})}>Edit</Button>
                     <Button variant="destructive" size="sm" className="w-full" onClick={() => toast({title: "Coming Soon", description:"Deleting products will be available soon."})}>Delete</Button>
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
