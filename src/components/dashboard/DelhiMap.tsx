import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-velocity/dist/leaflet-velocity.css';
import 'leaflet-velocity';

import { getDelhiAQI } from '@/lib/aqi';

// ─── Persistent state (survives unmount/remount) ───────────────────────────────
const _persist = {
  windAngle: 90,
  windSpeed: 5,
  sites:     [] as ConstructionSite[],
  addMode:   false,
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConstructionSite {
  id: string;
  lat: number;
  lng: number;
  name: string;
  intensity: number;
}

interface DustParticle {
  id: number;
  lat: number;
  lng: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
  hue: number;
  mass: number;
}

interface WardDustInfluence {
  wardIndex: number;
  dustAQIDelta: number;
}

interface Props {
  onWardSelect?: (ward: any) => void;
  onAQIComputed?: (wards: any[]) => void;
}

// ─── AQI helpers ─────────────────────────────────────────────────────────────

const AQI_BANDS = [
  { max: 50,       color: '#00e400' },
  { max: 100,      color: '#ffff00' },
  { max: 200,      color: '#ff7e00' },
  { max: 300,      color: '#ff0000' },
  { max: Infinity, color: '#8f3f97' },
];

function aqiColor(aqi: number) {
  return AQI_BANDS.find(b => aqi <= b.max)!.color;
}

function centroid(feature: any): [number, number] {
  const coords =
    feature.geometry.type === 'Polygon'
      ? feature.geometry.coordinates[0]
      : feature.geometry.coordinates[0][0];
  let lat = 0, lng = 0;
  coords.forEach((c: number[]) => { lng += c[0]; lat += c[1]; });
  return [lat / coords.length, lng / coords.length];
}

function idw(lat: number, lng: number, stations: any[]): number {
  if (!stations.length) return 0;
  let sum = 0, wt = 0;
  stations.forEach(s => {
    const d = Math.hypot(s.lat - lat, s.lng - lng);
    const w = 1 / (d * d + 1e-6);
    sum += w * s.aqi;
    wt  += w;
  });
  return Math.round(sum / wt);
}

function pointInPolygon(lat: number, lng: number, feature: any): boolean {
  try {
    const rings =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates[0]]
        : feature.geometry.coordinates.map((p: any) => p[0]);
    let inside = false;
    for (const ring of rings) {
      let j = ring.length - 1;
      for (let i = 0; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];
        if (((yi > lat) !== (yj > lat)) &&
          (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
    }
    return inside;
  } catch { return false; }
}

// ─── Wind field ───────────────────────────────────────────────────────────────

function buildWindField(baseDeg: number, nx = 55, ny = 55) {
  const lo1 = 76.80, la1 = 29.25;
  const lo2 = 77.68, la2 = 28.30;
  const rad   = (baseDeg * Math.PI) / 180;
  const baseU =  Math.cos(rad);
  const baseV = -Math.sin(rad);
  const uData: number[] = [];
  const vData: number[] = [];

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const fx = i / nx, fy = j / ny;
      const tU =
        0.28 * Math.sin(fx * Math.PI * 4 + fy * Math.PI * 2) +
        0.14 * Math.sin(fx * Math.PI * 9 - fy * Math.PI * 6) +
        0.08 * Math.cos(fy * Math.PI * 8 + 1.2);
      const tV =
        0.28 * Math.cos(fy * Math.PI * 4 + fx * Math.PI * 2) +
        0.14 * Math.cos(fx * Math.PI * 6 + fy * Math.PI * 9) +
        0.08 * Math.sin(fx * Math.PI * 7 - 0.9);
      const spd = 4.5;
      uData.push(spd * (baseU + tU));
      vData.push(spd * (baseV + tV));
    }
  }

  const hdr = {
    nx, ny, lo1, la1, lo2, la2,
    dx: (lo2 - lo1) / (nx - 1),
    dy: (la1 - la2) / (ny - 1),
    parameterCategory: 2,
  };

  return [
    { header: { ...hdr, parameterNumber: 2 }, data: uData },
    { header: { ...hdr, parameterNumber: 3 }, data: vData },
  ];
}

