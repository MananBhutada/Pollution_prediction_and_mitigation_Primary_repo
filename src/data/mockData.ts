export type RiskStatus = 'Safe' | 'Moderate' | 'Severe';

export interface Ward {
  id: number;
  name: string;
  aqi: number;
  predictedAqi: number;
  creditScore: number;
  riskStatus: RiskStatus;
  pollutionSource: string[];
  activePolicies: string[];
  lat: number;
  lng: number;
  aqiHistory: number[];
  sourceBreakdown: { name: string; value: number }[];
  creditHistory: number[];
  aiRecommendation: string;

  // ✅ ADD THESE (IMPORTANT FOR YOUR NEW SYSTEM)
  windSpeed?: number;
  hasConstruction?: boolean;
  effects?: {
    dustMultiplier: number;
    constructionAllowed: boolean;
  };
}

export const wards: Ward[] = [
  {
    id: 1,
    name: "Connaught Place",
    aqi: 78,
    predictedAqi: 85,
    creditScore: 820,
    riskStatus: "Safe",
    pollutionSource: ["Vehicles", "Construction"],
    activePolicies: ["Odd-Even Rule", "Green Cover Initiative"],
    lat: 28.6315,
    lng: 77.2167,
    aqiHistory: [65, 72, 68, 75, 78, 80, 78],
    sourceBreakdown: [
      { name: "Vehicles", value: 45 },
      { name: "Construction", value: 30 },
      { name: "Industrial", value: 15 },
      { name: "Other", value: 10 }
    ],
    creditHistory: [790, 800, 810, 815, 820],
    aiRecommendation: "Maintain current policies.",
    
    // ✅ SAFE DEFAULTS
    windSpeed: 2,
    hasConstruction: true,
  },

  {
    id: 2,
    name: "Anand Vihar",
    aqi: 342,
    predictedAqi: 380,
    creditScore: 420,
    riskStatus: "Severe",
    pollutionSource: ["Vehicles", "Dust", "Biomass"],
    activePolicies: ["Emergency GRAP-IV", "Construction Ban"],
    lat: 28.6469,
    lng: 77.3164,
    aqiHistory: [280, 310, 325, 340, 342, 360, 380],
    sourceBreakdown: [
      { name: "Vehicles", value: 35 },
      { name: "Dust", value: 25 },
      { name: "Biomass", value: 25 },
      { name: "Industrial", value: 15 }
    ],
    creditHistory: [520, 490, 460, 440, 420],
    aiRecommendation: "CRITICAL: Deploy water sprinklers.",
    
    windSpeed: 3,
    hasConstruction: false,
  },

  // 👉 KEEP REST SAME (just add defaults if needed)
];

export interface Alert {
  id: number;
  wardName: string;
  message: string;
  severity: RiskStatus;
  timestamp: string;
  acknowledged: boolean;
}

export const alerts: Alert[] = [
  {
    id: 1,
    wardName: "Anand Vihar",
    message: "AQI crossed 340 — GRAP-IV activated",
    severity: "Severe",
    timestamp: "2 min ago",
    acknowledged: false
  },
];

export interface Policy {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Enforced' | 'Proposed';
  wardNames: string[];
  generatedByAI: boolean;
}

export const policies: Policy[] = [
  {
    id: 1,
    title: "GRAP-IV Emergency Protocol",
    description: "Construction ban, truck diversion, WFH advisory.",
    status: "Enforced",
    wardNames: ["Anand Vihar"],
    generatedByAI: true
  },
];

export function getRiskColor(status: RiskStatus): string {
  switch (status) {
    case 'Safe': return 'hsl(152, 70%, 50%)';
    case 'Moderate': return 'hsl(45, 95%, 55%)';
    case 'Severe': return 'hsl(0, 72%, 55%)';
    default: return 'hsl(0,0%,50%)'; // ✅ fallback
  }
}

export function getRiskBadgeClass(status: RiskStatus): string {
  switch (status) {
    case 'Safe': return 'badge-safe';
    case 'Moderate': return 'badge-moderate';
    case 'Severe': return 'badge-severe';
    default: return 'badge-moderate'; // ✅ fallback
  }
}

export function getAqiColor(aqi: number): string {
  if (aqi <= 100) return 'hsl(152, 70%, 50%)';
  if (aqi <= 200) return 'hsl(45, 95%, 55%)';
  return 'hsl(0, 72%, 55%)';
}