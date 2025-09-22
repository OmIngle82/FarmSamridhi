'use server';
/**
 * @fileOverview A flow to suggest product details using AI.
 * - suggestProductDetails - A function that suggests a description and image for a product.
 * - SuggestProductDetailsInput - The input type for the function.
 * - SuggestProductDetailsOutput - The return type for the function.
 */

import { ai } from '@/lib/genkit';
import { z } from 'zod';
import { generate } from 'genkit';

const SuggestProductDetailsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
});
export type SuggestProductDetailsInput = z.infer<typeof SuggestProductDetailsInputSchema>;

const SuggestProductDetailsOutputSchema = z.object({
  description: z.string().describe('A suggested description for the product.'),
  imageUrl: z.string().describe('A URL for a suggested image for the product.'),
});
export type SuggestProductDetailsOutput = z.infer<typeof SuggestProductDetailsOutputSchema>;

export async function suggestProductDetails(
  input: SuggestProductDetailsInput
): Promise<SuggestProductDetailsOutput> {
  return suggestProductDetailsFlow(input);
}

const descriptionPrompt = ai.definePrompt({
  name: 'suggestProductDescriptionPrompt',
  input: { schema: SuggestProductDetailsInputSchema },
  output: { schema: z.object({ description: z.string() }) },
  prompt: `You are an expert in agricultural marketing. Write a short, appealing, and informative product description for the following product: {{{productName}}}. The description should be suitable for an e-commerce platform connecting farmers to consumers. Focus on freshness, quality, and origin. Keep it to 2-3 sentences.`,
  config: {
    temperature: 0.7,
  }
});


const suggestProductDetailsFlow = ai.defineFlow(
  {
    name: 'suggestProductDetailsFlow',
    inputSchema: SuggestProductDetailsInputSchema,
    outputSchema: SuggestProductDetailsOutputSchema,
  },
  async ({ productName }) => {
    
    // Generate description and image in parallel
    const [descriptionResponse, imageResponse] = await Promise.all([
      descriptionPrompt({ productName }),
      generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `A vibrant, high-quality, professional photo of ${productName} on a clean, neutral background.`,
      })
    ]);

    const description = descriptionResponse.output?.description || '';
    const imageUrl = imageResponse.media.url || '';

    if (!description || !imageUrl) {
        throw new Error("Failed to generate product details.");
    }

    return { description, imageUrl };
  }
);
