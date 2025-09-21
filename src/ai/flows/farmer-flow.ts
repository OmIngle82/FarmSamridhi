'use server';
/**
 * @fileOverview A flow to retrieve all data for the farmer dashboard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FarmerDataRequestSchema = z.object({
  farmerId: z.string().describe('The ID of the farmer to fetch data for.'),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

const AddProductRequestSchema = z.object({
    farmerId: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string().optional(),
});

const UpdateProductRequestSchema = ProductSchema;

const DeleteProductRequestSchema = z.object({
    productId: z.string(),
});

const OrderSchema = z.object({
  id: z.string(),
  customer: z.string(),
  amount: z.number(),
  status: z.string(),
  phone: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;

const PaymentSchema = z.object({
  id: z.string(),
  from: z.string(),
  amount: z.number(),
  date: z.string(),
});

const MarketPriceSchema = z.object({
  crop: z.string(),
  price: z.number(),
  target: z.number(),
});

const SchemeSchema = z.object({
  name: z.string(),
  description: z.string(),
  eligibility: z.string(),
});

const FarmerDataSchema = z.object({
  products: z.array(ProductSchema),
  orders: z.array(OrderSchema),
  payments: z.array(PaymentSchema),
  marketPrices: z.array(MarketPriceSchema),
  schemes: z.array(SchemeSchema),
});

export type FarmerData = z.infer<typeof FarmerDataSchema>;

// Mock database
let mockProducts: Product[] = [
    { id: "PROD001", name: "Organic Tomatoes", description: "Fresh, juicy, and organically grown tomatoes.", price: 30, quantity: 500, image: "https://picsum.photos/seed/prod-tomato/400/300" },
    { id: "PROD002", name: "Sonora Wheat", description: "High-quality wheat grains, perfect for baking.", price: 25, quantity: 2000, image: "https://picsum.photos/seed/prod-wheat/400/300" },
];
let mockOrders: Order[] = [
    { id: "ORD001", customer: "BigBasket", amount: 12500, status: "Pending", phone: "9123456780" },
    { id: "ORD002", customer: "Local Mandi", amount: 8200, status: "Shipped", phone: "9123456781" },
    { id: "ORD003", customer: "Reliance Fresh", amount: 25000, status: "Pending", phone: "9123456782" },
];
let mockPayments = [
    {id: "PAY001", from: "BigBasket", amount: 12500, date: "2024-07-20"},
    {id: "PAY002", from: "Govt. Subsidy", amount: 5000, date: "2024-07-18"},
    {id: "PAY003", from: "Local Mandi", amount: 8200, date: "2024-07-15"},
];
const mockMarketPrices = [
    { crop: "Wheat", price: 2150, target: 2200 },
    { crop: "Tomato", price: 1800, target: 2000 },
    { crop: "Potato", price: 2300, target: 2250 },
    { crop: "Onion", price: 2500, target: 2600 },
    { crop: "Paddy", price: 2040, target: 2100 },
];
const mockSchemes = [
    {
        name: "PM-KISAN Scheme",
        description: "Income support of ₹6,000/year for all landholding farmer families.",
        eligibility: "All landholding farmer families."
    },
    {
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        description: "Insurance coverage and financial support to farmers in the event of failure of any of the notified crops as a result of natural calamities, pests & diseases.",
        eligibility: "All farmers including sharecroppers and tenant farmers growing notified crops in the notified areas are eligible for coverage."
    },
    {
        name: "Kisan Credit Card (KCC) Scheme",
        description: "Provides farmers with timely access to credit for their cultivation needs as well as for non-farm activities.",
        eligibility: "All farmers - individuals/joint borrowers who are owner cultivators."
    }
];

export async function getFarmerData(
  input: z.infer<typeof FarmerDataRequestSchema>
): Promise<FarmerData> {
  return getFarmerDataFlow(input);
}

export async function getProducts(
  input: z.infer<typeof FarmerDataRequestSchema>
): Promise<Product[]> {
    console.log(`Fetching products for farmer: ${input.farmerId}`);
    return Promise.resolve(mockProducts);
}

export async function getOrder(
  orderId: string
): Promise<Order | undefined> {
    console.log(`Fetching order: ${orderId}`);
    return Promise.resolve(mockOrders.find(o => o.id === orderId));
}

export async function addProduct(
    input: z.infer<typeof AddProductRequestSchema>
): Promise<Product> {
    return addProductFlow(input);
}

export async function updateProduct(
    input: Product
): Promise<Product> {
    return updateProductFlow(input);
}

export async function deleteProduct(
    input: z.infer<typeof DeleteProductRequestSchema>
): Promise<{ success: boolean }> {
    return deleteProductFlow(input);
}

const getFarmerDataFlow = ai.defineFlow(
  {
    name: 'getFarmerDataFlow',
    inputSchema: FarmerDataRequestSchema,
    outputSchema: FarmerDataSchema,
  },
  async ({ farmerId }) => {
    console.log(`Fetching data for farmer: ${farmerId}`);

    return {
      products: mockProducts,
      orders: mockOrders,
      payments: mockPayments,
      marketPrices: mockMarketPrices,
      schemes: mockSchemes,
    };
  }
);


const addProductFlow = ai.defineFlow(
  {
    name: 'addProductFlow',
    inputSchema: AddProductRequestSchema,
    outputSchema: ProductSchema,
  },
  async (productData) => {
    console.log(`Adding product for farmer: ${productData.farmerId}`);
    const newProduct: Product = {
      id: `PROD${String(mockProducts.length + 10).padStart(3, '0')}`, // Make ID more unique
      ...productData,
    };
    mockProducts.push(newProduct);
    return newProduct;
  }
);

const updateProductFlow = ai.defineFlow(
  {
    name: 'updateProductFlow',
    inputSchema: UpdateProductRequestSchema,
    outputSchema: ProductSchema,
  },
  async (productData) => {
    console.log(`Updating product: ${productData.id}`);
    const index = mockProducts.findIndex(p => p.id === productData.id);
    if (index !== -1) {
        mockProducts[index] = productData;
        return mockProducts[index];
    }
    throw new Error("Product not found");
  }
);

const deleteProductFlow = ai.defineFlow(
  {
    name: 'deleteProductFlow',
    inputSchema: DeleteProductRequestSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ productId }) => {
    console.log(`Deleting product: ${productId}`);
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
        mockProducts.splice(index, 1);
        return { success: true };
    }
    return { success: false };
  }
);
