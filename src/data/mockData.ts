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
}

export const wards: Ward[] = [
  {
    id: 1, name: "Connaught Place", aqi: 78, predictedAqi: 85, creditScore: 820,
    riskStatus: "Safe", pollutionSource: ["Vehicles", "Construction"],
    activePolicies: ["Odd-Even Rule", "Green Cover Initiative"],
    lat: 28.6315, lng: 77.2167,
    aqiHistory: [65, 72, 68, 75, 78, 80, 78],
    sourceBreakdown: [{ name: "Vehicles", value: 45 }, { name: "Construction", value: 30 }, { name: "Industrial", value: 15 }, { name: "Other", value: 10 }],
    creditHistory: [790, 800, 810, 815, 820],
    aiRecommendation: "Maintain current policies. Consider expanding green cover in sub-zones B and C."
  },
  {
    id: 2, name: "Anand Vihar", aqi: 342, predictedAqi: 380, creditScore: 420,
    riskStatus: "Severe", pollutionSource: ["Vehicles", "Dust", "Biomass"],
    activePolicies: ["Emergency GRAP-IV", "Construction Ban", "Truck Diversion"],
    lat: 28.6469, lng: 77.3164,
    aqiHistory: [280, 310, 325, 340, 342, 360, 380],
    sourceBreakdown: [{ name: "Vehicles", value: 35 }, { name: "Dust", value: 25 }, { name: "Biomass", value: 25 }, { name: "Industrial", value: 15 }],
    creditHistory: [520, 490, 460, 440, 420],
    aiRecommendation: "CRITICAL: Deploy water sprinklers, enforce construction ban, activate smog towers at full capacity."
  },
  {
    id: 3, name: "Dwarka", aqi: 145, predictedAqi: 160, creditScore: 680,
    riskStatus: "Moderate", pollutionSource: ["Construction", "Vehicles"],
    activePolicies: ["Dust Control Mandate", "EV Incentive Zone"],
    lat: 28.5921, lng: 77.0460,
    aqiHistory: [120, 130, 138, 142, 145, 150, 155],
    sourceBreakdown: [{ name: "Construction", value: 40 }, { name: "Vehicles", value: 35 }, { name: "Dust", value: 15 }, { name: "Other", value: 10 }],
    creditHistory: [710, 700, 695, 685, 680],
    aiRecommendation: "Increase dust suppression frequency. Recommend phased construction scheduling."
  },
  {
    id: 4, name: "Rohini", aqi: 198, predictedAqi: 220, creditScore: 560,
    riskStatus: "Moderate", pollutionSource: ["Industrial", "Vehicles", "Dust"],
    activePolicies: ["Industrial Emission Cap", "Green Buffer Zone"],
    lat: 28.7495, lng: 77.0565,
    aqiHistory: [170, 180, 185, 190, 198, 210, 220],
    sourceBreakdown: [{ name: "Industrial", value: 40 }, { name: "Vehicles", value: 30 }, { name: "Dust", value: 20 }, { name: "Other", value: 10 }],
    creditHistory: [610, 590, 580, 570, 560],
    aiRecommendation: "Enforce stricter industrial emission caps. Deploy mobile AQI monitors at 3 critical junctions."
  },
  {
    id: 5, name: "Saket", aqi: 92, predictedAqi: 98, creditScore: 780,
    riskStatus: "Safe", pollutionSource: ["Vehicles", "Restaurants"],
    activePolicies: ["Green Zone Maintenance", "EV Priority Lanes"],
    lat: 28.5244, lng: 77.2090,
    aqiHistory: [85, 88, 90, 89, 92, 94, 95],
    sourceBreakdown: [{ name: "Vehicles", value: 50 }, { name: "Restaurants", value: 25 }, { name: "Construction", value: 15 }, { name: "Other", value: 10 }],
    creditHistory: [750, 760, 770, 775, 780],
    aiRecommendation: "Zone performing well. Suggest piloting carbon credit trading with neighboring zones."
  },
  {
    id: 6, name: "Jahangirpuri", aqi: 310, predictedAqi: 345, creditScore: 380,
    riskStatus: "Severe", pollutionSource: ["Biomass", "Waste Burning", "Industrial"],
    activePolicies: ["Emergency GRAP-IV", "Waste Burning Ban", "Factory Shutdown Order"],
    lat: 28.7298, lng: 77.1723,
    aqiHistory: [260, 280, 295, 300, 310, 330, 345],
    sourceBreakdown: [{ name: "Biomass", value: 35 }, { name: "Waste Burning", value: 30 }, { name: "Industrial", value: 25 }, { name: "Other", value: 10 }],
    creditHistory: [480, 450, 420, 400, 380],
    aiRecommendation: "URGENT: Mobilize ground teams for waste burning prevention. Activate community alert system."
  },
  {
    id: 7, name: "Defence Colony", aqi: 65, predictedAqi: 70, creditScore: 890,
    riskStatus: "Safe", pollutionSource: ["Vehicles"],
    activePolicies: ["Green Cover Maintenance", "Traffic Management"],
    lat: 28.5733, lng: 77.2341,
    aqiHistory: [58, 60, 62, 63, 65, 67, 68],
    sourceBreakdown: [{ name: "Vehicles", value: 60 }, { name: "Construction", value: 20 }, { name: "Other", value: 20 }],
    creditHistory: [860, 870, 878, 885, 890],
    aiRecommendation: "Top-performing ward. Use as model for replication. Consider peer-mentoring program with Jahangirpuri."
  },
  {
    id: 8, name: "Mundka", aqi: 275, predictedAqi: 310, creditScore: 450,
    riskStatus: "Severe", pollutionSource: ["Industrial", "Dust", "Vehicles"],
    activePolicies: ["Emergency GRAP-III", "Industrial Audit Mandate", "Dust Suppression"],
    lat: 28.6837, lng: 77.0294,
    aqiHistory: [230, 245, 258, 265, 275, 290, 310],
    sourceBreakdown: [{ name: "Industrial", value: 45 }, { name: "Dust", value: 30 }, { name: "Vehicles", value: 15 }, { name: "Other", value: 10 }],
    creditHistory: [530, 510, 490, 470, 450],
    aiRecommendation: "Deploy rapid industrial audit teams. Mandatory wet construction methods within 48 hours."
  },
  {
    id: 9, name: "Vasant Kunj", aqi: 110, predictedAqi: 125, creditScore: 730,
    riskStatus: "Moderate", pollutionSource: ["Construction", "Vehicles"],
    activePolicies: ["Construction Time Regulation", "Green Belt Expansion"],
    lat: 28.5195, lng: 77.1567,
    aqiHistory: [95, 100, 105, 108, 110, 118, 125],
    sourceBreakdown: [{ name: "Construction", value: 45 }, { name: "Vehicles", value: 35 }, { name: "Other", value: 20 }],
    creditHistory: [760, 750, 745, 738, 730],
    aiRecommendation: "Tighten construction window hours. Assess impact of upcoming metro construction project."
  },
  {
    id: 10, name: "Okhla Industrial", aqi: 256, predictedAqi: 280, creditScore: 490,
    riskStatus: "Severe", pollutionSource: ["Industrial", "Waste", "Vehicles"],
    activePolicies: ["Emergency GRAP-III", "Industrial Emission Monitoring", "Waste Management Protocol"],
    lat: 28.5309, lng: 77.2710,
    aqiHistory: [220, 235, 242, 250, 256, 268, 280],
    sourceBreakdown: [{ name: "Industrial", value: 40 }, { name: "Waste", value: 30 }, { name: "Vehicles", value: 20 }, { name: "Other", value: 10 }],
    creditHistory: [560, 540, 520, 505, 490],
    aiRecommendation: "Implement real-time emission monitoring on top 15 industrial units. Schedule community health camp."
  },
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
  { id: 1, wardName: "Anand Vihar", message: "AQI crossed 340 — GRAP-IV activated", severity: "Severe", timestamp: "2 min ago", acknowledged: false },
  { id: 2, wardName: "Jahangirpuri", message: "Waste burning detected via satellite imagery", severity: "Severe", timestamp: "8 min ago", acknowledged: false },
  { id: 3, wardName: "Mundka", message: "Industrial emission spike — 3 units flagged", severity: "Severe", timestamp: "15 min ago", acknowledged: true },
  { id: 4, wardName: "Okhla Industrial", message: "AQI predicted to exceed 280 in 6 hours", severity: "Severe", timestamp: "22 min ago", acknowledged: false },
  { id: 5, wardName: "Rohini", message: "AQI approaching severe threshold", severity: "Moderate", timestamp: "35 min ago", acknowledged: true },
  { id: 6, wardName: "Dwarka", message: "Construction dust levels elevated in Sector 21", severity: "Moderate", timestamp: "1 hr ago", acknowledged: true },
  { id: 7, wardName: "Defence Colony", message: "Monthly credit score improved to 890", severity: "Safe", timestamp: "2 hr ago", acknowledged: true },
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
  { id: 1, title: "GRAP-IV Emergency Protocol", description: "Comprehensive emergency measures including construction ban, truck diversion, 50% work-from-home advisory, and school closures for affected wards.", status: "Enforced", wardNames: ["Anand Vihar", "Jahangirpuri"], generatedByAI: true },
  { id: 2, title: "Industrial Emission Cap (Tier-2)", description: "Mandatory 40% reduction in industrial emissions. Real-time monitoring with automated alerts for violations.", status: "Enforced", wardNames: ["Mundka", "Okhla Industrial", "Rohini"], generatedByAI: true },
  { id: 3, title: "Odd-Even Vehicle Policy", description: "Alternate day vehicle usage based on registration number. Exemptions for EVs, emergency services, and public transport.", status: "Active", wardNames: ["Connaught Place", "Rohini"], generatedByAI: false },
  { id: 4, title: "Green Cover Expansion Program", description: "Plant 50,000 saplings along arterial roads. Priority species: Neem, Peepal, and Arjuna for maximum pollution absorption.", status: "Active", wardNames: ["Saket", "Defence Colony", "Vasant Kunj"], generatedByAI: true },
  { id: 5, title: "Smart Dust Suppression Grid", description: "Deploy IoT-enabled water sprinkler networks in construction zones. AI-optimized scheduling based on wind patterns.", status: "Proposed", wardNames: ["Dwarka", "Vasant Kunj"], generatedByAI: true },
  { id: 6, title: "Carbon Credit Trading Framework", description: "Enable high-performing wards to trade excess credits with underperforming zones. Blockchain-verified transactions.", status: "Proposed", wardNames: ["Defence Colony", "Saket", "Connaught Place"], generatedByAI: true },
];

export function getRiskColor(status: RiskStatus): string {
  switch (status) {
    case 'Safe': return 'hsl(152, 70%, 50%)';
    case 'Moderate': return 'hsl(45, 95%, 55%)';
    case 'Severe': return 'hsl(0, 72%, 55%)';
  }
}

export function getRiskBadgeClass(status: RiskStatus): string {
  switch (status) {
    case 'Safe': return 'badge-safe';
    case 'Moderate': return 'badge-moderate';
    case 'Severe': return 'badge-severe';
  }
}

export function getAqiColor(aqi: number): string {
  if (aqi <= 100) return 'hsl(152, 70%, 50%)';
  if (aqi <= 200) return 'hsl(45, 95%, 55%)';
  return 'hsl(0, 72%, 55%)';
}
