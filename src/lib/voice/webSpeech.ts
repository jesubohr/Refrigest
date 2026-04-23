'use client'

/**
 * Web Speech API wrapper — real-time transcription.
 * Chrome/Edge only. Detect support before using.
 */

export function isWebSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
}

export interface WebSpeechOptions {
  lang?: string // e.g. 'es-AR', 'es-CO', 'es-PE'
  onTranscript(transcript: string, isFinal: boolean): void
  onError(error: string): void
  onEnd(): void
}

export function createWebSpeechRecognizer(options: WebSpeechOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const RecognitionCtor: any =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  if (!RecognitionCtor) throw new Error('Web Speech API not supported')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition: any = new RecognitionCtor()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = options.lang ?? 'es-AR'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      options.onTranscript(result[0].transcript, result.isFinal)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    options.onError(event.error)
  }

  recognition.onend = () => {
    options.onEnd()
  }

  return {
    start() {
      recognition.start()
    },
    stop() {
      recognition.stop()
    },
    abort() {
      recognition.abort()
    },
  }
}
