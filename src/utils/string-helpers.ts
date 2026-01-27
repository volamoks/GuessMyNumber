/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncates a string to a specific length with ellipsis
 */
export function truncate(str: string, length: number): string {
    if (!str || str.length <= length) return str
    return str.slice(0, length) + '...'
}

/**
 * Generates a random alphanumeric ID
 */
export function generateId(length: number = 8): string {
    return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * Normalizes a string for search (lowercase, trimmed)
 */
export function normalizeForSearch(str: string): string {
    return str.toLowerCase().trim()
}

/**
 * Parses markdown-style bold text (simple implementation)
 */
export function stripMarkdown(str: string): string {
    return str.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
}
