import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Downloads an HTML element as a PDF file
 */
export async function downloadElementAsPDF(elementId: string, filename: string) {
    const element = document.getElementById(elementId)
    if (!element) {
        throw new Error('Element not found')
    }

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        })

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        })

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
        pdf.save(filename)
    } catch (error) {
        console.error('PDF export error:', error)
        throw new Error('Failed to export PDF')
    }
}

/**
 * Downloads data as a JSON file
 */
export function downloadAsJSON(data: any, filename: string) {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

/**
 * Reads a JSON file and returns the parsed data
 */
export function readJSONFile<T>(file: File): Promise<T> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string)
                resolve(json)
            } catch (error) {
                reject(new Error('Invalid JSON file'))
            }
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
    })
}
