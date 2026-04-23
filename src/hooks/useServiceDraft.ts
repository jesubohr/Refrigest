'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Checklist } from '@/core/schemas/service'
import type { ServicePart } from '@/core/schemas/part'

interface ServiceDraftState {
  // Step 1 — Client
  clientWa: string | null
  // Step 2 — Branch
  branchId: string | null
  // Step 3 — Equipment
  equipmentId: string | null
  // Step 4 — Checklist + readings
  checklist: Partial<Checklist> | null
  // Step 5 — Notes
  notesText: string
  voiceTranscript: string
  voiceBlobId: string | null
  // Step 6 — Parts
  parts: ServicePart[]
  // Step 7 — Media IDs (stored in media_blobs Dexie)
  photoIds: string[]
  // Draft service ID (created on step 1 completion)
  serviceId: string | null
  currentStep: number

  // Actions
  setClient(wa: string): void
  setBranch(id: string): void
  setEquipment(id: string): void
  setChecklist(checklist: Partial<Checklist>): void
  setNotes(text: string): void
  setVoiceTranscript(text: string): void
  setVoiceBlobId(id: string | null): void
  addPart(part: ServicePart): void
  removePart(partId: string): void
  updatePartQty(partId: string, qty: number): void
  addPhotoId(id: string): void
  removePhotoId(id: string): void
  setServiceId(id: string): void
  setStep(step: number): void
  reset(): void
}

const initialState: Omit<ServiceDraftState, keyof { [K in keyof ServiceDraftState as ServiceDraftState[K] extends Function ? K : never]: unknown }> = {
  clientWa: null,
  branchId: null,
  equipmentId: null,
  checklist: null,
  notesText: '',
  voiceTranscript: '',
  voiceBlobId: null,
  parts: [],
  photoIds: [],
  serviceId: null,
  currentStep: 0,
}

export const useServiceDraft = create<ServiceDraftState>()(
  persist(
    (set) => ({
      ...initialState,

      setClient: (wa) => set({ clientWa: wa }),
      setBranch: (id) => set({ branchId: id }),
      setEquipment: (id) => set({ equipmentId: id }),
      setChecklist: (checklist) => set({ checklist }),
      setNotes: (text) => set({ notesText: text }),
      setVoiceTranscript: (text) => set({ voiceTranscript: text }),
      setVoiceBlobId: (id) => set({ voiceBlobId: id }),
      addPart: (part) =>
        set((s) => ({
          parts: s.parts.some((p) => p.part_id === part.part_id)
            ? s.parts.map((p) => (p.part_id === part.part_id ? part : p))
            : [...s.parts, part],
        })),
      removePart: (partId) =>
        set((s) => ({ parts: s.parts.filter((p) => p.part_id !== partId) })),
      updatePartQty: (partId, qty) =>
        set((s) => ({
          parts: s.parts.map((p) => (p.part_id === partId ? { ...p, qty } : p)),
        })),
      addPhotoId: (id) => set((s) => ({ photoIds: [...s.photoIds, id] })),
      removePhotoId: (id) => set((s) => ({ photoIds: s.photoIds.filter((p) => p !== id) })),
      setServiceId: (id) => set({ serviceId: id }),
      setStep: (step) => set({ currentStep: step }),
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'service-draft',
      partialize: (state) => ({
        clientWa: state.clientWa,
        branchId: state.branchId,
        equipmentId: state.equipmentId,
        checklist: state.checklist,
        notesText: state.notesText,
        voiceTranscript: state.voiceTranscript,
        voiceBlobId: state.voiceBlobId,
        parts: state.parts,
        photoIds: state.photoIds,
        serviceId: state.serviceId,
        currentStep: state.currentStep,
      }),
    }
  )
)
