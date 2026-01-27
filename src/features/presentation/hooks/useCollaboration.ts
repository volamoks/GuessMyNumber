import { useEffect, useState, useRef } from 'react'
import * as Y from 'yjs'
import SupabaseProvider from 'y-supabase'
import { supabase } from '@/lib/supabase'
import { usePresentationStore } from '@/store'
import { SAMPLE_MARKDOWN } from '../types'

export function useCollaboration(documentId: string | undefined) {
    const { markdown, setMarkdown } = usePresentationStore()
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

    // Store Yjs instances in refs to modify them inside effects
    const docRef = useRef<Y.Doc | null>(null)
    const providerRef = useRef<SupabaseProvider | null>(null)

    // Track sync state
    const [isSynced, setIsSynced] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const isRemoteUpdate = useRef(false)

    // We use a separate ydoc Ref for the effect, but also keep one in state? 
    // Actually the previous implementation used `new Y.Doc()` inside useEffect.
    // Let's stick to refs for ydoc to avoid recreation if not needed, or create fresh in useEffect.
    // The useEffect below creates `new Y.Doc()`. So we don't need ydoc state.


    useEffect(() => {
        if (!documentId) return

        setStatus('connecting')
        setIsSynced(false)
        setIsReady(false)

        const ydoc = new Y.Doc()
        docRef.current = ydoc

        const provider = new SupabaseProvider(
            ydoc,
            supabase,
            {
                channel: `presentation-${documentId}`,
                tableName: 'presentations',
                columnName: 'content',
                id: documentId,
            }
        )

        providerRef.current = provider

        const yText = ydoc.getText('markdown')

        provider.on('status', (event: any) => {
            console.log('Collaboration status event:', event)
            // y-supabase emits [{ status: 'connected' }] in some versions
            const status = Array.isArray(event) ? event[0]?.status : event?.status

            if (status) {
                setStatus(status)
            } else {
                console.warn('Unknown status event structure:', event)
            }
        })

        provider.on('sync', (isSynced: boolean) => {
            console.log('Synced with backend:', isSynced)
            setIsSynced(isSynced)

            if (isSynced) {
                const content = yText.toString()
                if (content.length > 0) {
                    // Remote has content. Adopt it immediately.
                    console.log('Adopting remote content')
                    setMarkdown(content)
                    setIsReady(true)
                } else if (markdown.trim().length > 0 && markdown !== SAMPLE_MARKDOWN) {
                    // Remote is empty, local has content AND it is NOT the default template. Seed remote.
                    console.log('Seeding remote with local content')
                    ydoc.transact(() => {
                        yText.applyDelta([{ insert: markdown }])
                    }, 'local')
                    setIsReady(true)
                } else {
                    // Both empty or Local is Default? Ready to edit (but don't seed default).
                    console.log('Remote empty & Local default/empty. Ready to edit.')
                    setIsReady(true)
                }
            }
        })

        // Awareness (cursors/users)
        const awareness = provider.awareness
        awareness.on('change', () => {
            // setConnectedUsers(...)
        })

        return () => {
            provider.destroy()
            ydoc.destroy()
            setIsReady(false)
        }
    }, [documentId]) // Re-run if ID changes

    // 3. Listen to local markdown changes and push to Yjs
    useEffect(() => {
        // Wait until we are synced AND ready (loaded remote content) before pushing local changes.
        // This prevents the local "default template" from overwriting remote content on load.
        if (!documentId || isRemoteUpdate.current || !isSynced || !isReady) return

        const ydoc = docRef.current
        if (!ydoc) return

        const yText = ydoc.getText('markdown')
        const currentYText = yText.toString()

        if (markdown !== currentYText) {
            console.log('Pushing local change to Yjs')
            ydoc.transact(() => {
                yText.delete(0, yText.length)
                yText.insert(0, markdown)
            }, 'local')
        }
    }, [markdown, documentId, isSynced, isReady])

    return { status, connectedUsers: [] }
}
