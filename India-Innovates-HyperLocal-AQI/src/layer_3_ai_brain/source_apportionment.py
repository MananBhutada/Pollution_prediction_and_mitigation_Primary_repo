def classify_pollution_source(pm25: float, pm10: float, co_level: float, time_of_day: int) -> str:
    """
    Hackathon-optimized heuristic model for Source Apportionment.
    Returns the primary source of pollution based on pollutant ratios and time.
    """
    
    # Calculate the PM2.5 to PM10 ratio
    # High PM10 relative to PM2.5 usually means coarse dust (construction/road dust)
    pm_ratio = pm25 / pm10 if pm10 > 0 else 0

    # Rule 1: Construction Dust Anomaly (Matches our Noida Spike)
    if pm10 > 200 and pm_ratio < 0.4:
        return "Heavy Construction / Road Dust"
        
    # Rule 2: Biomass / Waste Burning (Matches our Jahangirpuri Spike)
    # High CO, high PM2.5, usually happens late at night or early morning
    elif pm25 > 120 and co_level > 2.5 and (time_of_day >= 20 or time_of_day <= 5):
        return "Biomass / Solid Waste Burning"
        
    # Rule 3: Heavy Vehicular Traffic
    # High CO and NO2 (we use CO as a proxy here), usually during rush hours
    elif co_level > 1.5 and (8 <= time_of_day <= 11 or 17 <= time_of_day <= 20):
        return "Vehicular Emissions (Rush Hour)"
        
    # Rule 4: Baseline City Smog
    elif pm25 > 60:
        return "General Urban Smog / Secondary Aerosols"
        
    # Default Clean Air
    else:
        return "Background Ambient Levels"

# Quick test to make sure it works if we run this file directly!
if __name__ == "__main__":
    print("Testing Source Apportionment Engine...")
    print(f"Test 1 (Noida Spike): {classify_pollution_source(90, 360, 1.2, 14)}")
    print(f"Test 2 (Jahangirpuri Spike): {classify_pollution_source(210, 250, 4.8, 23)}")