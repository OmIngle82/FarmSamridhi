
'use server';
/**
 * @fileOverview A flow to handle voice commands.
 * - handleVoiceCommand - A function that processes audio and returns a structured command.
 * - VoiceCommandInput - The input type for the handleVoiceCommand function.
 * - VoiceCommandOutput - The return type for the handleVoiceCommand function.
 */

import {ai} from '@/lib/genkit';
import {z} from 'zod';
import { generate } from 'genkit';

const VoiceCommandInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A Base64 encoded audio chunk as a data URI. Expected format: 'data:audio/webm;base64,<encoded_data>'."
    ),
});
export type VoiceCommandInput = z.infer<typeof VoiceCommandInputSchema>;

const VoiceCommandOutputSchema = z.object({
  action: z.enum(['navigate', 'addProduct', 'filter', 'unknown']),
  target: z.string().describe("The navigation path, the name of the product to add, or the data type to filter."),
  payload: z.any().optional().describe("An optional payload for the action, like filter criteria."),
  feedback: z.string().describe("Feedback to the user about the action taken."),
});
export type VoiceCommandOutput = z.infer<typeof VoiceCommandOutputSchema>;


export async function handleVoiceCommand(
  input: VoiceCommandInput
): Promise<VoiceCommandOutput> {
  return voiceCommandFlow(input);
}


const voiceCommandFlow = ai.defineFlow(
  {
    name: 'voiceCommandFlow',
    inputSchema: VoiceCommandInputSchema,
    outputSchema: VoiceCommandOutputSchema,
  },
  async ({ audioDataUri }) => {
    
    const llmResponse = await generate({
      model: 'gemini-1.5-flash',
      prompt: [
        {
          text: `You are a voice command interpreter for a farming application. Your task is to understand the user's spoken command and translate it into a structured action.

The user's command is provided as an audio file. Your response must be in the following JSON format: { "action": "...", "target": "...", "payload": "...", "feedback": "..." }

Possible actions are:
1.  "navigate": For navigation requests. The "target" should be a valid path from the list below.
2.  "addProduct": For requests to add a product. The "target" should be the name of the product mentioned.
3.  "filter": For requests to filter or view a subset of data on a page. The "target" is the data type (e.g., "orders"), and "payload" contains filter criteria (e.g., { "status": "Pending" }).
4.  "unknown": If the command is unclear or not related to the available actions. The "target" and "payload" should be empty, and the feedback should ask the user to try again.

Valid Navigation Targets:
- /farmer
- /farmer/products
- /farmer/orders
- /farmer/payments
- /farmer/market
- /farmer/finances
- /farmer/schemes
- /farmer/profile
- /distributor
- /retailer
- /consumer

Examples:
- If the user says "Go to my products", you should return:
  { "action": "navigate", "target": "/farmer/products", "feedback": "Navigating to your products page." }
- If the user says "Show me my pending orders", you should return:
  { "action": "filter", "target": "orders", "payload": { "status": "Pending" }, "feedback": "Showing pending orders." }
- If the user says "Add a new product called Organic Bananas", you should return:
  { "action": "addProduct", "target": "Organic Bananas", "feedback": "Understood. Please fill in the rest of the details for Organic Bananas." }
- If the user says "What's the weather like?", you should return:
  { "action": "unknown", "target": "", "feedback": "Sorry, I can't help with that. Please state a valid command related to the app." }

Analyze the following audio command and provide the corresponding JSON output.`
        },
        {
          media: {
            url: audioDataUri,
          }
        }
      ],
      output: {
        format: 'json',
        schema: VoiceCommandOutputSchema,
      },
       config: {
        temperature: 0,
      }
    });

    const result = llmResponse.output;
    if (!result) {
        throw new Error("Failed to process voice command.");
    }
    return result;
  }
);
