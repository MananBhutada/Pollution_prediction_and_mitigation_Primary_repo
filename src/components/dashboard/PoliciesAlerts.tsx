import { alerts, policies, getRiskBadgeClass } from '@/data/mockData';
import { AlertTriangle, Shield, Sparkles } from 'lucide-react';

export default function PoliciesAlerts() {
  return (
    <div className="grid lg:grid-cols-2 gap-6 animate-fade-up">
      {/* Alerts */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-aqi-severe" />
          Live Alerts
        </h2>
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div
              key={alert.id}
              className={`glass-card p-4 transition-all ${alert.severity === 'Severe' && !alert.acknowledged ? 'pulse-severe' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={getRiskBadgeClass(alert.severity)}>{alert.severity}</span>
                  <span className="font-medium text-sm text-foreground">{alert.wardName}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{alert.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              {alert.acknowledged && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2 inline-block">✓ Acknowledged</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Policies */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Policies
        </h2>
        <div className="space-y-3">
          {policies.map((policy, i) => (
            <div
              key={policy.id}
              className="glass-card-hover p-4"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm text-foreground">{policy.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  policy.status === 'Enforced' ? 'bg-destructive/15 text-destructive border border-destructive/30' :
                  policy.status === 'Active' ? 'bg-primary/15 text-primary border border-primary/30' :
                  'bg-secondary text-secondary-foreground border border-border'
                }`}>
                  {policy.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{policy.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {policy.wardNames.map(w => (
                    <span key={w} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-secondary-foreground">{w}</span>
                  ))}
                </div>
                {policy.generatedByAI && (
                  <span className="flex items-center gap-1 text-[10px] text-primary">
                    <Sparkles className="w-3 h-3" />
                    AI Generated
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
