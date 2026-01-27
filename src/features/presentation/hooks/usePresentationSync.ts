import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { usePresentationStore } from '@/store'
import { useNavigate } from 'react-router-dom'

export function usePresentationSync() {
    const store = usePresentationStore()
    const navigate = useNavigate()
    const { currentPresentation } = store

    const handleSave = () => {
        if (!currentPresentation) {
            const title = prompt('Enter presentation title:')
            if (title) {
                store.createPresentation(title)
                store.savePresentation()
                toast.success('Presentation saved!')
            }
        } else {
            store.savePresentation()
            toast.success('Presentation saved!')
        }
    }

    const handleShare = async () => {
        let id = currentPresentation?.id

        if (!id) {
            id = store.createPresentation('Untitled')
        }

        const url = `${window.location.origin}/presentation/${id}`
        const toastId = toast.loading('Creating collaboration session...')

        try {
            await navigator.clipboard.writeText(url)
            toast.success('Link copied! Syncing to server...', { id: toastId })
        } catch (clipErr) {
            console.warn('Clipboard failed:', clipErr)
            toast.error('Could not copy link manually. ID: ' + id, { id: toastId })
        }

        try {
            const { error } = await supabase
                .from('presentations')
                .upsert({
                    id,
                    title: currentPresentation?.title || 'Untitled Presentation',
                    content: store.markdown, // Save the actual markdown content
                })

            if (error) {
                console.error('Supabase error:', error)
                if (error.code === '42P01') {
                    toast.error('SQL setup missing. Run setup_complete.sql', { id: toastId })
                    return
                }
                toast.error('Sync failed: ' + error.message, { id: toastId })
            }

            if (!window.location.pathname.includes(id)) {
                navigate(`/presentation/${id}`)
            }
        } catch (e) {
            console.error(e)
            toast.error('Failed to create session. Check DB setup.', { id: toastId })
        }
    }

    return { handleSave, handleShare }
}
