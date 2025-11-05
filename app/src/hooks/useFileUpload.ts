import { toast } from 'sonner'

export function useFileUpload<T = any>(onLoad: (data: T) => void) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        onLoad(json)
        toast.success('JSON файл загружен')
      } catch (error) {
        toast.error('Ошибка при чтении JSON файла')
      }
    }
    reader.readAsText(file)
  }

  return { handleFileUpload }
}
