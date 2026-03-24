import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Configuration
NUM_DAYS = 30
HOURS = NUM_DAYS * 24
# Using highly recognizable Delhi-NCR wards
WARDS = ["Noida_Sector_62", "Chanakyapuri", "Jahangirpuri", "Gurugram_Cyber_City"]
END_TIME = datetime.now().replace(minute=0, second=0, microsecond=0)
START_TIME = END_TIME - timedelta(hours=HOURS - 1)

# Generate time index
time_index = pd.date_range(start=START_TIME, end=END_TIME, freq='H')

data_rows = []

print("Generating the NCR God Dataset...")

# Ensure output directory exists so it doesn't crash on save
os.makedirs("data/raw_sensor_api", exist_ok=True)

for ward in WARDS:
    for t in time_index:
        # Base realistic ambient levels (Adjusted higher for Delhi NCR)
        base_pm25 = np.random.normal(85, 15)  # Delhi baseline
        base_pm10 = base_pm25 * 1.6 + np.random.normal(30, 8) 
        base_co = np.random.normal(1.5, 0.4)
        base_no2 = np.random.normal(40, 10)
        wind_speed = np.random.normal(10, 3) # km/h
        
        # --- THE HACKATHON DEMO TRIGGERS ---
        # We inject specific anomalies in the LAST 24 HOURS so your demo looks awesome
        is_demo_window = (END_TIME - t).total_seconds() <= (24 * 3600)
        
        # Anomaly 1: Massive Construction Dust in Noida (Triggers p-GRAP & Stokes Law)
        if ward == "Noida_Sector_62" and is_demo_window:
            base_pm10 += np.random.normal(350, 40) # Massive PM10 spike
            base_pm25 += np.random.normal(50, 15)  # Moderate PM2.5 spike
            
        # Anomaly 2: Nighttime Biomass/Waste Burning in Jahangirpuri (Triggers Source Apportionment ML)
        if ward == "Jahangirpuri" and is_demo_window and (t.hour >= 20 or t.hour <= 4):
            base_pm25 += np.random.normal(200, 30) # PM2.5 heavy
            base_co += np.random.normal(4.5, 0.6)  # CO spike (classic wood/waste burning)
            
        # Ensure no negative values before appending
        data_rows.append({
            "timestamp": t.strftime('%Y-%m-%d %H:%M:%S'),
            "ward_id": ward,
            "pm2_5": max(5.0, round(base_pm25, 2)),
            "pm10": max(10.0, round(base_pm10, 2)),
            "co_level": max(0.1, round(base_co, 2)),
            "no2_level": max(1.0, round(base_no2, 2)),
            "wind_speed": max(0.0, round(wind_speed, 2))
        })

# Create DataFrame
df = pd.DataFrame(data_rows)

# Save to the data ingestion layer
output_path = "data/raw_sensor_api/ward_mock_data.csv"
df.to_csv(output_path, index=False)

print(f"✅ Success! Generated {len(df)} rows of data.")
print(f"✅ Saved to: {output_path}")
print("🔥 Demo Spikes successfully injected in Noida_Sector_62 and Jahangirpuri for the last 24 hours.")