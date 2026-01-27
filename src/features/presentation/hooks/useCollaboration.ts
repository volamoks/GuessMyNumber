import { useEffect, useState, useRef } from 'react'
import * as Y from 'yjs'
import SupabaseProvider from 'y-supabase/dist/index.js'
import { createClient } from '@supabase/supabase-js'
import { usePresentationStore } from '@/store'

// We need a stable supabase client instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

export function useCollaboration(documentId: string | undefined) {
    const { markdown, setMarkdown } = usePresentationStore()
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
    const [ydoc] = useState(() => new Y.Doc())
    const [isSynced, setIsSynced] = useState(false)
    const isRemoteUpdate = useRef(false)

    useEffect(() => {
        if (!documentId) return

        setStatus('connecting')
        setIsSynced(false)

        // Connect to Supabase
        const provider = new SupabaseProvider(ydoc, supabase, {
            channel: `presentation:${documentId}`,
            id: documentId,
            tableName: 'presentations', // Optional: if we want persistence via postgres
            columnName: 'content',      // Optional
        })

        // Get shared type for markdown
        const yText = ydoc.getText('markdown')

        // Bind Yjs to Zustand
        // 1. Listen to remote changes
        yText.observe(event => {
            if (event.transaction.origin === 'local') return

            console.log('Remote update received')
            isRemoteUpdate.current = true
            const text = yText.toString()
            setMarkdown(text)
            // Reset flag after render cycle ideally, but immediate is ok if setMarkdown is sync
            setTimeout(() => { isRemoteUpdate.current = false }, 0)
        })

        // 2. Handle provider status
        provider.on('status', (event: any) => {
            // y-supabase emits an array [{ status: '...' }]
            const newStatus = event?.[0]?.status
            console.log('Collab status:', newStatus)
            if (newStatus) {
                setStatus(newStatus)
            }
        })

        provider.on('sync', (isSynced: boolean) => {
            console.log('Synced with backend:', isSynced)
            setIsSynced(isSynced)
            if (isSynced && yText.toString() === '' && markdown.length > 50) {
                // Heuristic: If remote is empty and we have "substantial" content, we are likely the creator seeding the doc.
                // This is imperfect (what if I just deleted everything?) but solves the "Share Button" empty start.
                console.log('Seeding remote with local content')
                ydoc.transact(() => {
                    yText.applyDelta([{ insert: markdown }])
                }, 'local')
            }
        })

        // Awareness (cursors/users)
        const awareness = provider.awareness
        awareness.on('change', () => {
            // setConnectedUsers(...)
        })

        return () => {
            provider.destroy()
            // We don't destroy ydoc here because we passed it to state, but we could if we want fresh every time ID changes.
            // Actually strictly we should destroy ydoc if we created it in this scope.
            // But we put it in useState lazy init for stability.
            // Ideally we re-create ydoc if ID changes?
            // For now, simple cleanup:
            ydoc.destroy()
        }
    }, [documentId]) // Re-run if ID changes

    // 3. Listen to local markdown changes and push to Yjs
    useEffect(() => {
        // Wait until we are synced before pushing local changes.
        // This prevents the local "default template" from overwriting remote content on load.
        if (!documentId || isRemoteUpdate.current || !isSynced) return

        const yText = ydoc.getText('markdown')
        const currentYText = yText.toString()

        if (markdown !== currentYText) {
            console.log('Pushing local change to Yjs')
            ydoc.transact(() => {
                yText.delete(0, yText.length)
                yText.insert(0, markdown)
            }, 'local')
        }
    }, [markdown, documentId, isSynced])

    return { status, connectedUsers: [] }
}
