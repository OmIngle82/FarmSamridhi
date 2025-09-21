'use server';
/**
 * @fileOverview A flow to retrieve all data for the farmer dashboard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FarmerDataRequestSchema = z.object({
  farmerId: z.string().describe('The ID of the farmer to fetch data for.'),
});

const OrderSchema = z.object({
  id: z.string(),
  customer: z.string(),
  amount: z.number(),
  status: z.string(),
  phone: z.string(),
});

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
  orders: z.array(OrderSchema),
  payments: z.array(PaymentSchema),
  marketPrices: z.array(MarketPriceSchema),
  schemes: z.array(SchemeSchema),
});

export type FarmerData = z.infer<typeof FarmerDataSchema>;

export async function getFarmerData(
  input: z.infer<typeof FarmerDataRequestSchema>
): Promise<FarmerData> {
  return getFarmerDataFlow(input);
}

const getFarmerDataFlow = ai.defineFlow(
  {
    name: 'getFarmerDataFlow',
    inputSchema: FarmerDataRequestSchema,
    outputSchema: FarmerDataSchema,
  },
  async ({ farmerId }) => {
    // In a real application, you would fetch this data from a database
    // based on the farmerId. For this prototype, we'll return mock data.
    console.log(`Fetching data for farmer: ${farmerId}`);

    const orders = [
      { id: "ORD001", customer: "BigBasket", amount: 12500, status: "Pending", phone: "9123456780" },
      { id: "ORD002", customer: "Local Mandi", amount: 8200, status: "Shipped", phone: "9123456781" },
      { id: "ORD003", customer: "Reliance Fresh", amount: 25000, status: "Pending", phone: "9123456782" },
    ];

    const payments = [
        {id: "PAY001", from: "BigBasket", amount: 12500, date: "2024-07-20"},
        {id: "PAY002", from: "Govt. Subsidy", amount: 5000, date: "2024-07-18"},
        {id: "PAY003", from: "Local Mandi", amount: 8200, date: "2024-07-15"},
    ];

    const marketPrices = [
      { crop: "Wheat", price: 2150, target: 2200 },
      { crop: "Tomato", price: 1800, target: 2000 },
      { crop: "Potato", price: 2300, target: 2250 },
      { crop: "Onion", price: 2500, target: 2600 },
      { crop: "Paddy", price: 2040, target: 2100 },
    ]

    const schemes = [
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
    ]
    
    return {
      orders,
      payments,
      marketPrices,
      schemes,
    };
  }
);
