
"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mic, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { handleVoiceCommand } from "@/ai/flows/voice-command-flow"
import { getAudioVisualization } from "@/ai/flows/get-audio-visualization-flow"
import { AudioVisualizer } from "./audio-visualizer"
import { useCommandHandler } from "@/hooks/use-command-handler"

type VoiceCommandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoiceCommandDialog({
  open,
  onOpenChange,
}: VoiceCommandDialogProps) {
  const { toast } = useToast()
  const { handleCommand } = useCommandHandler(() => onOpenChange(false));

  const [status, setStatus] = useState<
    "idle" | "requesting" | "listening" | "processing"
  >("idle")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [visualizationData, setVisualizationData] = useState<number[]>(Array(32).fill(0.1));
  const visualizerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    setStatus("requesting")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream);
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        if (visualizerIntervalRef.current) {
          clearInterval(visualizerIntervalRef.current);
        }
        setStatus("processing")
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = async () => {
          const base64Audio = reader.result as string
          try {
            const result = await handleVoiceCommand({ audioDataUri: base64Audio });
            handleCommand(result);
          } catch (error) {
            console.error("Error processing voice command:", error)
            toast({
              variant: "destructive",
              title: "Error",
              description: "Could not process your voice command. Please try again.",
            })
          } finally {
            setStatus("idle")
          }
        }
      }

      mediaRecorderRef.current.start(250) // Capture data in chunks for visualization
      setStatus("listening")

      // Start visualization
      visualizerIntervalRef.current = setInterval(async () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording" && audioChunksRef.current.length > 0) {
            try {
                // Use the latest audio chunk for a more "live" feel
                const latestBlob = new Blob(audioChunksRef.current.slice(-1), { type: 'audio/webm' });
                const base64Audio = await new Promise<string>(resolve => {
                    const reader = new FileReader();
                    reader.readAsDataURL(latestBlob);
                    reader.onloadend = () => resolve(reader.result as string);
                });

                if (base64Audio.length > 25) { // Ensure there is data
                    const vizData = await getAudioVisualization({ audioDataUri: base64Audio });
                    setVisualizationData(vizData.waveform);
                }

            } catch (e) {
                console.error("Visualization error", e);
                // Don't stop the interval for viz errors
            }
        }
      }, 300);

    } catch (err) {
      console.error("Error accessing microphone:", err)
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description:
          "Please enable microphone permissions in your browser settings.",
      })
      setStatus("idle")
      onOpenChange(false)
    }
  }

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop()
    }
     if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
    }
    if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current);
    }
  }
  
  const handleClose = () => {
    stopRecording();
    onOpenChange(false);
  }

  useEffect(() => {
    if (open) {
      setStatus("idle")
      setVisualizationData(Array(32).fill(0.1));
    } else {
        stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Voice Command</DialogTitle>
          <DialogDescription>
            Click the button and speak your command. For example, "Show me my pending orders".
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center h-48">
          {status === "listening" && (
             <div className="flex flex-col items-center gap-4 text-primary w-full px-4">
              <AudioVisualizer waveform={visualizationData} className="w-full h-16"/>
              <p>Listening...</p>
            </div>
          )}
          {status === "processing" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p>Processing...</p>
            </div>
          )}
          {(status === "idle" || status === "requesting") && (
            <Button
              size="icon"
              className="h-24 w-24 rounded-full"
              onClick={startRecording}
              disabled={status !== "idle"}
            >
              <Mic className="h-12 w-12" />
            </Button>
          )}
        </div>

        <DialogFooter>
          {status === "listening" ? (
             <Button onClick={stopRecording} className="w-full">
                Stop Recording
             </Button>
          ) : (
             <Button variant="outline" onClick={handleClose} className="w-full">
                <X className="mr-2 h-4 w-4" /> Cancel
             </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
