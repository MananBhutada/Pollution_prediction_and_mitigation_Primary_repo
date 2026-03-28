import { ShieldCheck, AlertTriangle, AlertCircle, Skull, Coins, MapPin } from 'lucide-react';

interface WardStats {
  safe: number;
  moderate: number;
  unhealthy: number;
  severe: number;
  critical: number;
}

interface Props {
  cityAqi: number;
  totalCredits: number;
  wardStats: WardStats;
}

export default function MetricsBar({ cityAqi, totalCredits, wardStats }: Props) {

  // 🎨 AQI color logic
  const getColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 200) return '#ff7e00';
    if (aqi <= 300) return '#ff0000';
    return '#8f3f97';
  };

  const aqiColor = getColor(cityAqi);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

      {/* 🌫️ AQI CARD */}
      <div
        className="relative p-5 rounded-2xl border border-white/10 
        bg-white/5 backdrop-blur-xl overflow-hidden transition hover:scale-[1.02]"
        style={{
          boxShadow: `0 0 25px ${aqiColor}40`
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase">City AQI</p>
            <h2
              className="text-4xl font-bold"
              style={{
                color: aqiColor,
                textShadow: `0 0 12px ${aqiColor}`
              }}
            >
              {cityAqi}
            </h2>
          </div>

          <MapPin style={{ color: aqiColor }} />
        </div>

        {/* Glow bar */}
        <div className="mt-4 h-1 bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${Math.min((cityAqi / 400) * 100, 100)}%`,
              background: aqiColor,
              boxShadow: `0 0 10px ${aqiColor}`
            }}
          />
        </div>
      </div>

      {/* 💰 CREDITS */}
      <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:scale-[1.02] transition">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase">Credits</p>
            <h2 className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">
              {totalCredits}
            </h2>
          </div>
          <Coins className="text-emerald-400" />
        </div>
      </div>

      {/* 📊 WARD DISTRIBUTION */}
      <div className="col-span-2 p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">

        <p className="text-xs text-gray-400 uppercase mb-4">Ward Distribution</p>

        <div className="grid grid-cols-5 gap-3 text-center">

          {/* SAFE */}
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:scale-105 transition">
            <ShieldCheck className="mx-auto text-green-400 mb-1 drop-shadow-[0_0_6px_#00e400]" />
            <p className="text-green-400 font-bold">{wardStats.safe}</p>
          </div>

          {/* MODERATE */}
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-400/20 hover:scale-105 transition">
            <AlertTriangle className="mx-auto text-yellow-400 mb-1 drop-shadow-[0_0_6px_#ffff00]" />
            <p className="text-yellow-400 font-bold">{wardStats.moderate}</p>
          </div>

          {/* UNHEALTHY */}
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-400/20 hover:scale-105 transition">
            <AlertCircle className="mx-auto text-orange-400 mb-1 drop-shadow-[0_0_6px_#ff7e00]" />
            <p className="text-orange-400 font-bold">{wardStats.unhealthy}</p>
          </div>

          {/* SEVERE */}
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/20 hover:scale-105 transition">
            <AlertCircle className="mx-auto text-red-400 mb-1 drop-shadow-[0_0_6px_#ff0000]" />
            <p className="text-red-400 font-bold">{wardStats.severe}</p>
          </div>

          {/* CRITICAL */}
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-400/20 hover:scale-105 transition">
            <Skull className="mx-auto text-purple-400 mb-1 drop-shadow-[0_0_6px_#8f3f97]" />
            <p className="text-purple-400 font-bold">{wardStats.critical}</p>
          </div>

        </div>
      </div>

    </div>
  );
}