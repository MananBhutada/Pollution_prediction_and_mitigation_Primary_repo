import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Search, X, ArrowUpDown, ShieldCheck } from 'lucide-react';

interface WardTableProps {
  wards: any[];
}

// ── Credits logic ─────────────────────────────────────────────────────────────

function getCredits(aqi: number): {
  score: number;          // 0–100
  grade: string;          // A+, A, B, C, D, F
  label: string;          // short label
  measures: string[];     // what the ward is doing
  stability: string;      // how stable
  stabilityColor: string;
} {
  if (aqi <= 50) return {
    score: 95,
    grade: 'A+',
    label: 'Exemplary',
    measures: ['Green belt maintained', 'Zero-emission zones active', 'EV adoption incentives'],
    stability: 'Very Stable',
    stabilityColor: '#00e400',
  };
  if (aqi <= 100) return {
    score: 75,
    grade: 'A',
    label: 'Good',
    measures: ['Water sprinkling active', 'Construction dust control', 'Anti-idling enforced'],
    stability: 'Stable',
    stabilityColor: '#7cfc00',
  };
  if (aqi <= 150) return {
    score: 55,
    grade: 'B',
    label: 'Moderate',
    measures: ['Odd-even traffic partial', 'Street sweeping increased'],
    stability: 'Mostly Stable',
    stabilityColor: '#ffff00',
  };
  if (aqi <= 200) return {
    score: 35,
    grade: 'C',
    label: 'Struggling',
    measures: ['GRAP-II enforced', 'Biomass burning restricted'],
    stability: 'Unstable',
    stabilityColor: '#ff7e00',
  };
  if (aqi <= 300) return {
    score: 18,
    grade: 'D',
    label: 'At Risk',
    measures: ['GRAP-III active', 'Schools advisory issued'],
    stability: 'Deteriorating',
    stabilityColor: '#ff0000',
  };
  return {
    score: 5,
    grade: 'F',
    label: 'Critical',
    measures: ['GRAP-IV enforced', 'Emergency response deployed'],
    stability: 'Critical',
    stabilityColor: '#8f3f97',
  };
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
      <div style={{
        width: `${score}%`,
        height: '100%',
        background: color,
        borderRadius: 2,
        transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function WardTable({ wards = [] }: WardTableProps) {
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedWard, setSelectedWard] = useState<any | null>(null);

  const getColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 200) return '#ff7e00';
    if (aqi <= 300) return '#ff0000';
    return '#8f3f97';
  };

  const getCategory = (aqi: number) => {
    if (aqi <= 50) return 'Safe';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Severe';
    return 'Critical';
  };

  const filtered = useMemo(() => {
    let result = wards.filter(w =>
      (w.name || '').toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) =>
      sortDir === 'desc' ? b.aqi - a.aqi : a.aqi - b.aqi
    );
    return result;
  }, [wards, search, sortDir]);

  const toggleSort = () => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));

  if (!wards.length) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Loading ward data...
      </div>
    );
  }

  return (
    <div className="animate-fade-up">

      {/* 🔍 SEARCH */}
      <div className="glass-card flex items-center gap-2 px-3 py-2 mb-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search wards..."
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      {/* 📊 TABLE */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left">Ward</th>
              <th className="p-3 cursor-pointer" onClick={toggleSort}>
                AQI <ArrowUpDown className="inline w-3 h-3" />
              </th>
              <th className="p-3">Status</th>
              <th className="p-3 text-left">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Credits
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((ward, i) => {
              const credits = getCredits(ward.aqi);
              return (
                <tr
                  key={i}
                  onClick={() => setSelectedWard(ward)}
                  className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition"
                >
                  <td className="p-3">{ward.name || `Ward ${i + 1}`}</td>

                  <td
                    className="p-3 font-mono font-bold"
                    style={{
                      color: getColor(ward.aqi),
                      textShadow: `0 0 8px ${getColor(ward.aqi)}`
                    }}
                  >
                    {ward.aqi}
                  </td>

                  <td className="p-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        background: `${getColor(ward.aqi)}20`,
                        color: getColor(ward.aqi)
                      }}
                    >
                      {getCategory(ward.aqi)}
                    </span>
                  </td>

                  {/* ── Credits column ── */}
                  <td className="p-3">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 130 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Grade badge */}
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: credits.stabilityColor,
                          background: `${credits.stabilityColor}18`,
                          border: `1px solid ${credits.stabilityColor}40`,
                          borderRadius: 4,
                          padding: '1px 6px',
                          letterSpacing: 0.5,
                        }}>
                          {credits.grade}
                        </span>
                        {/* Score */}
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                          {credits.score}/100
                        </span>
                      </div>
                      {/* Bar */}
                      <ScoreBar score={credits.score} color={credits.stabilityColor} />
                      {/* Stability tag */}
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                        {credits.stability}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 🔥 SIDE PANEL */}
      {selectedWard && (() => {
        const credits = getCredits(selectedWard.aqi);
        return (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedWard(null)}
            />

            <div
              className="fixed top-0 right-0 h-full w-[380px] z-50
              bg-gradient-to-b from-[#0a0f1a] to-[#0d1320]
              border-l border-white/10 shadow-2xl
              animate-slide-in p-6 overflow-y-auto"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedWard.name}
                  </h2>
                  <span
                    className="text-sm font-bold"
                    style={{ color: getColor(selectedWard.aqi) }}
                  >
                    {getCategory(selectedWard.aqi)}
                  </span>
                </div>
                <button onClick={() => setSelectedWard(null)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* AQI */}
              <div className="text-center mb-8">
                <p className="text-xs text-gray-400">AQI</p>
                <h1
                  className="text-5xl font-bold"
                  style={{
                    color: getColor(selectedWard.aqi),
                    textShadow: `0 0 20px ${getColor(selectedWard.aqi)}`
                  }}
                >
                  {selectedWard.aqi}
                </h1>
              </div>

              {/* 📈 GRAPH */}
              <div className="h-44 mb-6">
                <ResponsiveContainer>
                  <LineChart
                    data={Array.from({ length: 8 }, (_, i) => ({
                      t: i,
                      aqi: selectedWard.aqi + (Math.random() * 30 - 15)
                    }))}
                  >
                    <XAxis dataKey="t" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="aqi"
                      stroke={getColor(selectedWard.aqi)}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 🧠 INFO */}
              <div className="text-sm text-gray-400 space-y-2 mb-6">
                <p>• Status: {getCategory(selectedWard.aqi)}</p>
                <p>• Air quality impact depends on exposure duration</p>
                <p>• Recommended: limit outdoor activity</p>
              </div>

              {/* ── Credits panel ── */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <ShieldCheck size={15} color={credits.stabilityColor} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 }}>
                    WARD CREDITS
                  </span>
                  {/* Grade */}
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: credits.stabilityColor,
                    background: `${credits.stabilityColor}18`,
                    border: `1px solid ${credits.stabilityColor}40`,
                    borderRadius: 5,
                    padding: '2px 8px',
                  }}>
                    {credits.grade} · {credits.label}
                  </span>
                </div>

                {/* Score bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Prevention score</span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: credits.stabilityColor }}>
                      {credits.score} / 100
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                    <div style={{
                      width: `${credits.score}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${credits.stabilityColor}88, ${credits.stabilityColor})`,
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>

                {/* Stability */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginBottom: 12, padding: '6px 10px',
                  background: `${credits.stabilityColor}12`,
                  border: `1px solid ${credits.stabilityColor}25`,
                  borderRadius: 6,
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: credits.stabilityColor,
                    boxShadow: `0 0 6px ${credits.stabilityColor}`,
                  }} />
                  <span style={{ fontSize: 11, color: credits.stabilityColor, fontWeight: 600 }}>
                    {credits.stability}
                  </span>
                </div>

                {/* Active measures */}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                  Active prevention measures:
                </div>
                {credits.measures.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '5px 0',
                    borderBottom: i < credits.measures.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: credits.stabilityColor, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}