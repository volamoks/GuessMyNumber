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

interface CJMStageCardProps {
  stage: CJMStage
}

const Section = ({ title, items, color = "default" }: { title: string, items: string[], color?: string }) => {
  const colorClasses = {
    default: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700",
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    yellow: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
    purple: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
  }

  return (
    <div className={`p-3 rounded-md border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.default}`}>
      <p className="font-semibold text-xs mb-2 uppercase tracking-wide opacity-70">{title}</p>
      <ul className="space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-xs mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CJMStageCard({ stage }: CJMStageCardProps) {
  return (
    <div className="flex-shrink-0 w-96 p-5 border-2 rounded-xl bg-card shadow-lg hover:shadow-xl transition-shadow">
      {/* Stage Name */}
      <div className="mb-4 pb-3 border-b-2">
        <h3 className="font-bold text-xl text-primary">{stage.name}</h3>
      </div>

      <div className="space-y-3">
        {/* Customer Perspective */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-2">
            👤 CUSTOMER PERSPECTIVE
          </h4>
          <Section title="Customer Activities" items={stage.customerActivities} color="blue" />
          <Section title="Customer Goals" items={stage.customerGoals} color="blue" />
          <Section title="Touchpoints" items={stage.touchpoints} color="default" />

          {/* Experience tags */}
          <div className="p-3 rounded-md border bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
            <p className="font-semibold text-xs mb-2 uppercase tracking-wide opacity-70">Experience</p>
            <div className="flex flex-wrap gap-2">
              {stage.experience.map((exp, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-purple-200 dark:bg-purple-900 rounded-full text-xs font-medium"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-2">
            💡 INSIGHTS
          </h4>
          <Section title="Positives" items={stage.positives} color="green" />
          <Section title="Negatives" items={stage.negatives} color="red" />
          <Section title="Ideas & Opportunities" items={stage.ideasOpportunities} color="yellow" />
        </div>

        {/* Business Perspective */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-orange-600 dark:text-orange-400 mb-2">
            🎯 BUSINESS PERSPECTIVE
          </h4>

          {/* Business Goal - single text */}
          <div className="p-3 rounded-md border bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
            <p className="font-semibold text-xs mb-2 uppercase tracking-wide opacity-70">Business Goal</p>
            <p className="text-sm font-medium">{stage.businessGoal}</p>
          </div>

          {/* KPIs */}
          <div className="p-3 rounded-md border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <p className="font-semibold text-xs mb-2 uppercase tracking-wide opacity-70">KPI's</p>
            <div className="flex flex-wrap gap-2">
              {stage.kpis.map((kpi, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono"
                >
                  {kpi}
                </span>
              ))}
            </div>
          </div>

          <Section title="Organizational Activities" items={stage.organizationalActivities} color="default" />
          <Section title="Responsibility" items={stage.responsibility} color="default" />
          <Section title="Technology Systems" items={stage.technologySystems} color="default" />
        </div>
      </div>
    </div>
  )
}
