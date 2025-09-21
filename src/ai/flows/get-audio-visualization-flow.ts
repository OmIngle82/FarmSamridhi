'use server';
/**
 * @fileOverview A flow to process audio and return visualization data.
 * - getAudioVisualization - A function that returns waveform data for audio.
 * - AudioVisualizationInput - The input type for the function.
 * - AudioVisualizationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AudioVisualizationInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A Base64 encoded audio chunk as a data URI. Expected format: 'data:audio/webm;base64,<encoded_data>'."
    ),
});
export type AudioVisualizationInput = z.infer<typeof AudioVisualizationInputSchema>;

const AudioVisualizationOutputSchema = z.object({
  waveform: z.array(z.number()).describe("An array of numbers representing the audio waveform."),
});
export type AudioVisualizationOutput = z.infer<typeof AudioVisualizationOutputSchema>;

export async function getAudioVisualization(
  input: AudioVisualizationInput
): Promise<AudioVisualizationOutput> {
  return getAudioVisualizationFlow(input);
}

// This function simulates processing an audio buffer to extract waveform data.
// In a real application, you might use a library like 'wavefile' or the Web Audio API
// to get actual frequency or amplitude data.
function simulateWaveformFromData(dataUri: string): number[] {
    const waveform = Array(32).fill(0);
    if (!dataUri || !dataUri.includes(',')) {
        // Return a flat line if there's no data
        return waveform.map(() => 0.1);
    }
    const base64Data = dataUri.split(',')[1];
    if (!base64Data) {
        return waveform.map(() => 0.1);
    }

    // Use the length and some character codes to simulate audio energy
    const dataSize = base64Data.length;
    const energy = Math.min(1, Math.log(dataSize + 1) / 15); // Normalize based on expected data URI length

    for (let i = 0; i < waveform.length; i++) {
        // Create a pseudo-random but deterministic value based on character codes
        const charIndex = Math.floor((i / waveform.length) * base64Data.length);
        const charCode = base64Data.charCodeAt(charIndex % base64Data.length) || 0;
        const charValue = (charCode % 100) / 100; // Normalize char code

        // Mix energy and char value to get variance
        const randomSpike = (i % 3 === 0 || i % 7 === 0) ? Math.random() * 0.5 : 0;
        const barHeight = Math.max(0.1, Math.min(1, energy * (charValue + 0.5) + randomSpike));
        waveform[i] = barHeight;
    }

    return waveform;
}


const getAudioVisualizationFlow = ai.defineFlow(
  {
    name: 'getAudioVisualizationFlow',
    inputSchema: AudioVisualizationInputSchema,
    outputSchema: AudioVisualizationOutputSchema,
  },
  async ({ audioDataUri }) => {
    // Generate a simulated waveform based on the input audio data
    const waveform = simulateWaveformFromData(audioDataUri);
    return { waveform };
  }
);
