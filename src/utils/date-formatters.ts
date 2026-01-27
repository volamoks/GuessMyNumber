import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Standard formats used in the app
 */
export const DATE_FORMATS = {
    STAMP: 'yyyy-MM-dd HH:mm:ss',
    SHORT: 'dd.MM.yyyy',
    DISPLAY: 'd MMMM yyyy',
    TIME: 'HH:mm',
    ISO: 'yyyy-MM-dd'
}

/**
 * Formats a date string or object using a predefined template
 */
export function formatDate(date: Date | string | number | null | undefined, template: string = DATE_FORMATS.SHORT): string {
    if (!date) return '-'

    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)

    // Check for invalid date
    if (isNaN(dateObj.getTime())) return '-'

    return format(dateObj, template, { locale: ru })
}

/**
 * Returns a human-readable relative time (e.g., "5 минут назад")
 */
export function formatRelativeTime(date: Date | string | number | null | undefined): string {
    if (!date) return '-'

    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)

    if (isNaN(dateObj.getTime())) return '-'

    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ru })
}

/**
 * Formats duration in seconds to HH:mm:ss or mm:ss
 */
export function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
}
