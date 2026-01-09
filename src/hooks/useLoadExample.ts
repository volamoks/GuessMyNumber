import { toast } from 'sonner'

export function useLoadExample<T>(example: T, onLoad: (data: T) => void) {
  const loadExample = () => {
    onLoad(example)
    toast.success('Пример загружен')
  }

  return { loadExample }
}
