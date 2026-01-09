/**
 * Audio Processing Utilities
 */

/**
 * Convert Audio Blob to Base64 string for API consumption
 */
export async function fileToGenerativePart(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1]
            resolve(base64String)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

/**
 * Format duration in mm:ss
 */
export function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}
