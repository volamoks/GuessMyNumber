import { useEffect } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useTranscriptionStore } from '../store/transcriptionStore'
import { toast } from 'sonner'

export function useAuthSync() {
    const { user } = useAuth()
    const { setUserId, fetchUserTranscriptions, migrateLocalData, transcriptions } = useTranscriptionStore()

    useEffect(() => {
        if (user) {
            setUserId(user.id)

            // Check if we have local items to migrate
            const hasLocalItems = transcriptions.some(t => t.id.startsWith('trans_'))

            if (hasLocalItems) {
                toast.promise(migrateLocalData(), {
                    loading: 'Перенос локальной истории в облако...',
                    success: 'История успешно синхронизирована!',
                    error: 'Ошибка при переносе истории'
                })
            } else {
                fetchUserTranscriptions()
            }
        } else {
            setUserId(null)
        }
    }, [user, setUserId, fetchUserTranscriptions, migrateLocalData])
}
