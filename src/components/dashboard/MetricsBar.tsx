import { getAqiColor } from '@/data/mockData';

interface MetricsBarProps {
  cityAqi: number;
  predictedCityAqi: number;
  totalCredits: number;
  criticalWards: number;
  demoMode: boolean;
}

export default function MetricsBar({ cityAqi, predictedCityAqi, totalCredits, criticalWards, demoMode }: MetricsBarProps) {
  const metrics = [
    { label: 'City AQI', value: cityAqi, color: getAqiColor(cityAqi), suffix: '' },
    { label: 'Predicted (24h)', value: predictedCityAqi, color: getAqiColor(predictedCityAqi), suffix: '' },
    { label: 'Total Credits', value: totalCredits.toLocaleString(), color: 'hsl(152, 70%, 50%)', suffix: '' },
    { label: 'Critical Wards', value: criticalWards, color: criticalWards > 0 ? 'hsl(0, 72%, 55%)' : 'hsl(152, 70%, 50%)', suffix: '' },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {demoMode && (
        <div className="glass-card px-3 py-1.5 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-aqi-moderate animate-pulse" />
          <span className="text-muted-foreground">Demo Mode Active</span>
        </div>
      )}
      {metrics.map((m) => (
        <div key={m.label} className="glass-card px-4 py-3 min-w-[140px]">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{m.label}</p>
          <p className="metric-value text-xl" style={{ color: m.color }}>
            {m.value}{m.suffix}
          </p>
        </div>
      ))}
    </div>
  );
}
