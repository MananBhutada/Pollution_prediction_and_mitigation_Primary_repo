import numpy as np
from datetime import datetime, timedelta

def generate_24h_forecast(ward_id: str, current_pm25: float, current_pm10: float) -> list:
    """
    Simulates a Temporal Fusion Transformer (TFT) 24-hour forecast.
    Creates a realistic time-series projection with day/night cyclical variance.
    """
    forecast = []
    current_time = datetime.now().replace(minute=0, second=0, microsecond=0)
    
    # Base trend modifier based on the ward's current state
    # If it's already bad, it might get worse before it gets better
    trend_modifier = 1.05 if current_pm25 > 150 else 0.95
    
    for hour in range(1, 25):
        future_time = current_time + timedelta(hours=hour)
        
        # Add a sine wave to simulate the natural drop in the afternoon and rise at night
        time_variance = np.sin((future_time.hour - 6) * (np.pi / 12)) * 15 
        
        # Calculate predicted values with some controlled randomness
        pred_pm25 = (current_pm25 * trend_modifier) + time_variance + np.random.normal(0, 5)
        pred_pm10 = (current_pm10 * trend_modifier) + (time_variance * 1.5) + np.random.normal(0, 8)
        
        forecast.append({
            "timestamp": future_time.strftime('%Y-%m-%d %H:%M:%S'),
            "ward_id": ward_id,
            "predicted_pm25": max(5.0, round(pred_pm25, 2)),
            "predicted_pm10": max(10.0, round(pred_pm10, 2))
        })
        
        # Gradually decay the trend so it doesn't spiral to infinity
        trend_modifier *= 0.98 
        
    return forecast

if __name__ == "__main__":
    print(f"Generating TFT Forecast for Noida_Sector_62 (Current PM2.5: 250)...")
    results = generate_24h_forecast("Noida_Sector_62", 250.0, 400.0)
    print(f"Prediction for +1 Hour: PM2.5 = {results[0]['predicted_pm25']}")
    print(f"Prediction for +12 Hours: PM2.5 = {results[11]['predicted_pm25']}")
    print(f"Prediction for +24 Hours: PM2.5 = {results[23]['predicted_pm25']}")