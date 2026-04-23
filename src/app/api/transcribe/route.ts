import { type NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/transcribe
 * Proxy: audio blob → OpenAI Whisper → transcript text.
 * Authenticated via Supabase session (checked in middleware).
 */
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const audio = formData.get('audio') as Blob | null
  const language = (formData.get('language') as string) ?? 'es'

  if (!audio) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
  }

  // Forward to OpenAI Whisper
  const whisperForm = new FormData()
  whisperForm.append('file', audio, 'recording.webm')
  whisperForm.append('model', 'whisper-1')
  whisperForm.append('language', language)
  whisperForm.append('response_format', 'json')

  const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: whisperForm,
  })

  if (!whisperRes.ok) {
    const text = await whisperRes.text()
    return NextResponse.json({ error: `Whisper error: ${text}` }, { status: 502 })
  }

  const data = (await whisperRes.json()) as { text: string }

  return NextResponse.json({ transcript: data.text })
}
