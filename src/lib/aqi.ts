export async function getDelhiAQI() {
  try {
    const res = await fetch(
      `https://api.waqi.info/search/?token=6a5e47b50af27d24b7b489ec0250f27ada90bf10&keyword=delhi`
    );

    const json = await res.json();

    return json.data
      .filter((s: any) => s.aqi && s.aqi !== '-')
      .map((s: any) => ({
        name: s.station.name,
        lat: s.station.geo[0],
        lng: s.station.geo[1],
        aqi: Number(s.aqi)
      }));

  } catch (err) {
    console.error("AQI API error", err);
    return [];
  }
}