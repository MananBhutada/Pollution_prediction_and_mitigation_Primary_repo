import { useState, useEffect } from 'react';
import { wards as initialWards, Ward } from '@/data/mockData';

export function useWardData() {
  const [wardData, setWardData] = useState<Ward[]>(initialWards);
  const [demoMode] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setWardData(prev => prev.map(ward => {
        const delta = Math.floor(Math.random() * 11) - 5;
        const newAqi = Math.max(30, ward.aqi + delta);
        let riskStatus = ward.riskStatus;
        if (newAqi <= 100) riskStatus = 'Safe';
        else if (newAqi <= 200) riskStatus = 'Moderate';
        else riskStatus = 'Severe';
        return { ...ward, aqi: newAqi, riskStatus };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const cityAqi = Math.round(wardData.reduce((s, w) => s + w.aqi, 0) / wardData.length);
  const predictedCityAqi = Math.round(wardData.reduce((s, w) => s + w.predictedAqi, 0) / wardData.length);
  const totalCredits = wardData.reduce((s, w) => s + w.creditScore, 0);
  const criticalWards = wardData.filter(w => w.riskStatus === 'Severe').length;

  return { wardData, cityAqi, predictedCityAqi, totalCredits, criticalWards, demoMode };
}
