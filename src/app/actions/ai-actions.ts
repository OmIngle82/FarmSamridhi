
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

export type {
    Product,
    Order,
    Payment,
    MarketPrice,
    Scheme,
    InventoryItem,
    FarmerProfile,
    Expense,
    LoanApplication,
    Purchase,
    FavoriteFarmer,
    FarmerData,
} from '@/ai/flows/farmer-flow';

export { getProductJourney } from '@/ai/flows/journey-flow';
export type { ProductJourneyData } from '@/ai/flows/journey-flow';

export { diagnosePlant } from '@/ai/flows/diagnose-plant-flow';
export type { DiagnosePlantInput, DiagnosePlantOutput } from '@/ai/flows/diagnose-plant-flow';

export { suggestProductDetails } from '@/ai/flows/suggest-product-details-flow';
export type { SuggestProductDetailsInput, SuggestProductDetailsOutput } from '@/ai/flows/suggest-product-details-flow';

export { handleVoiceCommand } from '@/ai/flows/voice-command-flow';
export type { VoiceCommandInput, VoiceCommandOutput } from '@/ai/flows/voice-command-flow';

export { getAudioVisualization } from '@/ai/flows/get-audio-visualization-flow';
export type { AudioVisualizationInput, AudioVisualizationOutput } from '@/ai/flows/get-audio-visualization-flow';
