'use server';
/**
 * @fileOverview A plant problem diagnosis AI agent.
 *
 * - diagnosePlant - A function that handles the plant diagnosis process.
 * - DiagnosePlantInput - The input type for the diagnosePlant function.
 * - DiagnosePlantOutput - The return type for the diagnosePlant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DiagnosePlantInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('A description of the plant or any visible symptoms.'),
});
export type DiagnosePlantInput = z.infer<typeof DiagnosePlantInputSchema>;

const DiagnosePlantOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the image appears to contain a plant.'),
    commonName: z.string().describe('The common name of the identified plant.'),
    latinName: z.string().describe('The Latin name of the identified plant.'),
  }),
  diagnosis: z.object({
    isHealthy: z.boolean().describe('Whether or not the plant appears to be healthy.'),
    healthDescription: z.string().describe("A summary of the plant's health status."),
    cause: z.string().describe("The likely cause of the issue (e.g., 'Fungal Infection', 'Aphid Infestation', 'Nitrogen Deficiency')."),
    remediation: z.string().describe('A detailed, step-by-step suggestion for how to fix the issue.'),
  }),
});
export type DiagnosePlantOutput = z.infer<typeof DiagnosePlantOutputSchema>;

export async function diagnosePlant(input: DiagnosePlantInput): Promise<DiagnosePlantOutput> {
  return diagnosePlantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePlantPrompt',
  input: {schema: DiagnosePlantInputSchema},
  output: {schema: DiagnosePlantOutputSchema},
  prompt: `You are an expert botanist and plant pathologist, specializing in diagnosing plant illnesses from images.

You will be provided with an image of a plant and a user-provided description.

Your tasks are:
1.  Identify the plant in the image. If it's not a plant, set 'isPlant' to false and explain why.
2.  Assess the plant's health based on the image and description.
3.  If the plant is unhealthy, identify the most likely cause (disease, pest, deficiency, etc.).
4.  Provide a clear, actionable remediation plan for the farmer to follow.

Use the following information as the primary source for your analysis.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}`,
});

const diagnosePlantFlow = ai.defineFlow(
  {
    name: 'diagnosePlantFlow',
    inputSchema: DiagnosePlantInputSchema,
    outputSchema: DiagnosePlantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to get a diagnosis from the model.");
    }
    return output;
  }
);
