'use client'

/**
 * Whisper transcription via Supabase Edge Function proxy.
 * Used when Web Speech API is unavailable (Firefox/Safari) or offline → queued.
 */

export interface WhisperResult {
  transcript: string
  language?: string
}

/**
 * Upload audio blob to the /api/transcribe route (proxies to Edge Function → OpenAI Whisper).
 */
export async function transcribeWithWhisper(
  audioBlob: Blob,
  lang = 'es'
): Promise<WhisperResult> {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('language', lang)

  const res = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Transcription failed: ${res.status} ${text}`)
  }

  return res.json() as Promise<WhisperResult>
}
