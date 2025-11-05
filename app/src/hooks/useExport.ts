import { useState } from 'react'
import { toast } from 'sonner'
import { exportToPDF, downloadJSON } from '@/lib/export-utils'

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async (elementId: string, fileName: string) => {
    setIsExporting(true)
    const loadingToast = toast.loading('Экспорт в PDF...')
    try {
      await exportToPDF(elementId, fileName)
      toast.success('PDF экспортирован!', { id: loadingToast })
    } catch (error) {
      toast.error('Ошибка при экспорте: ' + (error as Error).message, { id: loadingToast })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = <T,>(data: T, fileName: string) => {
    downloadJSON(data, fileName)
    toast.success('JSON экспортирован!')
  }

  return {
    isExporting,
    handleExportPDF,
    handleExportJSON
  }
}
