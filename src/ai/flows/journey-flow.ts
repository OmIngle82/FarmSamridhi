'use server';
/**
 * @fileOverview A flow to retrieve the journey of a product.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProductJourneyRequestSchema = z.object({
  productId: z.string().describe('The ID of the product to fetch the journey for.'),
});

const JourneyStepSchema = z.object({
  date: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  icon: z.enum(["seeding", "harvest", "transit", "warehouse", "retail"]),
});

const ProductJourneyDataSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string(),
  }),
  farmer: z.object({
    name: z.string(),
    avatar: z.string(),
    location: z.string(),
    farmSize: z.string(),
    memberSince: z.string(),
  }),
  journey: z.array(JourneyStepSchema),
});

export type ProductJourneyData = z.infer<typeof ProductJourneyDataSchema>;


const mockJourneyData: ProductJourneyData = {
    product: {
        id: "PROD001",
        name: "Organic Tomatoes",
        image: "https://picsum.photos/seed/prod-tomato/600/400",
    },
    farmer: {
        name: "Suresh Patel",
        avatar: "https://picsum.photos/seed/avatar1/100/100",
        location: "Nashik, Maharashtra",
        farmSize: "15 Acres",
        memberSince: "2021",
    },
    journey: [
        {
            date: "2024-05-10",
            title: "Seeding",
            description: "High-quality organic tomato seeds were sown in nutrient-rich soil.",
            location: "Suresh Patel's Farm, Nashik",
            icon: "seeding",
        },
        {
            date: "2024-07-15",
            title: "Harvest",
            description: "Ripe, juicy tomatoes were hand-picked at peak freshness by local workers.",
            location: "Suresh Patel's Farm, Nashik",
            icon: "harvest",
        },
        {
            date: "2024-07-16",
            title: "In Transit",
            description: "Transported in a temperature-controlled truck to maintain quality.",
            location: "Nashik to Mumbai",
            icon: "transit",
        },
        {
            date: "2024-07-17",
            title: "Warehouse",
            description: "Stored at the main distribution center after quality checks.",
            location: "Distributor Warehouse, Mumbai",
            icon: "warehouse",
        },
         {
            date: "2024-07-18",
            title: "Available at Retail",
            description: "Reached your local store, ready for purchase.",
            location: "Local Grocery Store, Mumbai",
            icon: "retail",
        },
    ]
}


export async function getProductJourney(
  input: z.infer<typeof ProductJourneyRequestSchema>
): Promise<ProductJourneyData> {
  return getProductJourneyFlow(input);
}


const getProductJourneyFlow = ai.defineFlow(
  {
    name: 'getProductJourneyFlow',
    inputSchema: ProductJourneyRequestSchema,
    outputSchema: ProductJourneyDataSchema,
  },
  async ({ productId }) => {
    // In a real application, you would fetch this data from a database
    // based on the productId. For this prototype, we'll return mock data.
    console.log(`Fetching journey data for product: ${productId}`);

    // Here we can use an LLM to generate more creative descriptions
    // For now, we return mock data.

    return mockJourneyData;
  }
);
