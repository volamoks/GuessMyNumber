import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiKeysSection } from '@/features/settings/components/ApiKeysSection'
import { ModelManagementSection } from '@/features/settings/components/ModelManagementSection'
import { AssignmentSection } from '@/features/settings/components/AssignmentSection'

export function SettingsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Настройки AI</h1>
        <p className="text-muted-foreground mt-2">
          Управление ключами, моделями и назначениями
        </p>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">API Ключи</TabsTrigger>
          <TabsTrigger value="models">Модели</TabsTrigger>
          <TabsTrigger value="assignment">Назначение</TabsTrigger>
        </TabsList>

        {/* API KEYS TAB */}
        <TabsContent value="keys" className="mt-6 space-y-6">
          <ApiKeysSection />
        </TabsContent>

        {/* MODELS MANAGEMENT TAB */}
        <TabsContent value="models" className="mt-6 space-y-6">
          <ModelManagementSection />
        </TabsContent>

        {/* ASSIGNMENT TAB */}
        <TabsContent value="assignment" className="mt-6 space-y-6">
          <AssignmentSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
