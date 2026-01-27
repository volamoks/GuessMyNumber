import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Plus, X, Users } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface CJMStage {
    name: string
    customerActivities: string[]
    customerGoals: string[]
    touchpoints: string[]
    experience: string[]
    positives: string[]
    negatives: string[]
    ideasOpportunities: string[]
    businessGoal: string
    kpis: string[]
    organizationalActivities: string[]
    responsibility: string[]
    technologySystems: string[]
}

interface CJMData {
    title: string
    persona: string
    description?: string
    stages: CJMStage[]
}

interface CJMGridViewProps {
    data: CJMData
    onUpdate: (data: CJMData) => void
}

type RowType = 'list' | 'text'

interface RowConfig {
    id: keyof CJMStage
    label: string
    type: RowType
    group: 'Customer' | 'Business' | 'Insights'
    color: string
}

const ROWS: RowConfig[] = [
    // Customer Perspective
    { id: 'customerActivities', label: 'Customer Activities', type: 'list', group: 'Customer', color: 'bg-blue-50 dark:bg-blue-950/20' },
    { id: 'customerGoals', label: 'Customer Goals', type: 'list', group: 'Customer', color: 'bg-blue-50 dark:bg-blue-950/20' },
    { id: 'touchpoints', label: 'Touchpoints', type: 'list', group: 'Customer', color: 'bg-purple-50 dark:bg-purple-950/20' },
    { id: 'experience', label: 'Experience', type: 'list', group: 'Customer', color: 'bg-purple-50 dark:bg-purple-950/20' },

    // Insights
    { id: 'positives', label: 'Positives', type: 'list', group: 'Insights', color: 'bg-green-50 dark:bg-green-950/20' },
    { id: 'negatives', label: 'Negatives', type: 'list', group: 'Insights', color: 'bg-red-50 dark:bg-red-950/20' },
    { id: 'ideasOpportunities', label: 'Ideas & Opportunities', type: 'list', group: 'Insights', color: 'bg-yellow-50 dark:bg-yellow-950/20' },

    // Business Perspective
    { id: 'businessGoal', label: 'Business Goal', type: 'text', group: 'Business', color: 'bg-orange-50 dark:bg-orange-950/20' },
    { id: 'kpis', label: 'KPIs', type: 'list', group: 'Business', color: 'bg-orange-50 dark:bg-orange-950/20' },
    { id: 'organizationalActivities', label: 'Organizational Activities', type: 'list', group: 'Business', color: 'bg-orange-50 dark:bg-orange-950/20' },
    { id: 'responsibility', label: 'Responsibility', type: 'list', group: 'Business', color: 'bg-orange-50 dark:bg-orange-950/20' },
    { id: 'technologySystems', label: 'Technology Systems', type: 'list', group: 'Business', color: 'bg-orange-50 dark:bg-orange-950/20' },
]

