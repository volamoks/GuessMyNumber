import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2, Loader2, Settings2, RefreshCw } from 'lucide-react'
import { usePresentationStore } from '@/store'
import { useAIStore } from '@/store/aiStore'
import { useAIPromptsStore } from '@/features/ai/store/aiPromptsStore'
import { toast } from 'sonner'
import { aiService } from '@/lib/ai-service-new'
import { useNavigate } from 'react-router-dom'

interface AIGeneratorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AIGeneratorDialog({ open, onOpenChange }: AIGeneratorDialogProps) {
    const navigate = useNavigate()
    const [topic, setTopic] = useState('')
    const [slideCount, setSlideCount] = useState('5')
    const [tone, setTone] = useState('professional')
    const [additionalContext, setAdditionalContext] = useState('')
    const [language, setLanguage] = useState<'ru' | 'en'>('ru')
    const [isGenerating, setIsGenerating] = useState(false)

    // Advanced settings
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [customPrompt, setCustomPrompt] = useState('')
    const [isPromptEdited, setIsPromptEdited] = useState(false)

    const { setMarkdown } = usePresentationStore()
    const { models, configuredModels, googleApiKey, openaiApiKey, openrouterApiKey } = useAIStore()

    // Check if active model is valid
    const activeModelId = models.default
    const activeConfig = configuredModels.find(m => m.id === activeModelId)
    const isLocal = activeConfig?.provider === 'local'
    const hasKey = isLocal || (activeConfig?.provider === 'google' && !!googleApiKey) ||
        (activeConfig?.provider === 'openai' && !!openaiApiKey) ||
        (activeConfig?.provider === 'openrouter' && !!openrouterApiKey)

    const { getPrompt } = useAIPromptsStore()

    // Update prompt when parameters change, unless manually edited
    useEffect(() => {
        if (isPromptEdited) return

        const params = {
            topic: topic || '[Topic]',
            slideCount,
            tone,
            additionalContext: additionalContext || 'None'
        }

        const generatedPrompt = getPrompt('generate_presentation', language, params)
        setCustomPrompt(generatedPrompt)
    }, [topic, slideCount, tone, additionalContext, language, isPromptEdited, getPrompt])

    const handleGenerate = async () => {
        if (!topic) return
        if (!hasKey) {
            toast.error('Please configure the active AI Model in Settings')
            return
        }

        setIsGenerating(true)
        try {
            const result = await aiService.analyze(
                'generate_presentation',
                { topic, slideCount, tone, additionalContext },
                language,
                undefined,
                () => customPrompt // Use the custom prompt
            )

            setMarkdown(result)
            toast.success('Presentation generated successfully!')
            onOpenChange(false)
        } catch (error) {
            console.error('Generation failed:', error)
            toast.error('Failed to generate presentation. Check AI settings.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleResetPrompt = () => {
        setIsPromptEdited(false)
        // Effect will trigger and update prompt
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-purple-500" />
                        Generate Presentation with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe your topic and let AI create the slides for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Config Info */}
                    <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                        <div className="text-sm">
                            <span className="text-muted-foreground mr-2">Method:</span>
                            <span className="font-medium">AI Generation ({models.default})</span>
                        </div>
                        <Button variant="link" size="sm" onClick={() => {
                            onOpenChange(false)
                            navigate('/settings')
                        }}>
                            Configure
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Input
                            id="topic"
                            placeholder="e.g., Q3 Marketing Strategy"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="count">Slides</Label>
                            <Select value={slideCount} onValueChange={setSlideCount}>
                                <SelectTrigger id="count">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">3 Slides</SelectItem>
                                    <SelectItem value="5">5 Slides</SelectItem>
                                    <SelectItem value="8">8 Slides</SelectItem>
                                    <SelectItem value="10">10 Slides</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tone">Tone</Label>
                            <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger id="tone">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="creative">Creative</SelectItem>
                                    <SelectItem value="academic">Academic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="lang">Language</Label>
                            <Select value={language} onValueChange={(val: 'ru' | 'en') => setLanguage(val)}>
                                <SelectTrigger id="lang">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ru">Russian</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="context">Additional Context (Optional)</Label>
                        <Textarea
                            id="context"
                            placeholder="Key points to include, target audience, etc."
                            value={additionalContext}
                            onChange={(e) => setAdditionalContext(e.target.value)}
                            className="h-20"
                        />
                    </div>

                    {/* Advanced Settings Toggle */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-muted-foreground"
                        >
                            <Settings2 className="w-4 h-4 mr-2" />
                            {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                        </Button>
                    </div>

                    {/* Advanced Settings (Prompt Editor) */}
                    {showAdvanced && (
                        <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                            <div className="flex items-center justify-between">
                                <Label>System Prompt</Label>
                                {isPromptEdited && (
                                    <Button variant="ghost" size="sm" onClick={handleResetPrompt} className="h-6 text-xs">
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        Reset to Template
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                value={customPrompt}
                                onChange={(e) => {
                                    setCustomPrompt(e.target.value)
                                    setIsPromptEdited(true)
                                }}
                                className="h-40 font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground">
                                You can edit the prompt directly. Variables are already replaced.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={!topic || isGenerating || !hasKey}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
