/**
 * Prompts Management Page
 * Allows users to view and edit AI prompts
 */

import { useState } from 'react'
import { useAIPromptsStore } from '@/store'
import type { OperationType, Language } from '@/lib/services/ai-prompts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { RotateCcw, Save } from 'lucide-react'

const OPERATION_LABELS: Record<OperationType, string> = {
  generate_cjm: 'Генерация CJM',
  generate_business_canvas: 'Генерация Business Canvas',
  generate_lean_canvas: 'Генерация Lean Canvas',
  generate_roadmap: 'Генерация Roadmap',
  generate_presentation: 'Генерация Презентации',
  analyze_cjm: 'Анализ CJM',
  analyze_business_canvas: 'Анализ Business Canvas',
  analyze_lean_canvas: 'Анализ Lean Canvas',
  analyze_roadmap: 'Анализ Roadmap',
  improve_cjm: 'Улучшение CJM',
  improve_business_canvas: 'Улучшение Business Canvas',
  improve_lean_canvas: 'Улучшение Lean Canvas',
  improve_roadmap: 'Улучшение Roadmap',
  chat_response: 'Ответ AI Чата',
  analyze_transcription: 'Анализ Транскрипции',
}

const OPERATION_GROUPS = {
  'Генерация': ['generate_cjm', 'generate_business_canvas', 'generate_lean_canvas', 'generate_roadmap', 'generate_presentation'],
  'Анализ': ['analyze_cjm', 'analyze_business_canvas', 'analyze_lean_canvas', 'analyze_roadmap', 'analyze_transcription'],
  'Улучшение': ['improve_cjm', 'improve_business_canvas', 'improve_lean_canvas', 'improve_roadmap'],
} as const

export default function PromptsPage() {
  const { prompts, updatePrompt, resetPrompt, resetAllPrompts, isCustomized } = useAIPromptsStore()
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('generate_cjm')
  const [language, setLanguage] = useState<Language>('ru')
  const [editedPrompt, setEditedPrompt] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load prompt when operation or language changes
  const handleSelectOperation = (operation: OperationType) => {
    if (hasUnsavedChanges) {
      if (!confirm('У вас есть несохраненные изменения. Продолжить?')) return
    }
    setSelectedOperation(operation)
    setEditedPrompt(prompts[operation][language])
    setHasUnsavedChanges(false)
  }

  const handleLanguageChange = (lang: Language) => {
    if (hasUnsavedChanges) {
      if (!confirm('У вас есть несохраненные изменения. Продолжить?')) return
    }
    setLanguage(lang)
    setEditedPrompt(prompts[selectedOperation][lang])
    setHasUnsavedChanges(false)
  }

  const handlePromptChange = (value: string) => {
    setEditedPrompt(value)
    setHasUnsavedChanges(value !== prompts[selectedOperation][language])
  }

  const handleSave = () => {
    updatePrompt(selectedOperation, language, editedPrompt)
    setHasUnsavedChanges(false)
    toast.success('Промпт сохранен')
  }

  const handleReset = () => {
    if (!confirm('Сбросить промпт к значению по умолчанию?')) return

    resetPrompt(selectedOperation)
    setEditedPrompt(prompts[selectedOperation][language])
    setHasUnsavedChanges(false)
    toast.success('Промпт сброшен к значению по умолчанию')
  }

  const handleResetAll = () => {
    if (!confirm('Сбросить ВСЕ промпты к значениям по умолчанию? Это действие нельзя отменить.')) return

    resetAllPrompts()
    setEditedPrompt(prompts[selectedOperation][language])
    setHasUnsavedChanges(false)
    toast.success('Все промпты сброшены к значениям по умолчанию')
  }

  // Initialize edited prompt
  useState(() => {
    setEditedPrompt(prompts[selectedOperation][language])
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление промптами</h1>
          <p className="text-muted-foreground">
            Настройте промпты для AI операций
          </p>
        </div>
        <Button variant="destructive" onClick={handleResetAll}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Сбросить все
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with operation list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Операции</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(OPERATION_GROUPS).map(([group, operations]) => (
              <div key={group}>
                <h3 className="text-sm font-semibold mb-2">{group}</h3>
                <div className="space-y-1">
                  {operations.map((operation) => (
                    <Button
                      key={operation}
                      variant={selectedOperation === operation ? 'default' : 'ghost'}
                      className="w-full justify-start text-sm h-auto py-2"
                      onClick={() => handleSelectOperation(operation as OperationType)}
                    >
                      <span className="truncate">{OPERATION_LABELS[operation as OperationType]}</span>
                      {isCustomized(operation as OperationType) && (
                        <Badge variant="secondary" className="ml-auto text-xs">Изменен</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main editor */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{OPERATION_LABELS[selectedOperation]}</CardTitle>
                <CardDescription>
                  {isCustomized(selectedOperation)
                    ? '⚠️ Промпт изменен (используется пользовательская версия)'
                    : 'Используется промпт по умолчанию'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!isCustomized(selectedOperation)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Сбросить
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
              <TabsList>
                <TabsTrigger value="ru">
                  Русский
                </TabsTrigger>
                <TabsTrigger value="en">
                  English
                </TabsTrigger>
              </TabsList>

              <TabsContent value={language} className="mt-4">
                <Textarea
                  value={editedPrompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder="Введите промпт..."
                />

                {hasUnsavedChanges && (
                  <p className="mt-2 text-sm text-orange-600">
                    ⚠️ Есть несохраненные изменения
                  </p>
                )}

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Доступные плейсхолдеры:</h4>
                  <ul className="text-sm space-y-1">
                    <li><code className="bg-background px-1">{'{{description}}'}</code> - Описание для генерации</li>
                    <li><code className="bg-background px-1">{'{{data}}'}</code> - JSON данные для анализа</li>
                    <li><code className="bg-background px-1">{'{{analysis}}'}</code> - Текст анализа для улучшения</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