// ─── DustLayer ────────────────────────────────────────────────────────────────

class DustLayer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private map: L.Map;
  private particles: DustParticle[] = [];
  private sites: ConstructionSite[] = [];
  private windAngle = 90;
  private windSpeed = 5;
  private animId: number | null = null;
  private frame = 0;
  private particleIdCounter = 0;

  private windU: number[] = [];
  private windV: number[] = [];
  private wfNx = 55; private wfNy = 55;
  private wfLo1 = 76.80; private wfLa1 = 29.25;
  private wfLo2 = 77.68; private wfLa2 = 28.30;

  public onDustUpdate?: (influences: WardDustInfluence[]) => void;
  private geoFeatures: any[] = [];

  // FIX: throttle ward checks — only run pointInPolygon every N frames
  private wardCheckFrame = 0;
  private particleWardCache: Map<number, number> = new Map();

  constructor(map: L.Map, canvas: HTMLCanvasElement) {
    this.map    = map;
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    const s = this.map.getSize();
    this.canvas.width  = s.x;
    this.canvas.height = s.y;
  }

  setSites(sites: ConstructionSite[]) { this.sites = sites; }
  setGeoFeatures(features: any[]) { this.geoFeatures = features; }

  setWind(angleDeg: number, speedMs: number) {
    this.windAngle = angleDeg;
    this.windSpeed = speedMs;
  }

  setWindField(uData: number[], vData: number[], nx: number, ny: number) {
    this.windU = uData;
    this.windV = vData;
    this.wfNx  = nx;
    this.wfNy  = ny;
  }

  private latlngToPx(lat: number, lng: number): [number, number] {
    const p = this.map.latLngToContainerPoint([lat, lng]);
    return [p.x, p.y];
  }

  private pxToLatLng(x: number, y: number): [number, number] {
    const ll = this.map.containerPointToLatLng([x, y]);
    return [ll.lat, ll.lng];
  }

  private msToPixels(ms: number): number {
    const zoom = this.map.getZoom();
    return ms * 0.006 * Math.pow(2, zoom - 11);
  }

  private sampleWind(lat: number, lng: number): [number, number] {
    if (!this.windU.length) return [0, 0];
    const fx = (lng - this.wfLo1) / (this.wfLo2 - this.wfLo1) * (this.wfNx - 1);
    const fy = (this.wfLa1 - lat) / (this.wfLa1 - this.wfLa2) * (this.wfNy - 1);
    const ix = Math.max(0, Math.min(this.wfNx - 2, Math.floor(fx)));
    const iy = Math.max(0, Math.min(this.wfNy - 2, Math.floor(fy)));
    const tx = fx - ix, ty = fy - iy;
    const idx = (r: number, c: number) => r * this.wfNx + c;
    const lerp = (arr: number[]) =>
      arr[idx(iy,   ix  )] * (1-tx)*(1-ty) +
      arr[idx(iy,   ix+1)] *    tx *(1-ty) +
      arr[idx(iy+1, ix  )] * (1-tx)*   ty  +
      arr[idx(iy+1, ix+1)] *    tx *   ty;
    return [lerp(this.windU), lerp(this.windV)];
  }

  private spawn() {
    if (!this.sites.length || !this.windU.length) return;
    const speedFactor = Math.min(this.windSpeed / 10, 2.0);
    const pxPerMs = this.msToPixels(1);

    this.sites.forEach(site => {
      const baseCount = [0, 3, 6, 10][site.intensity];
      const count = Math.round(baseCount * (0.4 + 0.6 * speedFactor));
      const [cx, cy] = this.latlngToPx(site.lat, site.lng);
      const [U, V] = this.sampleWind(site.lat, site.lng);
      const windMag = Math.hypot(U, V) || 0.01;
      const baseVx =  U / windMag;
      const baseVy = -V / windMag;

      for (let i = 0; i < count; i++) {
        const spreadMax = 0.9 - speedFactor * 0.35;
        const spread    = (Math.random() - 0.5) * 2 * spreadMax;
        const cs = Math.cos(spread), ss = Math.sin(spread);
        const rvx = baseVx * cs - baseVy * ss;
        const rvy = baseVx * ss + baseVy * cs;
        const spd = windMag * (0.5 + Math.random() * 0.8) * pxPerMs;
        const mass = 0.5 + Math.random() * 1.5;

        this.particles.push({
          id:      this.particleIdCounter++,
          lat:     site.lat,
          lng:     site.lng,
          x:       cx + (Math.random() - 0.5) * 18,
          y:       cy + (Math.random() - 0.5) * 18,
          vx:      rvx * spd,
          vy:      rvy * spd,
          life:    1.0,
          maxLife: 1.0,
          size:    1.8 + Math.random() * 2.2 * Math.sqrt(site.intensity),
          opacity: 0.35 + Math.random() * 0.45,
          hue:     16 + Math.random() * 26,
          mass,
        });
      }
    });

    // FIX: tighter cap to reduce per-frame work
    if (this.particles.length > 2500) {
      this.particles = this.particles.slice(-2500);
    }
  }

  private update() {
    const speedNorm = Math.min(this.windSpeed / 15, 1);
    const baseDecay = 0.0015 + speedNorm * 0.005;
    const gravScale = (1 - speedNorm * 0.65);
    const pxPerMs   = this.msToPixels(1);

    this.particles = this.particles.filter(p => p.life > 0.01);

    // FIX: only run ward checks every 15 frames
    const doWardCheck = this.wardCheckFrame % 15 === 0;
    this.wardCheckFrame++;

    const dustByWard: Map<number, number> = new Map();

    this.particles.forEach(p => {
      const [pLat, pLng] = this.pxToLatLng(p.x, p.y);
      p.lat = pLat;
      p.lng = pLng;

      const [U, V] = this.sampleWind(pLat, pLng);
      const windForce = pxPerMs / p.mass;
      const targetVx  =  U * windForce;
      const targetVy  = -V * windForce;
      const blend     = 0.08 + speedNorm * 0.06;

      p.vx += (targetVx - p.vx) * blend;
      p.vy += (targetVy - p.vy) * blend;
      p.vy += 0.007 * p.mass * gravScale;
      p.vx += (Math.random() - 0.5) * 0.12;
      p.vy += (Math.random() - 0.5) * 0.08;

      const drag = 0.993 - p.mass * 0.003;
      p.vx *= drag;
      p.vy *= drag;
      p.x  += p.vx;
      p.y  += p.vy;
      p.life -= baseDecay + Math.random() * 0.001;

      // FIX: use cached ward index, refresh only every 15 frames
      const influence = p.life * p.size * 1.5;
      if (influence > 0.05 && this.geoFeatures.length) {
        let wardIdx = this.particleWardCache.get(p.id);

        if (doWardCheck || wardIdx === undefined) {
          wardIdx = undefined;
          for (let wi = 0; wi < this.geoFeatures.length; wi++) {
            if (pointInPolygon(p.lat, p.lng, this.geoFeatures[wi])) {
              wardIdx = wi;
              break;
            }
          }
          if (wardIdx !== undefined) {
            this.particleWardCache.set(p.id, wardIdx);
          } else {
            this.particleWardCache.delete(p.id);
          }
        }

        if (wardIdx !== undefined) {
          dustByWard.set(wardIdx, (dustByWard.get(wardIdx) ?? 0) + influence);
        }
      }
    });

    // Clean up cache for dead particles
    if (doWardCheck) {
      const liveIds = new Set(this.particles.map(p => p.id));
      this.particleWardCache.forEach((_, id) => {
        if (!liveIds.has(id)) this.particleWardCache.delete(id);
      });
    }

    // FIX: only emit dust update every 20 frames to avoid re-render storm
    if (this.frame % 20 === 0 && this.onDustUpdate) {
      if (dustByWard.size > 0) {
        const influences: WardDustInfluence[] = [];
        dustByWard.forEach((density, wardIndex) => {
          const aqiDelta = Math.min(Math.round(density * 0.8), 200);
          influences.push({ wardIndex, dustAQIDelta: aqiDelta });
        });
        this.onDustUpdate(influences);
      } else {
        this.onDustUpdate([]);
      }
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // FIX: plain arc instead of radial gradient per particle — massive fps gain
    this.particles.forEach(p => {
      const lifeRatio = p.life;
      const alpha  = p.opacity * Math.pow(lifeRatio, 0.55);
      const radius = p.size * (0.5 + 0.5 * lifeRatio) * 3.2;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 65%, 58%, ${Math.min(alpha * 0.6, 1).toFixed(3)})`;
      this.ctx.fill();
    });
  }

  start() {
    if (this.animId !== null) return; // already running
    const loop = () => {
      this.frame++;
      const spawnEvery = this.windSpeed < 1 ? 10 : 2;
      if (this.frame % spawnEvery === 0) this.spawn();
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = [];
    this.particleWardCache.clear();
    this.onDustUpdate?.([]);
  }

  clear() {
    this.particles = [];
    this.particleWardCache.clear();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.onDustUpdate?.([]);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DelhiMap({ onWardSelect, onAQIComputed }: Props) {
  const mapRef       = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const mapInstance  = useRef<L.Map | null>(null);
  const geoLayerRef  = useRef<L.GeoJSON | null>(null);
  const windLayerRef = useRef<any>(null);
  const dustRef      = useRef<DustLayer | null>(null);
  const markersRef   = useRef<Map<string, L.Marker>>(new Map());
  // FIX: only fitBounds once on first load
  const fitDoneRef   = useRef(false);

  const [geoData,    setGeoData]    = useState<any>(null);
  const [stations,   setStations]   = useState<any[]>([]);
  const [simRunning, setSimRunning] = useState(true);
  const [dustDeltas, setDustDeltas] = useState<Map<number, number>>(new Map());

  // FIX: read initial values from _persist so they survive page navigation
  const [windAngle, setWindAngle] = useState(_persist.windAngle);
  const [windSpeed, setWindSpeed] = useState(_persist.windSpeed);
  const [addMode,   setAddMode]   = useState(_persist.addMode);
  const [sites,     setSites]     = useState<ConstructionSite[]>(_persist.sites);

  // FIX: ward base AQI stored in ref for fast style updates without rebuild
  const wardBaseAQIRef = useRef<Map<number, number>>(new Map());
  const geoFeaturesRef = useRef<any[]>([]);

  // ── Sync state back to persist on every change ───────────────────────────
  useEffect(() => { _persist.windAngle = windAngle; }, [windAngle]);
  useEffect(() => { _persist.windSpeed = windSpeed; }, [windSpeed]);
  useEffect(() => { _persist.addMode   = addMode;   }, [addMode]);
  useEffect(() => { _persist.sites     = sites;     }, [sites]);

  // ── Data fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/delhi_wards.geojson').then(r => r.json()).then(setGeoData);
  }, []);

  useEffect(() => {
    getDelhiAQI().then(setStations);
  }, []);

  // ── Map init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([28.6139, 77.2090], 11);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
    }).addTo(map);

    mapInstance.current = map;

    if (canvasRef.current) {
      const dust = new DustLayer(map, canvasRef.current);
      dustRef.current = dust;

      // FIX: restore sites from persist on remount
      if (_persist.sites.length) {
        dust.setSites(_persist.sites);
      }

      dust.onDustUpdate = (influences) => {
        setDustDeltas(prev => {
          const next = new Map<number, number>();
          influences.forEach(({ wardIndex, dustAQIDelta }) => {
            next.set(wardIndex, dustAQIDelta);
          });
          if (next.size !== prev.size) return next;
          let same = true;
          next.forEach((v, k) => { if (prev.get(k) !== v) same = false; });
          return same ? prev : next;
        });
      };

      dust.start();

      map.on('move zoom resize', () => {
        if (!canvasRef.current) return;
        const tl = map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(canvasRef.current, tl);
        dust.resize();
      });
    }

    return () => {
      dustRef.current?.stop();
      try { mapInstance.current?.remove(); } catch {}
      mapInstance.current = null;
      fitDoneRef.current  = false;
    };
  }, []);

  // ── Wind layer ────────────────────────────────────────────────────────────
  const rebuildWind = useCallback((angle: number, speed: number) => {
    const map = mapInstance.current;
    if (!map) return;

    if (windLayerRef.current) {
      try { map.removeLayer(windLayerRef.current); } catch {}
    }

    if (!simRunning) return;

    const fieldData = buildWindField(angle);

    windLayerRef.current = (L as any).velocityLayer({
      data: fieldData,
      velocityScale:      0.015,
      particleMultiplier: 0.0035,
      frameRate:          60,
      maxVelocity:        12,
      colorScale: [
        'rgba( 80,200,255,0.60)',
        'rgba( 30,220,255,0.75)',
        'rgba(  0,255,200,0.88)',
        'rgba(  0,255,140,0.98)',
        'rgba(180,255,100,1.00)',
      ],
      lineWidth: 1.4,
      opacity:   0.9,
    }).addTo(map);

    const nx = fieldData[0].header.nx;
    const ny = fieldData[0].header.ny;
    dustRef.current?.setWindField(fieldData[0].data, fieldData[1].data, nx, ny);
    dustRef.current?.setWind(angle, speed);
  }, [simRunning]);

  useEffect(() => {
    const id = setTimeout(() => rebuildWind(windAngle, windSpeed), 120);
    return () => clearTimeout(id);
  }, [windAngle, windSpeed, rebuildWind]);

  // ── GeoJSON initial build — only on geoData + stations change ─────────────
  // FIX: dustDeltas removed from deps — style updates handled by fast path below
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !geoData) return;

    if (geoLayerRef.current) map.removeLayer(geoLayerRef.current);

    const features = geoData.features as any[];
    geoFeaturesRef.current = features;
    dustRef.current?.setGeoFeatures(features);

    const newBaseAQI = new Map<number, number>();
    const computed: any[] = [];

    const layer = L.geoJSON(geoData, {
      style: (f: any) => {
        const fi = features.indexOf(f);
        const [lat, lng] = centroid(f);
        const baseAQI = idw(lat, lng, stations);
        newBaseAQI.set(fi, baseAQI);
        return {
          fillColor:   aqiColor(baseAQI),
          weight:      0.8,
          color:       '#000',
          fillOpacity: 0.55,
        };
      },
      onEachFeature: (f: any, lyr: any) => {
        const fi = features.indexOf(f);
        const [lat, lng] = centroid(f);
        const baseAQI = idw(lat, lng, stations);
        const name    = f.properties?.WardName ?? 'Ward';

        // store ward index on layer for fast lookup
        (lyr as any)._wardIndex = fi;

        computed.push({ name, aqi: baseAQI, baseAQI, dustDelta: 0 });

        lyr.bindTooltip(
          `<div style="font:12px monospace">
             <strong>${name}</strong><br/>
             AQI: <span style="color:${aqiColor(baseAQI)};font-weight:bold">${baseAQI}</span>
           </div>`,
          { sticky: true }
        );
      },
    }).addTo(map);

    wardBaseAQIRef.current = newBaseAQI;
    geoLayerRef.current    = layer;

    // FIX: fitBounds only once — never again so zoom never snaps back
    if (!fitDoneRef.current) {
      map.fitBounds(layer.getBounds());
      fitDoneRef.current = true;
    }

    onAQIComputed?.(computed);
  }, [geoData, stations]);

  // ── Dust style update — fast path, no layer rebuild ───────────────────────
  // FIX: setStyle() in-place instead of destroying and recreating the GeoJSON layer
  useEffect(() => {
    if (!geoLayerRef.current) return;

    const updatedWards: any[] = [];

    geoLayerRef.current.eachLayer((lyr: any) => {
      const fi        = (lyr as any)._wardIndex as number;
      const baseAQI   = wardBaseAQIRef.current.get(fi) ?? 0;
      const dustDelta = simRunning ? (dustDeltas.get(fi) ?? 0) : 0;
      const totalAQI  = Math.min(baseAQI + dustDelta, 500);
      const name      = geoFeaturesRef.current[fi]?.properties?.WardName ?? 'Ward';

      lyr.setStyle({
        fillColor:   aqiColor(totalAQI),
        fillOpacity: 0.55 + Math.min(dustDelta / 300, 0.2),
      });

      lyr.setTooltipContent(
        `<div style="font:12px monospace">
           <strong>${name}</strong><br/>
           AQI: <span style="color:${aqiColor(totalAQI)};font-weight:bold">${totalAQI}</span>
           ${dustDelta > 0 ? `<br/><span style="color:#ff9944;font-size:10px">+${dustDelta} from dust 🏗️</span>` : ''}
         </div>`
      );

      updatedWards.push({ name, aqi: totalAQI, baseAQI, dustDelta });
    });

    // Always notify policy page, even when dust clears (empty deltas = base AQI)
    onAQIComputed?.(updatedWards);

  }, [dustDeltas, simRunning]);

  // ── Simulation stop/start ─────────────────────────────────────────────────
  const toggleSimulation = useCallback(() => {
    const map = mapInstance.current;
    setSimRunning(prev => {
      const next = !prev;
      if (!next) {
        dustRef.current?.stop();
        if (windLayerRef.current && map) {
          try { map.removeLayer(windLayerRef.current); } catch {}
          windLayerRef.current = null;
        }
        setDustDeltas(new Map());
      } else {
        dustRef.current?.start();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (simRunning) rebuildWind(windAngle, windSpeed);
  }, [simRunning]);

  // ── Click to add construction site ───────────────────────────────────────
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const onClick = (e: L.LeafletMouseEvent) => {
      if (!addMode) return;

      const id   = `site-${Date.now()}`;
      const name = `Site ${markersRef.current.size + 1}`;

      const newSite: ConstructionSite = {
        id, name, intensity: 2,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            background:rgba(255,130,0,0.92);
            border:2px solid rgba(255,220,100,0.9);
            border-radius:50%;
            width:30px;height:30px;
            display:flex;align-items:center;justify-content:center;
            font-size:16px;
            box-shadow:0 0 10px rgba(255,140,0,0.7),0 0 20px rgba(255,100,0,0.4);
          ">🏗️</div>`,
        iconSize:   [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([newSite.lat, newSite.lng], { icon })
        .addTo(map)
        .bindTooltip(`<b>${name}</b>`);

      markersRef.current.set(id, marker);

      setSites(prev => {
        const updated = [...prev, newSite];
        dustRef.current?.setSites(updated);
        dustRef.current?.setGeoFeatures(geoFeaturesRef.current);
        _persist.sites = updated;
        return updated;
      });
    };

    map.on('click', onClick);
    return () => { map.off('click', onClick); };
  }, [addMode]);

  // ── Intensity change ──────────────────────────────────────────────────────
  const setIntensity = (id: string, intensity: number) => {
    setSites(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, intensity } : s);
      dustRef.current?.setSites(updated);
      _persist.sites = updated;
      return updated;
    });
  };

  const removeSite = (id: string) => {
    const map = mapInstance.current;
    const marker = markersRef.current.get(id);
    if (map && marker) map.removeLayer(marker);
    markersRef.current.delete(id);

    setSites(prev => {
      const updated = prev.filter(s => s.id !== id);
      dustRef.current?.setSites(updated);
      _persist.sites = updated;
      return updated;
    });
  };

  // ── Reset all sites ───────────────────────────────────────────────────────
  const resetAll = () => {
    const map = mapInstance.current;
    markersRef.current.forEach(marker => {
      if (map) try { map.removeLayer(marker); } catch {}
    });
    markersRef.current.clear();
    _persist.sites   = [];
    _persist.addMode = false;
    setSites([]);
    dustRef.current?.setSites([]);
    dustRef.current?.clear();
    setDustDeltas(new Map());
    setAddMode(false);

    // Push base AQI back to policy page immediately on reset
    const baseWards: any[] = [];
    geoLayerRef.current?.eachLayer((lyr: any) => {
      const fi      = (lyr as any)._wardIndex as number;
      const baseAQI = wardBaseAQIRef.current.get(fi) ?? 0;
      const name    = geoFeaturesRef.current[fi]?.properties?.WardName ?? 'Ward';
      lyr.setStyle({ fillColor: aqiColor(baseAQI), fillOpacity: 0.55 });
      lyr.setTooltipContent(
        `<div style="font:12px monospace">
           <strong>${name}</strong><br/>
           AQI: <span style="color:${aqiColor(baseAQI)};font-weight:bold">${baseAQI}</span>
         </div>`
      );
      baseWards.push({ name, aqi: baseAQI, baseAQI, dustDelta: 0 });
    });
    onAQIComputed?.(baseWards);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', fontFamily: '"Courier New", monospace' }}>

      {/* ── Controls ── */}
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 1000,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>

        <div style={{ display: 'flex', gap: 6 }}>
          <CtrlBtn
            active={!simRunning}
            color={simRunning ? '#00dfff' : '#ff4444'}
            onClick={toggleSimulation}
          >
            {simRunning ? '⏸ Pause Sim' : '▶ Resume Sim'}
          </CtrlBtn>
          <CtrlBtn color="#ff6622" onClick={resetAll}>
            ↺ Reset
          </CtrlBtn>
        </div>

        <Panel>
          <Label>💨 WIND DIR · {windAngle}°</Label>
          <input
            type="range" min={0} max={360} value={windAngle}
            onChange={e => setWindAngle(Number(e.target.value))}
            style={{ width: 160, accentColor: '#00dfff', display: 'block', marginTop: 4 }}
          />
          <div style={{ fontSize: 10, opacity: 0.55, marginTop: 3 }}>
            {compassLabel(windAngle)}
          </div>
          <div style={{ marginTop: 10 }}>
            <Label>💨 WIND SPEED · {windSpeed} m/s</Label>
            <input
              type="range" min={0} max={20} step={0.5} value={windSpeed}
              onChange={e => setWindSpeed(Number(e.target.value))}
              style={{ width: 160, accentColor: '#00ffaa', display: 'block', marginTop: 4 }}
            />
            <div style={{ fontSize: 10, opacity: 0.55, marginTop: 3 }}>
              {windSpeed < 2 ? 'Calm — dust settles near source'
                : windSpeed < 7 ? 'Moderate — plume extends downwind'
                : 'Strong — dust disperses widely'}
            </div>
          </div>
        </Panel>

        <button
          onClick={() => setAddMode(m => !m)}
          style={{
            background: addMode ? 'rgba(255,130,0,0.88)' : 'rgba(10,12,24,0.82)',
            border: `1px solid ${addMode ? 'rgba(255,200,80,0.8)' : 'rgba(0,220,255,0.25)'}`,
            borderRadius: 8, padding: '8px 14px',
            color: addMode ? '#fff' : '#b0d8ef',
            fontSize: 12, cursor: 'pointer',
            backdropFilter: 'blur(8px)', letterSpacing: 0.5,
            boxShadow: addMode ? '0 0 12px rgba(255,140,0,0.5)' : 'none',
          }}
        >
          {addMode ? '✅ Click map to place site' : '🏗️ Add Construction Site'}
        </button>

        {sites.length > 0 && (
          <Panel>
            <Label>SITES · {sites.length}</Label>
            {sites.map(s => (
              <div key={s.id} style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, opacity: 0.75 }}>{s.name}</span>
                  <button onClick={() => removeSite(s.id)} style={{
                    background: 'none', border: 'none', color: 'rgba(255,100,100,0.7)',
                    cursor: 'pointer', fontSize: 12, lineHeight: 1,
                  }}>✕</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, opacity: 0.55, marginRight: 2 }}>Dust:</span>
                  {[1, 2, 3].map(i => (
                    <button key={i} onClick={() => setIntensity(s.id, i)} style={{
                      width: 24, height: 24,
                      background: s.intensity >= i
                        ? `rgba(255,${Math.round(140 - i * 35)},0,0.85)`
                        : 'rgba(50,55,70,0.6)',
                      border: s.intensity === i ? '1px solid rgba(255,220,100,0.8)' : '1px solid rgba(100,110,130,0.4)',
                      borderRadius: 5, color: '#fff', fontSize: 10,
                      cursor: 'pointer', fontFamily: 'monospace',
                    }}>{i}</button>
                  ))}
                  <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 4 }}>
                    {['', 'Low', 'Med', 'High'][s.intensity]}
                  </span>
                </div>
              </div>
            ))}
          </Panel>
        )}
      </div>

      {/* ── Legend ── */}
      <div style={{ position: 'absolute', bottom: 26, right: 10, zIndex: 1000 }}>
        <Panel style={{ minWidth: 165 }}>
          <Label>AQI SCALE</Label>
          {[
            ['≤ 50',  'Good',           '#00e400'],
            ['≤ 100', 'Moderate',       '#ffff00'],
            ['≤ 200', 'Unhealthy',      '#ff7e00'],
            ['≤ 300', 'Very Unhealthy', '#ff0000'],
            ['300+',  'Hazardous',      '#8f3f97'],
          ].map(([range, label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
              <div style={{ width: 11, height: 11, background: color as string, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 10, opacity: 0.8 }}>{range} {label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 11, height: 11, background: 'rgba(220,140,50,0.85)', borderRadius: '50%', flexShrink: 0 }} />
              <span style={{ fontSize: 10, opacity: 0.75 }}>Construction dust plume</span>
            </div>
            {dustDeltas.size > 0 && (
              <div style={{ marginTop: 6, fontSize: 10, color: '#ff9944', opacity: 0.9 }}>
                ⚠ {dustDeltas.size} ward{dustDeltas.size > 1 ? 's' : ''} affected by dust
              </div>
            )}
          </div>

          <div style={{
            marginTop: 8, paddingTop: 7,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: simRunning ? '#00ff88' : '#ff4444',
              boxShadow: simRunning ? '0 0 6px #00ff88' : 'none',
              animation: simRunning ? 'pulse 1.5s infinite' : 'none',
            }} />
            <span style={{ fontSize: 10, opacity: 0.7 }}>
              {simRunning ? 'Simulation running' : 'Simulation paused'}
            </span>
          </div>
        </Panel>
      </div>

      {/* ── Map + canvas ── */}
      <div style={{ position: 'relative', height: 580 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            pointerEvents: 'none',
            zIndex: 500,
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.3; }
        }
      `}</style>
    </div>
  );
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(8,10,22,0.84)',
      border: '1px solid rgba(0,210,255,0.2)',
      borderRadius: 9,
      padding: '10px 13px',
      color: '#b8dff0',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: 1.2, opacity: 0.55, marginBottom: 2, textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function CtrlBtn({ children, onClick, active, color }: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `rgba(255,68,68,0.15)` : 'rgba(8,10,22,0.84)',
        border: `1px solid ${color ?? 'rgba(0,210,255,0.3)'}`,
        borderRadius: 7,
        padding: '7px 12px',
        color: color ?? '#b8dff0',
        fontSize: 11,
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        letterSpacing: 0.5,
        boxShadow: active ? `0 0 10px rgba(255,68,68,0.3)` : 'none',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}

function compassLabel(deg: number) {
  const dirs = ['E','NE','N','NW','W','SW','S','SE','E'];
  return `From ${dirs[Math.round(deg / 45)]}`;
}