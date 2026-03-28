import { useState, useCallback } from 'react';
import { Map, BarChart3, FileText } from 'lucide-react';
import { useWardData } from '@/hooks/useWardData';
import MetricsBar from '@/components/dashboard/MetricsBar';
import DelhiMap from '@/components/dashboard/DelhiMap';
import WardPanel from '@/components/dashboard/WardPanel';
import WardTable from '@/components/dashboard/WardTable';
import PoliciesAlerts from '@/components/dashboard/PoliciesAlerts';
import { applyPolicies } from '@/lib/policyEngine';//added

type Tab = 'map' | 'summary' | 'policies';

const tabs = [
  { id: 'map', label: 'Map', icon: <Map className="w-4 h-4" />, color: 'from-blue-500/40 via-cyan-400/30 to-blue-300/20' },
  { id: 'summary', label: 'Ward Summary', icon: <BarChart3 className="w-4 h-4" />, color: 'from-purple-500/40 via-indigo-400/30 to-purple-300/20' },
  { id: 'policies', label: 'Policies & Alerts', icon: <FileText className="w-4 h-4" />, color: 'from-pink-500/40 via-rose-400/30 to-pink-300/20' },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [selectedWard, setSelectedWard] = useState<any>(null);
  
  const [mapWards, setMapWards] = useState<any[]>([]);
  const processedWards = applyPolicies(mapWards || []);
  const { wardData, cityAqi, totalCredits } = useWardData();

  const handleWardSelect = useCallback((ward: any) => {
    setSelectedWard(ward);
  }, []);

  const wardStats = {
    safe: mapWards.filter(w => w.aqi <= 50).length,
    moderate: mapWards.filter(w => w.aqi > 50 && w.aqi <= 100).length,
    unhealthy: mapWards.filter(w => w.aqi > 100 && w.aqi <= 200).length,
    severe: mapWards.filter(w => w.aqi > 200 && w.aqi <= 300).length,
    critical: mapWards.filter(w => w.aqi > 300).length,
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-hidden">

      {/* 🌌 BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#020617] via-[#0f172a] to-black" />

      {/* floating glow blobs */}
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />

      {/* Header */}
      <header className="glass-card sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3">

          <div className="flex justify-between mb-3">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 shadow">
                <img src="/logo.jpeg" alt="logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="font-semibold tracking-wide">India-Inovatets</h1>
            </div>

            <span className="text-xs text-white/60 animate-pulse">Live</span>
          </div>

          {/* 🔥 NEXT LEVEL NAV */}
          <nav className="flex gap-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  group relative px-5 py-2.5 rounded-2xl text-sm font-medium
                  backdrop-blur-xl bg-white/5 border border-white/10
                  overflow-hidden transition-all duration-300 ease-out

                  hover:-translate-y-1 hover:scale-105 hover:shadow-2xl hover:shadow-white/10
                  active:scale-95

                  ${
                    activeTab === tab.id
                      ? 'text-white shadow-xl'
                      : 'text-white/70'
                  }
                `}
              >
                {/* 🌈 animated gradient */}
                <span
                  className={`
                    absolute inset-0 opacity-0 transition duration-500
                    bg-gradient-to-r ${tab.color}
                    bg-[length:200%_200%] animate-[gradientMove_6s_linear_infinite]
                    group-hover:opacity-40
                    ${activeTab === tab.id ? 'opacity-100' : ''}
                  `}
                />

                {/* 🌊 shine sweep */}
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute -left-[120%] top-0 h-full w-[50%] bg-white/20 blur-md transform skew-x-12 transition-all duration-700 group-hover:left-[120%]" />
                </span>

                {/* ✨ content */}
                <span className="relative flex items-center gap-2 transition-all duration-300 group-hover:gap-3 group-hover:translate-x-1">
                  <span className="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    {tab.icon}
                  </span>
                  {tab.label}
                </span>

                {/* 🔥 glow border */}
                {activeTab === tab.id && (
                  <span className="absolute inset-0 rounded-2xl border border-white/20 animate-pulse" />
                )}
              </button>
            ))}
          </nav>

        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-4">

        {activeTab === 'map' && (
          <>
            <MetricsBar
              cityAqi={cityAqi}
              totalCredits={totalCredits}
              wardStats={wardStats}
            />

            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <DelhiMap
  onWardSelect={handleWardSelect}
  onAQIComputed={(wards: any[]) => {
    if (!wards) return;
    setMapWards(wards);
  }}
/>
              </div>

              {selectedWard && (
                <WardPanel
                  ward={selectedWard}
                  onClose={() => setSelectedWard(null)}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'summary' && (
<WardTable wards={processedWards} />
        )}

        {activeTab === 'policies' && (
<PoliciesAlerts wards={processedWards} />        )}

      </main>
    </div>
  );
}