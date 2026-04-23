'use client'

export type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped'

export interface RecorderControls {
  start(): Promise<void>
  pause(): void
  resume(): void
  stop(): Promise<Blob>
  state: RecorderState
}

/**
 * MediaRecorder wrapper — audio capture to Blob.
 * Browser-only. Handles permission request.
 */
export function createAudioRecorder(): {
  start(): Promise<void>
  pause(): void
  resume(): void
  stop(): Promise<Blob>
  getState(): RecorderState
} {
  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let state: RecorderState = 'idle'
  let stream: MediaStream | null = null

  async function start(): Promise<void> {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks = []
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    mediaRecorder.start(250) // collect data every 250ms
    state = 'recording'
  }

  function pause(): void {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.pause()
      state = 'paused'
    }
  }

  function resume(): void {
    if (mediaRecorder?.state === 'paused') {
      mediaRecorder.resume()
      state = 'recording'
    }
  }

  function stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'))
        return
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        chunks = []
        state = 'stopped'

        // Release mic
        stream?.getTracks().forEach((t) => t.stop())
        stream = null

        resolve(blob)
      }

      mediaRecorder.onerror = (e) => reject(e)
      mediaRecorder.stop()
    })
  }

  return {
    start,
    pause,
    resume,
    stop,
    getState: () => state,
  }
}
