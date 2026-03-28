export type Ward = {
  id: string;
  name: string;
  aqi: number;
  windSpeed?: number;
  hasConstruction?: boolean;
  effects?: {
    dustMultiplier: number;
    constructionAllowed: boolean;
  };
  activePolicies?: string[];
};

export function applyPolicies(wards: Ward[] = []): Ward[] {
  return wards.map((ward) => {
    // ✅ SAFETY: handle undefined AQI
    const aqi = ward?.aqi ?? 0;

    let effects = {
      dustMultiplier: 1,
      constructionAllowed: true,
    };

    let activePolicies: string[] = [];

    // 🚨 GRAP IV
    if (aqi > 300) {
      activePolicies.push('GRAP-IV Emergency');
      effects.dustMultiplier *= 0.3;
      effects.constructionAllowed = false;
    }

    // 🏭 Industrial
    if (aqi > 200) {
      activePolicies.push('Industrial Cap');
      effects.dustMultiplier *= 0.6;
    }

    // 🚗 Odd Even
    if (aqi > 180) {
      activePolicies.push('Odd-Even Rule');
    }

    // 🌱 Green
    if (aqi > 120) {
      activePolicies.push('Green Program');
    }

    return {
      ...ward,

      // ✅ SAFE DEFAULTS
      windSpeed: ward.windSpeed ?? 2,
      hasConstruction: ward.hasConstruction ?? true,

      effects,
      activePolicies,
    };
  });
}