import { getRiskBadgeClass } from '@/data/mockData';
import { AlertTriangle, Shield, Sparkles } from 'lucide-react';
import type { RiskStatus } from '@/data/mockData';

type Props = {
  wards?: any[];
};

export default function PoliciesAlerts({ wards = [] }: Props) {

  // 🔴 Dynamic Alerts
  const alerts: {
    id: number;
    severity: RiskStatus;
    wardName: string;
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }[] = wards
    .filter((w) => w?.aqi > 150)
    .map((w, i) => ({
      id: i,

      // ✅ FIXED TYPE ERROR HERE
      severity: (w.aqi > 300 ? 'Severe' : 'Moderate') as RiskStatus,

      wardName: w.name,

      message:
        w.aqi > 300
          ? 'GRAP-IV activated due to critical AQI'
          : 'AQI rising, precaution advised',

      timestamp: 'Live',

      acknowledged: w.aqi < 250,
    }));

  // 🟢 Dynamic Policies
  const policies = wards.flatMap((w, i) =>
    (w?.activePolicies || []).map((p: string, idx: number) => ({
      id: `${i}-${idx}`,
      title: p,
      description: `Policy triggered in ${w.name} due to AQI ${w.aqi}`,
      status: w.aqi > 300 ? 'Enforced' : 'Active',
      wardNames: [w.name],
      generatedByAI: true,
    }))
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6 animate-fade-up">

      {/* 🔴 Alerts */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-aqi-severe" />
          Live Alerts
        </h2>

        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="text-white/50 text-sm">No alerts</div>
          )}

          {alerts.map((alert, i) => (
            <div
              key={alert.id}
              className={`glass-card p-4 ${
                alert.severity === 'Severe' && !alert.acknowledged
                  ? 'pulse-severe'
                  : ''
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={getRiskBadgeClass(alert.severity)}>
                    {alert.severity}
                  </span>
                  <span className="font-medium text-sm">
                    {alert.wardName}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {alert.timestamp}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {alert.message}
              </p>

              {alert.acknowledged && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2 inline-block">
                  ✓ Acknowledged
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 🟢 Policies */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Policies
        </h2>

        <div className="space-y-3">
          {policies.length === 0 && (
            <div className="text-white/50 text-sm">No active policies</div>
          )}

          {policies.map((policy, i) => (
            <div
              key={policy.id}
              className="glass-card-hover p-4"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-sm">{policy.title}</h3>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    policy.status === 'Enforced'
                      ? 'bg-destructive/15 text-destructive border border-destructive/30'
                      : 'bg-primary/15 text-primary border border-primary/30'
                  }`}
                >
                  {policy.status}
                </span>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                {policy.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {policy.wardNames.map((w) => (
                    <span
                      key={w}
                      className="px-1.5 py-0.5 rounded bg-secondary text-[10px]"
                    >
                      {w}
                    </span>
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