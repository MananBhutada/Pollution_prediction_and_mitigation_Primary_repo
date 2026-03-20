import { useState, useCallback } from 'react';
import { Map, BarChart3, FileText, Activity } from 'lucide-react';
import { useWardData } from '@/hooks/useWardData';
import { Ward } from '@/data/mockData';
import MetricsBar from '@/components/dashboard/MetricsBar';
import DelhiMap from '@/components/dashboard/DelhiMap';
import WardPanel from '@/components/dashboard/WardPanel';
import WardTable from '@/components/dashboard/WardTable';
import PoliciesAlerts from '@/components/dashboard/PoliciesAlerts';

type Tab = 'map' | 'summary' | 'policies';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'map', label: 'Map & Ward Control', icon: <Map className="w-4 h-4" /> },
  { id: 'summary', label: 'Ward Summary', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'policies', label: 'Policies & Alerts', icon: <FileText className="w-4 h-4" /> },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const { wardData, cityAqi, predictedCityAqi, totalCredits, criticalWards, demoMode } = useWardData();

  const handleWardSelect = useCallback((ward: Ward) => {
    setSelectedWard(prev => prev?.id === ward.id ? null : ward);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground leading-tight">Aero-Governance Grid</h1>
                <p className="text-[11px] text-muted-foreground">AI-Powered Pollution Mitigation · Delhi NCR</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-4">
        {activeTab === 'map' && (
          <div className="animate-fade-up">
            <div className="mb-4">
              <MetricsBar
                cityAqi={cityAqi}
                predictedCityAqi={predictedCityAqi}
                totalCredits={totalCredits}
                criticalWards={criticalWards}
                demoMode={demoMode}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 glass-card overflow-hidden" style={{ minHeight: 500 }}>
                <DelhiMap wards={wardData} selectedWard={selectedWard} onWardSelect={handleWardSelect} />
              </div>
              {selectedWard && (
                <WardPanel ward={selectedWard} onClose={() => setSelectedWard(null)} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'summary' && <WardTable wards={wardData} />}
        {activeTab === 'policies' && <PoliciesAlerts />}
      </main>
    </div>
  );
}
