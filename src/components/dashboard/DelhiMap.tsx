import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Ward, getRiskColor } from '@/data/mockData';

interface DelhiMapProps {
  wards: Ward[];
  selectedWard: Ward | null;
  onWardSelect: (ward: Ward) => void;
}

export default function DelhiMap({ wards, selectedWard, onWardSelect }: DelhiMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: [28.6139, 77.2090],
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;
    setReady(true);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !ready) return;
    const map = mapInstance.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    wards.forEach(ward => {
      const color = getRiskColor(ward.riskStatus);
      const isSelected = selectedWard?.id === ward.id;
      const isSevere = ward.riskStatus === 'Severe';
      const radius = isSevere ? 18 : ward.riskStatus === 'Moderate' ? 14 : 11;

      // Outer glow
      const glow = L.circleMarker([ward.lat, ward.lng], {
        radius: radius + 8,
        fillColor: color,
        fillOpacity: isSevere ? 0.15 : 0.08,
        stroke: false,
        className: isSevere ? 'pulse-severe' : '',
      }).addTo(map);

      const marker = L.circleMarker([ward.lat, ward.lng], {
        radius,
        fillColor: color,
        fillOpacity: 0.7,
        color: isSelected ? '#fff' : color,
        weight: isSelected ? 3 : 1.5,
        opacity: isSelected ? 1 : 0.8,
      }).addTo(map);

      marker.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:12px;">
          <strong>${ward.name}</strong><br/>
          AQI: <span style="color:${color};font-weight:600">${ward.aqi}</span><br/>
          Credit: <span style="font-weight:600">${ward.creditScore}</span>
        </div>`,
        { direction: 'top', offset: [0, -radius], className: '' }
      );

      marker.on('click', () => onWardSelect(ward));

      markersRef.current.push(marker, glow);
    });
  }, [wards, selectedWard, ready, onWardSelect]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" style={{ minHeight: 500 }} />
  );
}
