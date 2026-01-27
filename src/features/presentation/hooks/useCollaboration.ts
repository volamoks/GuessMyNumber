import { useEffect, useState, useRef } from 'react'
import * as Y from 'yjs'
import SupabaseProvider from 'y-supabase/dist/index.js'
import { supabase } from '@/lib/supabase'
import { usePresentationStore } from '@/store'

export function useCollaboration(documentId: string | undefined) {
    const { markdown, setMarkdown } = usePresentationStore()
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
    const [ydoc] = useState(() => new Y.Doc())
    const [isSynced, setIsSynced] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const isRemoteUpdate = useRef(false)

    useEffect(() => {
        if (!documentId) return

        setStatus('connecting')
        setIsSynced(false)
        setIsReady(false)

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

            if (isSynced) {
                const content = yText.toString()
                if (content.length > 0) {
                    // Remote has content. Adopt it immediately.
                    console.log('Adopting remote content')
                    setMarkdown(content)
                    setIsReady(true)
                } else if (markdown.length > 50) {
                    // Remote is empty, local has content. Seed remote.
                    console.log('Seeding remote with local content')
                    ydoc.transact(() => {
                        yText.applyDelta([{ insert: markdown }])
                    }, 'local')
                    setIsReady(true)
                } else {
                    // Both empty? Ready to edit.
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
