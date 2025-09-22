
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
} from '@/app/api/ai/flows/farmer-flow';

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
} from '@/app/api/ai/flows/farmer-flow';

export { getProductJourney } from '@/app/api/ai/flows/journey-flow';
export type { ProductJourneyData } from '@/app/api/ai/flows/journey-flow';

export { diagnosePlant } from '@/app/api/ai/flows/diagnose-plant-flow';
export type { DiagnosePlantInput, DiagnosePlantOutput } from '@/app/api/ai/flows/diagnose-plant-flow';

export { suggestProductDetails } from '@/app/api/ai/flows/suggest-product-details-flow';
export type { SuggestProductDetailsInput, SuggestProductDetailsOutput } from '@/app/api/ai/flows/suggest-product-details-flow';

export { handleVoiceCommand } from '@/app/api/ai/flows/voice-command-flow';
export type { VoiceCommandInput, VoiceCommandOutput } from '@/app/api/ai/flows/voice-command-flow';

export { getAudioVisualization } from '@/app/api/ai/flows/get-audio-visualization-flow';
export type { AudioVisualizationInput, AudioVisualizationOutput } from '@/app/api/ai/flows/get-audio-visualization-flow';
