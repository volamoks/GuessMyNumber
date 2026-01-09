/**
 * Transcription Store
 * Persists transcription history to localStorage
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { TranscriptionResult, TranscriptionSummary } from '../types'

export interface SavedTranscription {
    id: string
    fileName: string
    fileSize: number
    createdAt: string
    transcription: TranscriptionResult
    summary?: TranscriptionSummary
}

interface TranscriptionStore {
    // Saved transcriptions history
    transcriptions: SavedTranscription[]
    userId: string | null

    // Current active transcription ID
    activeTranscriptionId: string | null

    // Actions
    setUserId: (userId: string | null) => void
    fetchUserTranscriptions: () => Promise<void>
    migrateLocalData: () => Promise<void>

    saveTranscription: (
        fileName: string,
        fileSize: number,
        transcription: TranscriptionResult,
        summary?: TranscriptionSummary
    ) => Promise<string>

    updateTranscription: (id: string, updates: Partial<SavedTranscription>) => Promise<void>
    updateTranscriptionSummary: (id: string, summary: TranscriptionSummary) => Promise<void>
    deleteTranscription: (id: string) => Promise<void>
    setActiveTranscription: (id: string | null) => void
    getTranscription: (id: string) => SavedTranscription | undefined
    clearAll: () => void
}

export const useTranscriptionStore = create<TranscriptionStore>()(
    persist(
        (set, get) => ({
            transcriptions: [],
            activeTranscriptionId: null,
            userId: null,

            setUserId: (userId) => set({ userId }),

            fetchUserTranscriptions: async () => {
                const { userId } = get()
                if (!userId) return

                const { data, error } = await supabase
                    .from('transcriptions')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) {
                    console.error('Error fetching transcriptions:', error)
                    return
                }

                if (data) {
                    const mapped: SavedTranscription[] = data.map(item => ({
                        id: item.id,
                        fileName: item.file_name,
                        fileSize: item.file_size,
                        createdAt: item.created_at,
                        transcription: item.transcription_data,
                        summary: item.summary_data
                    }))
                    set({ transcriptions: mapped })
                }
            },

            migrateLocalData: async () => {
                const { userId, transcriptions } = get()
                if (!userId) return

                const localItems = transcriptions.filter(t => t.id.startsWith('trans_'))
                if (localItems.length === 0) return

                const uploadPromises = localItems.map(async (item) => {
                    const { error } = await supabase.from('transcriptions').insert({
                        user_id: userId,
                        created_at: item.createdAt, // Preserve original date
                        file_name: item.fileName,
                        file_size: item.fileSize,
                        transcription_data: item.transcription,
                        summary_data: item.summary
                    })
                    if (error) console.error('Migration failed for item:', item.id, error)
                })

                await Promise.all(uploadPromises)

                // After migration, fetch everything clean from server
                await get().fetchUserTranscriptions()
            },

            saveTranscription: async (fileName, fileSize, transcription, summary) => {
                const { userId } = get()
                const localId = `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                const timestamp = new Date().toISOString()

                const newTranscription: SavedTranscription = {
                    id: localId,
                    fileName,
                    fileSize,
                    createdAt: timestamp,
                    transcription,
                    summary,
                }

                // Optimistic update
                set((state) => ({
                    transcriptions: [newTranscription, ...state.transcriptions],
                    activeTranscriptionId: localId,
                }))

                if (userId) {
                    const { data, error } = await supabase
                        .from('transcriptions')
                        .insert({
                            user_id: userId,
                            file_name: fileName,
                            file_size: fileSize,
                            transcription_data: transcription,
                            summary_data: summary
                        })
                        .select()
                        .single()

                    if (error) {
                        console.error('Supabase save error:', error)
                    } else if (data) {
                        // Update local ID with real UUID from DB
                        set((state) => ({
                            transcriptions: state.transcriptions.map(t =>
                                t.id === localId ? { ...t, id: data.id } : t
                            ),
                            activeTranscriptionId: data.id
                        }))
                        return data.id
                    }
                }

                return localId
            },

            updateTranscription: async (id, updates) => {
                const { userId } = get()

                set((state) => ({
                    transcriptions: state.transcriptions.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    )
                }))

                if (userId) {
                    // Map generic updates to DB columns if necessary
                    // For now assuming we only update summary/transcription content which maps to JSONB
                    // But if 'updates' contains 'summary', we need to map it to 'summary_data'
                    const dbUpdates: any = {}
                    if (updates.summary) dbUpdates.summary_data = updates.summary
                    // ... other mappings

                    if (Object.keys(dbUpdates).length > 0) {
                        await supabase.from('transcriptions').update(dbUpdates).eq('id', id)
                    }
                }
            },

            updateTranscriptionSummary: async (id, summary) => {
                const { userId } = get()
                set((state) => ({
                    transcriptions: state.transcriptions.map((t) =>
                        t.id === id ? { ...t, summary } : t
                    ),
                }))

                if (userId) {
                    await supabase.from('transcriptions').update({ summary_data: summary }).eq('id', id)
                }
            },

            deleteTranscription: async (id) => {
                const { userId } = get()
                set((state) => ({
                    transcriptions: state.transcriptions.filter((t) => t.id !== id),
                    activeTranscriptionId:
                        state.activeTranscriptionId === id
                            ? state.transcriptions[0]?.id || null
                            : state.activeTranscriptionId,
                }))

                if (userId) {
                    await supabase.from('transcriptions').delete().eq('id', id)
                }
            },

            setActiveTranscription: (id) => {
                set({ activeTranscriptionId: id })
            },

            getTranscription: (id) => {
                return get().transcriptions.find((t) => t.id === id)
            },

            clearAll: () => {
                set({ transcriptions: [], activeTranscriptionId: null })
            },
        }),
        {
            name: 'transcription-storage',
        }
    )
)
