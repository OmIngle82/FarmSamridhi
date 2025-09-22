
'use server';

/**
 * @fileoverview This file acts as a central hub for re-exporting all AI-related
 * server functions. By importing all AI functions through this single file,
 * we ensure a clear and consistent boundary between server-side AI logic and
 * client-side components. This helps prevent Next.js build errors related to
 * server/client module resolution.
 */

export {
    getFarmerData,
    addProduct,
    addOrder,
    updateProduct,
    deleteProduct,
    addExpense,
    applyForLoan,
} from '@/ai/flows/farmer-flow';

// Components should import types directly from their source flow files.
// e.g., import type { Product } from '@/ai/flows/farmer-flow';


export { getProductJourney } from '@/ai/flows/journey-flow';

export { diagnosePlant } from '@/ai/flows/diagnose-plant-flow';

export { suggestProductDetails } from '@/ai/flows/suggest-product-details-flow';

export { handleVoiceCommand } from '@/ai/flows/voice-command-flow';

export { getAudioVisualization } from '@/ai/flows/get-audio-visualization-flow';
