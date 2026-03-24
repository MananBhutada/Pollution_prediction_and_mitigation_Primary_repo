from fastapi import FastAPI
import pandas as pd
import os

app = FastAPI()

@app.get("/get-ai-results")
def get_results():
    # This path matches the data structure we built
    data_path = "data/raw_sensor_api/real_ai_forecast.csv"
    
    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
        # Based on your .ipynb, your columns are likely 'PM2.5', 'PM10', etc.
        # We will return the last 24 hours of your TFT forecast
        return df.tail(24).to_dict(orient="records")
    return {"status": "Waiting for CSV export from Notebook"}

@app.get("/mitigation-logic")
def mitigation(pm_initial: float, intensity: float):
    # This is YOUR exact logic from the notebook
    # PM_final = PM_initial * (1 - (0.05 * water_intensity))
    reduction = 0.05 * intensity
    pm_final = pm_initial * (1 - reduction)
    return {
        "initial": pm_initial,
        "final": round(pm_final, 2),
        "reduction_pct": round(reduction * 100, 2)
    }