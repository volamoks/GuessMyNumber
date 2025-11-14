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
    default: "bg-muted/50 border-border",
    blue: "bg-issue-story/10 border-issue-story/30",
    green: "bg-success/10 border-success/30",
    red: "bg-issue-bug/10 border-issue-bug/30",
    yellow: "bg-warning/10 border-warning/30",
    purple: "bg-issue-epic/10 border-issue-epic/30",
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
          <h4 className="font-semibold text-sm text-issue-story mb-2">
            👤 CUSTOMER PERSPECTIVE
          </h4>
          <Section title="Customer Activities" items={stage.customerActivities} color="blue" />
          <Section title="Customer Goals" items={stage.customerGoals} color="blue" />
          <Section title="Touchpoints" items={stage.touchpoints} color="default" />

          {/* Experience tags */}
          <div className="p-3 rounded-md border bg-issue-epic/10 border-issue-epic/30">
            <p className="font-semibold text-xs mb-2 uppercase tracking-wide opacity-70">Experience</p>
            <div className="flex flex-wrap gap-2">
              {stage.experience.map((exp, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-issue-epic/20 rounded-full text-xs font-medium"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-success mb-2">
            💡 INSIGHTS
          </h4>
          <Section title="Positives" items={stage.positives} color="green" />
          <Section title="Negatives" items={stage.negatives} color="red" />
          <Section title="Ideas & Opportunities" items={stage.ideasOpportunities} color="yellow" />
        </div>

        {/* Business Perspective */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-warning mb-2">
            🎯 BUSINESS PERSPECTIVE
          </h4>

          {/* Business Goal - single text */}
          <div className="p-3 rounded-md border bg-warning/10 border-warning/30">
            <p className="font-semibold text-xs mb-2 uppercase tracking-wide opacity-70">Business Goal</p>
            <p className="text-sm font-medium">{stage.businessGoal}</p>
          </div>

          {/* KPIs */}
          <div className="p-3 rounded-md border bg-muted/50 border-border">
            <p className="font-semibold text-xs mb-2 uppercase tracking-wide opacity-70">KPI's</p>
            <div className="flex flex-wrap gap-2">
              {stage.kpis.map((kpi, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-muted rounded text-xs font-mono"
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
