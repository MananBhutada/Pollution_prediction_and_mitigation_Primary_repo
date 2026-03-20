import { useState, useMemo } from 'react';
import { Ward, getRiskBadgeClass, getAqiColor } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, X, ArrowUpDown } from 'lucide-react';

interface WardTableProps {
  wards: Ward[];
}

export default function WardTable({ wards }: WardTableProps) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'aqi' | 'creditScore'>('aqi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  const filtered = useMemo(() => {
    let result = wards.filter(w =>
      w.name.toLowerCase().includes(search.toLowerCase()) &&
      (riskFilter === 'All' || w.riskStatus === riskFilter)
    );
    result.sort((a, b) => sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);
    return result;
  }, [wards, search, riskFilter, sortBy, sortDir]);

  const toggleSort = (field: 'aqi' | 'creditScore') => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  return (
    <div className="animate-fade-up">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="glass-card flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search wards..."
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
          />
        </div>
        {['All', 'Safe', 'Moderate', 'Severe'].map(f => (
          <button
            key={f}
            onClick={() => setRiskFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm transition-all active:scale-95 ${
              riskFilter === f
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'glass-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Ward</th>
                <th className="text-left p-3 cursor-pointer select-none" onClick={() => toggleSort('aqi')}>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                    AQI <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="text-left p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Predicted</th>
                <th className="text-left p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Source</th>
                <th className="text-left p-3 cursor-pointer select-none" onClick={() => toggleSort('creditScore')}>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                    Credits <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="text-left p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                <th className="text-left p-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Policies</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ward, i) => (
                <tr
                  key={ward.id}
                  onClick={() => setSelectedWard(ward)}
                  className="border-b border-border/50 cursor-pointer transition-colors hover:bg-secondary/30 active:scale-[0.995]"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <td className="p-3 font-medium text-foreground">{ward.name}</td>
                  <td className="p-3">
                    <span className="font-mono font-semibold" style={{ color: getAqiColor(ward.aqi) }}>{ward.aqi}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-muted-foreground">{ward.predictedAqi}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-muted-foreground text-xs">{ward.pollutionSource.slice(0, 2).join(', ')}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono font-semibold text-primary">{ward.creditScore}</span>
                  </td>
                  <td className="p-3"><span className={getRiskBadgeClass(ward.riskStatus)}>{ward.riskStatus}</span></td>
                  <td className="p-3">
                    <span className="text-muted-foreground text-xs">{ward.activePolicies.length} active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedWard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelectedWard(null)}>
          <div className="glass-card p-6 max-w-lg w-full mx-4 animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{selectedWard.name}</h2>
                <span className={getRiskBadgeClass(selectedWard.riskStatus)}>{selectedWard.riskStatus}</span>
              </div>
              <button onClick={() => setSelectedWard(null)} className="p-1 rounded-lg hover:bg-secondary transition-colors active:scale-95">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="glass-card p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">AQI</p>
                <p className="font-mono text-xl font-bold" style={{ color: getAqiColor(selectedWard.aqi) }}>{selectedWard.aqi}</p>
              </div>
              <div className="glass-card p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Predicted</p>
                <p className="font-mono text-xl font-bold" style={{ color: getAqiColor(selectedWard.predictedAqi) }}>{selectedWard.predictedAqi}</p>
              </div>
              <div className="glass-card p-3 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">Credits</p>
                <p className="font-mono text-xl font-bold text-primary">{selectedWard.creditScore}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">AQI Trend</p>
              <div className="h-40 glass-card p-3">
                <ResponsiveContainer>
                  <LineChart data={selectedWard.aqiHistory.map((v, i) => ({ day: `Day ${i + 1}`, aqi: v }))}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(215,12%,50%)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(215,12%,50%)' }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: 'hsl(220,18%,10%)', border: '1px solid hsl(220,14%,22%)', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="aqi" stroke={getAqiColor(selectedWard.aqi)} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Credit History</p>
              <div className="h-32 glass-card p-3">
                <ResponsiveContainer>
                  <LineChart data={selectedWard.creditHistory.map((v, i) => ({ month: `M${i + 1}`, credits: v }))}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215,12%,50%)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(215,12%,50%)' }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip contentStyle={{ background: 'hsl(220,18%,10%)', border: '1px solid hsl(220,14%,22%)', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="credits" stroke="hsl(152,70%,50%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Active Policies</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedWard.activePolicies.map(p => (
                  <span key={p} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs border border-primary/20">{p}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">AI Recommendation</p>
              <div className="glass-card p-3 text-sm text-secondary-foreground leading-relaxed">
                {selectedWard.aiRecommendation}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
