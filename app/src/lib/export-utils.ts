import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Element not found')
  }

  try {
    // Создаем canvas из HTML элемента
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')

    // Создаем PDF
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(filename)
  } catch (error) {
    console.error('PDF export error:', error)
    throw new Error('Ошибка при экспорте в PDF')
  }
}

export function downloadJSON(data: any, filename: string) {
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
