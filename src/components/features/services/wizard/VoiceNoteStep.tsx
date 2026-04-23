'use client'

import { Mic, Square, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useVoice } from '@/hooks/useVoice'
import { useServiceDraft } from '@/hooks/useServiceDraft'

export function VoiceNoteStep() {
  const { serviceId, setVoiceTranscript, setVoiceBlobId, notesText, setNotes, setStep } = useServiceDraft()
  const voice = useVoice()

  async function handleStartRecording() {
    if (!serviceId) return
    await voice.start(serviceId)
  }

  async function handleStopRecording() {
    await voice.stop()
    if (voice.transcript) {
      setVoiceTranscript(voice.transcript)
    }
    if (voice.blobId) {
      setVoiceBlobId(voice.blobId)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 text-balance text-base font-semibold">Nota de Voz + Observaciones</h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Grabá una nota de voz o escribí las observaciones del servicio.
        </p>
      </div>

      {/* Voice recorder */}
      <div className="space-y-3">
        <Label>Nota de Voz</Label>

        {voice.mode === 'idle' && (
          <Button
            variant="outline"
            className="w-full touch-target"
            onClick={handleStartRecording}
          >
            <Mic className="mr-2 size-4" aria-hidden />
            Iniciar Grabación
          </Button>
        )}

        {voice.mode === 'recording' && (
          <div className="space-y-2">
            <Button
              variant="destructive"
              className="w-full touch-target"
              onClick={handleStopRecording}
            >
              <Square className="mr-2 size-4" aria-hidden />
              Detener Grabación
            </Button>
            {voice.interimTranscript && (
              <p className="text-xs text-muted-foreground italic">
                {voice.interimTranscript}...
              </p>
            )}
          </div>
        )}

        {voice.mode === 'transcribing' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span>Transcribiendo...</span>
          </div>
        )}

        {voice.mode === 'done' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="size-4" aria-hidden />
            <span>Nota de voz guardada</span>
          </div>
        )}

        {voice.error && (
          <p className="text-xs text-destructive">{voice.error}</p>
        )}
      </div>

      {/* Transcript / notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observaciones</Label>
        <Textarea
          id="notes"
          placeholder="Ej: Se limpió condensador, se cargó refrigerante, se reemplazó filtro deshidratador..."
          className="min-h-[120px] text-pretty"
          value={voice.transcript || notesText}
          onChange={(e) => {
            voice.setTranscript(e.target.value)
            setNotes(e.target.value)
          }}
        />
      </div>

      <Button className="w-full touch-target" onClick={() => setStep(6)}>
        Continuar
      </Button>
    </div>
  )
}
