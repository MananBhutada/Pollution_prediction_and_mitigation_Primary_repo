const fs = require('fs');

const inputPath = './src/data/delhi_wards.json';
const outputPath = './src/data/delhi_wards_enriched.json';

const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

data.features = data.features.map((feature, i) => ({
  ...feature,
  properties: {
    ...feature.properties,
    ward: `Ward ${i + 1}`,
    zone: getZone(i),
    aqi: getAQI()
  }
}));

function getAQI() {
  return Math.floor(100 + Math.random() * 250);
}

function getZone(i) {
  const zones = ["North", "South", "East", "West", "Central"];
  return zones[i % zones.length];
}

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log("✅ Enriched GeoJSON created!");