export function CJMGridView({ data, onUpdate }: CJMGridViewProps) {
    const [editingCell, setEditingCell] = useState<{ stageIndex: number, rowId: string, itemIndex?: number } | null>(null)

    const handleUpdateStageName = (index: number, name: string) => {
        const newStages = [...data.stages]
        newStages[index] = { ...newStages[index], name }
        onUpdate({ ...data, stages: newStages })
    }

    const handleUpdateCell = (stageIndex: number, rowId: keyof CJMStage, value: string | string[]) => {
        const newStages = [...data.stages]
        // @ts-ignore
        newStages[stageIndex] = { ...newStages[stageIndex], [rowId]: value }
        onUpdate({ ...data, stages: newStages })
    }

    const handleAddItem = (stageIndex: number, rowId: keyof CJMStage) => {
        const currentItems = data.stages[stageIndex][rowId] as string[]
        const newItems = [...currentItems, 'New Item']
        handleUpdateCell(stageIndex, rowId, newItems)
        // Automatically start editing the new item
        setTimeout(() => {
            setEditingCell({ stageIndex, rowId, itemIndex: newItems.length - 1 })
        }, 0)
    }

    const handleRemoveItem = (stageIndex: number, rowId: keyof CJMStage, itemIndex: number) => {
        const currentItems = data.stages[stageIndex][rowId] as string[]
        const newItems = currentItems.filter((_, i) => i !== itemIndex)
        handleUpdateCell(stageIndex, rowId, newItems)
    }

    const handleUpdateItem = (stageIndex: number, rowId: keyof CJMStage, itemIndex: number, value: string) => {
        const currentItems = data.stages[stageIndex][rowId] as string[]
        const newItems = [...currentItems]
        newItems[itemIndex] = value
        handleUpdateCell(stageIndex, rowId, newItems)
    }

    const handleAddStage = () => {
        const newStage: CJMStage = {
            name: 'New Stage',
            customerActivities: [],
            customerGoals: [],
            touchpoints: [],
            experience: [],
            positives: [],
            negatives: [],
            ideasOpportunities: [],
            businessGoal: '',
            kpis: [],
            organizationalActivities: [],
            responsibility: [],
            technologySystems: []
        }
        onUpdate({ ...data, stages: [...data.stages, newStage] })
    }

    const handleRemoveStage = (index: number) => {
        if (confirm('Are you sure you want to delete this stage?')) {
            const newStages = data.stages.filter((_, i) => i !== index)
            onUpdate({ ...data, stages: newStages })
        }
    }

    return (
        <div className="w-full h-[calc(100vh-140px)] bg-background/50 backdrop-blur-sm rounded-xl border shadow-sm flex flex-col overflow-hidden transition-all duration-300">
            {/* Header Toolbar */}
            <div className="flex-none px-6 py-4 border-b bg-card/50 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                        {data.title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {data.stages.length} Stages
                        </span>
                        {data.persona && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-md border border-border/50">
                                <Users className="h-3.5 w-3.5" />
                                {data.persona}
                            </span>
                        )}
                    </div>
                </div>
                <Button onClick={handleAddStage} size="sm" className="shadow-sm hover:shadow transition-all font-medium">
                    <Plus className="h-4 w-4 mr-2" /> Add Stage
                </Button>
            </div>

            <ScrollArea className="flex-1 bg-muted/5">
                <div className="min-w-fit" style={{ paddingBottom: '2rem' }}>
                    {/* 2rem padding at bottom to prevent cutoff */}
                    <div
                        className="grid"
                        style={{ gridTemplateColumns: `220px repeat(${data.stages.length}, 340px)` }}
                    >
                        {/* Header Row - Stages */}
                        <div className="sticky top-0 z-40 pt-4 pb-4 bg-background/95 backdrop-blur-md border-r border-b font-bold text-muted-foreground uppercase tracking-widest text-[10px] flex items-end justify-center shadow-sm">
                            Journey Stages
                        </div>
                        {data.stages.map((stage, index) => (
                            <div key={index} className="sticky top-0 z-40 p-2 bg-background/95 backdrop-blur-md border-r border-b group shadow-sm">
                                <div className="relative flex items-center gap-3 p-3 rounded-xl border bg-card/50 hover:bg-card shadow-sm hover:shadow-md transition-all duration-200">
                                    <div className="flex-none bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-primary/20">
                                        {index + 1}
                                    </div>
                                    <input
                                        className="flex-1 bg-transparent font-bold text-sm border-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                                        value={stage.name}
                                        onChange={(e) => handleUpdateStageName(index, e.target.value)}
                                        placeholder="Stage Name..."
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive absolute top-2 right-2"
                                        onClick={() => handleRemoveStage(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Data Rows */}
                        {ROWS.map((row, rowIndex) => (
                            <React.Fragment key={row.id}>
                                {/* Row Label */}
                                <div className={cn(
                                    "sticky left-0 z-30 flex flex-col justify-center border-r border-b bg-background/95 backdrop-blur-sm transition-colors",
                                    rowIndex % 2 === 0 ? 'bg-background/95' : 'bg-muted/10' // Slight banding
                                )}>
                                    <div className={cn(
                                        "mx-4 my-2 p-4 rounded-xl border-l-[3px] shadow-sm bg-card/40",
                                        row.group === 'Customer' && "border-l-blue-500",
                                        row.group === 'Business' && "border-l-orange-500",
                                        row.group === 'Insights' && "border-l-green-500",
                                    )}>
                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-1.5 block">
                                            {row.group}
                                        </span>
                                        <span className="font-semibold text-sm text-foreground/90 leading-tight block">
                                            {row.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Row Cells */}
                                {data.stages.map((stage, stageIndex) => (
                                    <div
                                        key={`${stageIndex}-${row.id}`}
                                        className={cn(
                                            "min-h-[160px] p-3 border-r border-b flex flex-col",
                                            rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'
                                        )}
                                    >
                                        <div className="h-full rounded-xl border border-transparent hover:border-border hover:bg-card hover:shadow-sm transition-all duration-200 p-3 flex flex-col gap-3 group/cell">
                                            {row.id === 'businessGoal' ? (
                                                <Textarea
                                                    className="w-full h-full min-h-[120px] text-sm resize-none bg-transparent border-none focus-visible:ring-0 p-2 placeholder:text-muted-foreground/30 leading-relaxed -ml-2"
                                                    value={stage.businessGoal}
                                                    onChange={(e) => handleUpdateCell(stageIndex, row.id, e.target.value)}
                                                    placeholder="Define business goal..."
                                                />
                                            ) : (
                                                <>
                                                    <div className="flex flex-col gap-2.5 flex-1">
                                                        {(stage[row.id] as string[]).map((item, itemIndex) => (
                                                            <div key={itemIndex} className="group/item relative animate-in fade-in slide-in-from-bottom-1 duration-200">
                                                                <Textarea
                                                                    className="w-full min-h-[80px] text-sm p-3 bg-muted/30 hover:bg-card border-none ring-1 ring-border/10 hover:ring-border/30 focus-visible:ring-primary/20 rounded-lg transition-all resize-none leading-relaxed"
                                                                    value={item}
                                                                    onChange={(e) => handleUpdateItem(stageIndex, row.id, itemIndex, e.target.value)}
                                                                />
                                                                <button
                                                                    className="absolute -top-2 -right-2 bg-card shadow-sm border text-muted-foreground hover:text-destructive hover:border-destructive rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition-all scale-90 hover:scale-100 z-10"
                                                                    onClick={() => handleRemoveItem(stageIndex, row.id, itemIndex)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full opacity-0 group-hover/cell:opacity-100 transition-all text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 mt-auto border border-dashed border-border/50 hover:border-primary/30"
                                                        onClick={() => handleAddItem(stageIndex, row.id)}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1.5" /> Add Item
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <ScrollBar orientation="horizontal" className="h-2.5" />
            </ScrollArea>
        </div>
    )
}
