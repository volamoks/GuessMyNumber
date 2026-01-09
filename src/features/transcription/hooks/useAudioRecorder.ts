import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'

interface UseAudioRecorderReturn {
    isRecording: boolean
    duration: number
    audioBlob: Blob | null
    filesize: number
    startRecording: () => Promise<void>
    stopRecording: () => void
    reset: () => void
    setAudioBlob: (blob: Blob | null) => void // Allow external setting (e.g. upload)
    setFilesize: (size: number) => void
    setDuration: (duration: number) => void
}

export function useAudioRecorder(): UseAudioRecorderReturn {
    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [filesize, setFilesize] = useState(0)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const chunksRef = useRef<BlobPart[]>([])

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setFilesize(blob.size)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start(100) // Collect chunks every 100ms
            setIsRecording(true)
            setAudioBlob(null)

            // Timer
            const startTime = Date.now()
            setDuration(0)
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTime) / 1000))
            }, 1000)

        } catch (err) {
            console.error('Error accessing microphone:', err)
            toast.error('Ошибка доступа к микрофону. Проверьте разрешения.')
        }
    }, [])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isRecording])

    const reset = useCallback(() => {
        setAudioBlob(null)
        setDuration(0)
        setFilesize(0)
        if (timerRef.current) clearInterval(timerRef.current)
        setIsRecording(false)
    }, [])

    return {
        isRecording,
        duration,
        audioBlob,
        filesize,
        startRecording,
        stopRecording,
        reset,
        setAudioBlob,
        setFilesize,
        setDuration
    }
}
