import { Ward, getRiskBadgeClass, getAqiColor } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { X } from 'lucide-react';

interface WardPanelProps {
  ward: Ward;
  onClose: () => void;
}

const CHART_COLORS = ['hsl(152,70%,50%)', 'hsl(45,95%,55%)', 'hsl(200,70%,50%)', 'hsl(280,60%,60%)'];

export default function WardPanel({ ward, onClose }: WardPanelProps) {
  const isCritical = ward.riskStatus === 'Severe';
  const trendData = ward.aqiHistory.map((v, i) => ({ day: `D${i + 1}`, aqi: v }));

  return (
    <div className={`glass-card p-5 w-full max-w-sm animate-slide-in-right overflow-y-auto max-h-[calc(100vh-200px)] ${isCritical ? 'pulse-severe' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ward.name}</h2>
          <span className={getRiskBadgeClass(ward.riskStatus)}>{ward.riskStatus}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors active:scale-95">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {isCritical && (
        <div className="mb-4 px-3 py-2 rounded-lg border border-destructive/30 bg-destructive/10 text-sm">
          <span className="font-semibold text-destructive">⚠ Emergency Mitigation Activated</span>
          <p className="text-muted-foreground text-xs mt-1">Policies auto-enforced by AI agent</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="Current AQI" value={ward.aqi} color={getAqiColor(ward.aqi)} />
        <Stat label="Predicted AQI" value={ward.predictedAqi} color={getAqiColor(ward.predictedAqi)} />
        <div className="col-span-2">
          <Stat label="Credit Score" value={ward.creditScore} color="hsl(152,70%,50%)" large />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Pollution Sources</p>
        <div className="flex flex-wrap gap-1.5">
          {ward.pollutionSource.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">{s}</span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Active Policies</p>
        <div className="flex flex-wrap gap-1.5">
          {ward.activePolicies.map(p => (
            <span key={p} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs border border-primary/20">{p}</span>
          ))}
        </div>
      </div>

      {/* AQI Trend */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">AQI Trend</p>
        <div className="h-32 glass-card p-2">
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(215,12%,50%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215,12%,50%)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: 'hsl(220,18%,10%)', border: '1px solid hsl(220,14%,22%)', borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="aqi" stroke={getAqiColor(ward.aqi)} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Source Breakdown</p>
        <div className="h-32 glass-card p-2 flex items-center">
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie data={ward.sourceBreakdown} dataKey="value" cx="50%" cy="50%" outerRadius={45} innerRadius={25} strokeWidth={0}>
                {ward.sourceBreakdown.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1 text-xs">
            {ward.sourceBreakdown.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-mono text-foreground ml-auto">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">AI Recommendation</p>
        <div className="glass-card p-3 text-xs text-secondary-foreground leading-relaxed">
          {ward.aiRecommendation}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color, large }: { label: string; value: number; color: string; large?: boolean }) {
  return (
    <div className="glass-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={`font-mono font-bold ${large ? 'text-2xl' : 'text-lg'}`} style={{ color }}>{value}</p>
    </div>
  );
}
