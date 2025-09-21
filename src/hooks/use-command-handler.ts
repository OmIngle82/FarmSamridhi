
"use client"

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { type VoiceCommandOutput } from "@/ai/flows/voice-command-flow";

export function useCommandHandler(onCommandHandled?: () => void) {
    const router = useRouter();
    const { toast } = useToast();

    const handleCommand = (command: VoiceCommandOutput) => {
        toast({
            title: "Command Processed",
            description: command.feedback,
        });

        switch (command.action) {
            case 'navigate':
                if (command.target) {
                    router.push(command.target);
                }
                break;
            
            case 'addProduct':
                 if (command.target) {
                    router.push(`/farmer/products?newProductName=${encodeURIComponent(command.target)}`);
                }
                break;

            case 'filter':
                if(command.target && command.payload) {
                    const params = new URLSearchParams();
                    params.set("filter", command.target);
                    Object.entries(command.payload).forEach(([key, value]) => {
                        params.set(key, String(value));
                    });
                    
                    // Navigate to the relevant page with filter params
                    // Assumes a convention like /farmer/orders, /farmer/payments etc.
                    const targetPage = `/farmer/${command.target}`;
                    router.push(`${targetPage}?${params.toString()}`);
                }
                break;
            
            case 'unknown':
                // Do nothing, toast is already shown.
                break;
        }

        onCommandHandled?.();
    };

    return { handleCommand };
}
