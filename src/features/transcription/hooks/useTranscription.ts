/**
 * useTranscription Hook
 * Manages transcription state and operations
 */

import { useState, useCallback } from 'react'
import type { TranscriptionState, TranscriptionSummary, AudioFile } from '../types'
import { validateAudioFile, createWhisperService } from '../services/whisper-service'
import { aiService } from '@/lib/ai-service-new'

const initialState: TranscriptionState = {
    status: 'idle',
    audioFile: null,
    transcription: null,
    summary: null,
    error: null,
    progress: 0,
}

export function useTranscription() {
    const [state, setState] = useState<TranscriptionState>(initialState)

    const setAudioFile = useCallback((file: File | null) => {
        if (!file) {
            setState(prev => ({ ...prev, audioFile: null }))
            return
        }

        const validation = validateAudioFile(file)
        if (!validation.valid) {
            setState(prev => ({
                ...prev,
                status: 'error',
                error: validation.error || 'Invalid file'
            }))
            return
        }

        const audioFile: AudioFile = {
            file,
            name: file.name,
            size: file.size,
            type: file.type,
        }

        setState(prev => ({
            ...prev,
            audioFile,
            transcription: null,
            summary: null,
            error: null,
            status: 'idle'
        }))
    }, [])

    const transcribe = useCallback(async () => {
        if (!state.audioFile) {
            setState(prev => ({ ...prev, status: 'error', error: 'No audio file selected' }))
            return
        }

        const service = createWhisperService()
        if (!service) {
            setState(prev => ({
                ...prev,
                status: 'error',
                error: 'Groq API key not configured. Please add it in Settings.'
            }))
            return
        }

        setState(prev => ({ ...prev, status: 'transcribing', progress: 10, error: null }))

        try {
            const result = await service.transcribe(state.audioFile.file, 'ru')
            setState(prev => ({
                ...prev,
                status: 'complete',
                transcription: result,
                progress: 100
            }))
        } catch (error) {
            setState(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Transcription failed'
            }))
        }
    }, [state.audioFile])

    const summarize = useCallback(async () => {
        if (!state.transcription?.text) {
            setState(prev => ({ ...prev, status: 'error', error: 'No transcription to summarize' }))
            return
        }

        setState(prev => ({ ...prev, status: 'summarizing', progress: 50 }))

        try {
            const prompt = `Ты — профессиональный секретарь-аналитик. Создай МАКСИМАЛЬНО ПОДРОБНЫЙ анализ встречи.

## ТРАНСКРИПЦИЯ ВСТРЕЧИ:
${state.transcription.text}

## КРИТИЧЕСКИ ВАЖНО:
- Каждый раздел должен быть ПОДРОБНЫМ и РАЗВЁРНУТЫМ
- summary: МИНИМУМ 10 предложений, полноценный пересказ всей встречи
- keyPoints: МИНИМУМ 5-10 пунктов, каждый на 2-3 предложения с контекстом
- Не сокращай, не обобщай слишком сильно — пользователь хочет ДЕТАЛИ

## ФОРМАТ ОТВЕТА (строго JSON):
{
  "summary": "ПОДРОБНОЕ резюме встречи на 10-15 предложений. Опиши: 1) Цель и контекст встречи, 2) Кто участвовал и какие роли, 3) Основные темы по порядку обсуждения, 4) Ключевые моменты дискуссии, 5) К каким выводам пришли, 6) Какие следующие шаги обсудили. Это должен быть полноценный пересказ встречи.",
  
  "timeline": [
    {
      "topic": "Название блока/темы обсуждения",
      "summary": "Подробное описание на 3-4 предложения: что именно обсуждали, какие аргументы приводились, к чему пришли"
    }
  ],
  
  "keyPoints": [
    "Каждый ключевой момент на 2-3 предложения. Включи контекст: кто сказал, почему это важно, как это связано с другими темами. Не просто 'обсудили бюджет', а 'Иван отметил, что бюджет на Q1 превышен на 15%, основная причина — незапланированные расходы на маркетинг. Команда согласилась пересмотреть приоритеты.'"
  ],
  
  "quotes": [
    "Дословная цитата из разговора — важная фраза которая отражает суть обсуждения",
    "Ещё цитата — характерное высказывание участника"
  ],
  
  "actionItems": [
    {
      "task": "Подробное описание задачи на 1-2 предложения с контекстом почему это нужно",
      "assignee": "Имя ответственного (если упомянуто)",
      "deadline": "Срок (если упомянут)"
    }
  ],
  
  "decisions": [
    "Подробное описание решения с контекстом: что решили, почему именно так, какие альтернативы отклонили"
  ],
  
  "questions": [
    "Вопрос который обсуждался + краткий контекст дискуссии по нему"
  ],
  
  "unresolvedItems": [
    "Нерешённый вопрос + почему не решили + что нужно для решения"
  ],
  
  "participants": ["Список имён участников, если упоминались"]
}

## ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ:
1. summary — МИНИМУМ 10 полноценных предложений, это главный раздел
2. timeline — разбей встречу на 3-7 логических блоков по темам
3. keyPoints — МИНИМУМ 5 пунктов, каждый подробный
4. Не пиши "обсудили X" — пиши ЧТО ИМЕННО обсудили, какие были мнения
5. Если информации мало — извлеки максимум из того что есть
6. Цитаты бери дословно из транскрипции

Ответ ТОЛЬКО JSON, без markdown.`

            const response = await aiService.generate<TranscriptionSummary>(
                'analyze_cjm' as never, // Using existing operation type
                prompt,
                'ru'
            )

            setState(prev => ({
                ...prev,
                status: 'complete',
                summary: response,
                progress: 100
            }))
        } catch (error) {
            setState(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Summarization failed'
            }))
        }
    }, [state.transcription])

    const reset = useCallback(() => {
        setState(initialState)
    }, [])

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null, status: 'idle' }))
    }, [])

    // Load from saved transcription
    const loadFromSaved = useCallback((
        transcription: TranscriptionState['transcription'],
        summary?: TranscriptionState['summary']
    ) => {
        setState({
            ...initialState,
            status: 'complete',
            transcription,
            summary: summary || null,
            progress: 100,
        })
    }, [])

    return {
        ...state,
        setAudioFile,
        transcribe,
        summarize,
        reset,
        clearError,
        loadFromSaved,
    }
}
