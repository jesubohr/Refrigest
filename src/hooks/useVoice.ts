'use client'

import { useState, useCallback, useRef } from 'react'
import { createAudioRecorder } from '@/lib/voice/recorder'
import { isWebSpeechSupported, createWebSpeechRecognizer } from '@/lib/voice/webSpeech'
import { transcribeWithWhisper } from '@/lib/voice/whisper'
import { saveMediaBlob } from '@/lib/dexie/media'
import { v4 as uuid } from 'uuid'

export type VoiceMode = 'idle' | 'recording' | 'transcribing' | 'done' | 'error'

export interface UseVoiceResult {
  mode: VoiceMode
  transcript: string
  interimTranscript: string
  blobId: string | null
  start(serviceId: string): Promise<void>
  stop(): Promise<void>
  setTranscript(value: string): void
  error: string | null
}

export function useVoice(lang = 'es-AR'): UseVoiceResult {
  const [mode, setMode] = useState<VoiceMode>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [blobId, setBlobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef(createAudioRecorder())
  const recognizerRef = useRef<ReturnType<typeof createWebSpeechRecognizer> | null>(null)
  const serviceIdRef = useRef<string | null>(null)

  const start = useCallback(
    async (serviceId: string) => {
      setMode('recording')
      setError(null)
      setInterimTranscript('')
      serviceIdRef.current = serviceId

      // Start audio recording
      await recorderRef.current.start()

      // Start Web Speech if supported
      if (isWebSpeechSupported()) {
        try {
          recognizerRef.current = createWebSpeechRecognizer({
            lang,
            onTranscript: (text, isFinal) => {
              if (isFinal) {
                setTranscript((prev) => prev + ' ' + text)
                setInterimTranscript('')
              } else {
                setInterimTranscript(text)
              }
            },
            onError: (err) => console.warn('[voice] WebSpeech error:', err),
            onEnd: () => setInterimTranscript(''),
          })
          recognizerRef.current.start()
        } catch {
          // fallback to Whisper only
        }
      }
    },
    [lang]
  )

  const stop = useCallback(async () => {
    setMode('transcribing')

    // Stop Web Speech
    recognizerRef.current?.stop()
    recognizerRef.current = null

    // Stop audio recording
    const blob = await recorderRef.current.stop()
    const id = uuid()
    setBlobId(id)

    // Save blob to Dexie
    await saveMediaBlob({
      id,
      service_id: serviceIdRef.current ?? '',
      kind: 'audio',
      blob,
      mimeType: 'audio/webm;codecs=opus',
    })

    // If Web Speech didn't produce a transcript, use Whisper
    if (!transcript && navigator.onLine) {
      try {
        const { transcript: whisperText } = await transcribeWithWhisper(blob, lang.split('-')[0])
        setTranscript(whisperText)
      } catch (err) {
        setError('No se pudo transcribir. El audio fue guardado y se reintentará.')
      }
    }

    setMode('done')
  }, [transcript, lang])

  return {
    mode,
    transcript,
    interimTranscript,
    blobId,
    start,
    stop,
    setTranscript,
    error,
  }
}
