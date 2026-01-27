import { useAIStore } from '@/store/aiStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export function ApiKeysSection() {
    const { googleApiKey, openaiApiKey, openrouterApiKey, setApiKey } = useAIStore()
    const groqApiKey = useAIStore((state) => state.groqApiKey)

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Ключи Провайдеров</CardTitle>
                <CardDescription>
                    Ключи хранятся только в вашем браузере (localStorage)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label>Google Gemini API Key</Label>
                    <div className="flex gap-2">
                        <Input
                            type="password"
                            value={googleApiKey}
                            onChange={(e) => setApiKey('google', e.target.value)}
                            placeholder="AIza..."
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>OpenAI API Key</Label>
                    <Input
                        type="password"
                        value={openaiApiKey}
                        onChange={(e) => setApiKey('openai', e.target.value)}
                        placeholder="sk-..."
                    />
                </div>

                <div className="grid gap-2">
                    <Label>OpenRouter API Key</Label>
                    <Input
                        type="password"
                        value={openrouterApiKey}
                        onChange={(e) => setApiKey('openrouter', e.target.value)}
                        placeholder="sk-or-..."
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Groq API Key (Free)</Label>
                    <div className="flex gap-2">
                        <Input
                            type="password"
                            value={groqApiKey}
                            onChange={(e) => setApiKey('groq', e.target.value)}
                            placeholder="gsk_..."
                        />
                        <Button variant="outline" asChild>
                            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
                                Get Key
                            </a>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
