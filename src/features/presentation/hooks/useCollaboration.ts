import { useEffect, useState, useRef } from 'react'
import * as Y from 'yjs'
import SupabaseProvider from 'y-supabase'
import { supabase } from '@/lib/supabase'
import { usePresentationStore } from '@/store'

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
        if (!documentId) {
            console.log('[Collaboration] No documentId, skipping setup')
            return
        }

        console.log('[Collaboration] Setting up for documentId:', documentId)
        setStatus('connecting')
        setIsSynced(false)
        setIsReady(false)

        // Capture current markdown at setup time to avoid dependency issues
        const initialMarkdown = markdown

        try {
            const ydoc = new Y.Doc()
            docRef.current = ydoc
            console.log('[Collaboration] Yjs Doc created')

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
            console.log('[Collaboration] SupabaseProvider created')

            providerRef.current = provider

            const yText = ydoc.getText('markdown')
            console.log('[Collaboration] yText initialized')

            // Error handler
            provider.on('error', (error: any) => {
                console.error('[Collaboration] Provider error:', error)
                setStatus('error')
            })

            provider.on('status', (event: any) => {
                console.log('[Collaboration] Status event:', event)
                // y-supabase emits [{ status: 'connected' }] in some versions
                const status = Array.isArray(event) ? event[0]?.status : event?.status

                if (status) {
                    setStatus(status)
                    console.log('[Collaboration] Status updated to:', status)
                } else {
                    console.warn('[Collaboration] Unknown status event structure:', event)
                }
            })

            provider.on('sync', (isSynced: boolean) => {
                console.log('[Collaboration] Sync event, isSynced:', isSynced)
                setIsSynced(isSynced)

                if (isSynced) {
                    try {
                        const content = yText.toString()
                        console.log('[Collaboration] Remote content length:', content.length)

                        if (content.length > 0) {
                            // Remote has content. Adopt it immediately.
                            console.log('[Collaboration] Adopting remote content')
                            isRemoteUpdate.current = true
                            setMarkdown(content)
                            setIsReady(true)
                        } else if (initialMarkdown.trim().length > 0) {
                            // Remote is empty, local has content (including default template). Seed remote.
                            console.log('[Collaboration] Seeding remote with local content (length:', initialMarkdown.length, ')')
                            ydoc.transact(() => {
                                yText.applyDelta([{ insert: initialMarkdown }])
                            }, 'local')
                            setIsReady(true)
                        } else {
                            // Both empty. Ready to edit.
                            console.log('[Collaboration] Both remote and local empty. Ready to edit.')
                            setIsReady(true)
                        }
                    } catch (syncError) {
                        console.error('[Collaboration] Error during sync processing:', syncError)
                        setStatus('error')
                    }
                }
            })

            // Fallback: If sync event doesn't fire within 3 seconds, check manually
            const syncTimeout = setTimeout(() => {
                if (!isSynced) {
                    console.warn('[Collaboration] Sync event did not fire after 3s, checking manually...')
                    const content = yText.toString()
                    console.log('[Collaboration] Manual check - content length:', content.length)

                    if (content.length > 0) {
                        console.log('[Collaboration] Found content via manual check, adopting')
                        isRemoteUpdate.current = true
                        setMarkdown(content)
                        setIsReady(true)
                        setIsSynced(true)
                    } else if (initialMarkdown.trim().length > 0) {
                        console.log('[Collaboration] No remote content, seeding with local (length:', initialMarkdown.length, ')')
                        ydoc.transact(() => {
                            yText.applyDelta([{ insert: initialMarkdown }])
                        }, 'local')
                        setIsReady(true)
                        setIsSynced(true)
                    } else {
                        console.log('[Collaboration] Both empty after manual check')
                        setIsReady(true)
                        setIsSynced(true)
                    }
                }
            }, 3000)

            // 2. Listen to remote Yjs changes and update local state
            const handleYjsChange = () => {
                try {
                    const content = yText.toString()
                    console.log('[Collaboration] Remote Yjs change detected, content length:', content.length)
                    isRemoteUpdate.current = true
                    setMarkdown(content)
                } catch (changeError) {
                    console.error('[Collaboration] Error handling Yjs change:', changeError)
                }
            }

            yText.observe(handleYjsChange)
            console.log('[Collaboration] yText observer attached')

            // Awareness (cursors/users)
            const awareness = provider.awareness
            awareness.on('change', () => {
                // setConnectedUsers(...)
            })

            return () => {
                console.log('[Collaboration] Cleaning up for documentId:', documentId)
                try {
                    clearTimeout(syncTimeout)
                    yText.unobserve(handleYjsChange)
                    provider.destroy()
                    ydoc.destroy()
                    setIsReady(false)
                } catch (cleanupError) {
                    console.error('[Collaboration] Error during cleanup:', cleanupError)
                }
            }
        } catch (setupError) {
            console.error('[Collaboration] Error during setup:', setupError)
            setStatus('error')
        }
    }, [documentId]) // Re-run if ID changes

    // 3. Listen to local markdown changes and push to Yjs
    useEffect(() => {
        // Wait until we are synced AND ready (loaded remote content) before pushing local changes.
        // This prevents the local "default template" from overwriting remote content on load.
        if (!documentId || !isSynced || !isReady) return

        // Skip if this change came from a remote update
        if (isRemoteUpdate.current) {
            console.log('[Collaboration] Skipping push - this was a remote update')
            // Reset the flag after a short delay to allow state to settle
            setTimeout(() => {
                isRemoteUpdate.current = false
            }, 100)
            return
        }

        const ydoc = docRef.current
        if (!ydoc) return

        const yText = ydoc.getText('markdown')
        const currentYText = yText.toString()

        // Only push if content actually differs
        if (markdown !== currentYText) {
            console.log('[Collaboration] Pushing local change to Yjs (length:', markdown.length, ')')
            ydoc.transact(() => {
                yText.delete(0, yText.length)
                yText.insert(0, markdown)
            }, 'local')
        }
    }, [markdown, documentId, isSynced, isReady])

    return { status, connectedUsers: [] }
}
