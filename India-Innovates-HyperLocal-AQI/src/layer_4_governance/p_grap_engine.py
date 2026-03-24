def evaluate_p_grap(predicted_pm25_max: float) -> dict:
    """
    Evaluates the worst-case forecasted PM2.5 and triggers Pre-emptive GRAP actions.
    Thresholds loosely based on Delhi NCR Commission for Air Quality Management.
    """
    
    if predicted_pm25_max > 300:
        return {
            "stage": "STAGE 4 (SEVERE+)",
            "status": "CRITICAL EMERGENCY",
            "actions": [
                "Ban on all diesel heavy vehicles entering city limits.",
                "Halt ALL construction activities, including public projects.",
                "Mandatory 50% work-from-home for corporate offices.",
                "Deploy anti-smog guns to all major intersections immediately."
            ]
        }
    elif predicted_pm25_max > 200:
        return {
            "stage": "STAGE 3 (SEVERE)",
            "status": "HIGH ALERT",
            "actions": [
                "Ban on BS-III petrol and BS-IV diesel light motor vehicles.",
                "Halt non-essential construction (painting, welding, earthwork).",
                "Increase frequency of mechanized road sweeping."
            ]
        }
    elif predicted_pm25_max > 100:
        return {
            "stage": "STAGE 2 (VERY POOR)",
            "status": "WARNING",
            "actions": [
                "Ban on use of coal/firewood in tandoors at hotels.",
                "Enhance parking fees to discourage private transport.",
                "Targeted deployment of traffic police at congestion nodes."
            ]
        }
    else:
        return {
            "stage": "STAGE 1 (MODERATE/POOR)",
            "status": "MONITORING",
            "actions": [
                "Enforce strict ban on open waste burning.",
                "Ensure periodic water sprinkling on unpaved roads."
            ]
        }

if __name__ == "__main__":
    print("Testing p-GRAP Engine...")
    print("\nTest: Forecast shows PM2.5 hitting 315 tomorrow.")
    grap_response = evaluate_p_grap(315.0)
    print(f"Triggered: {grap_response['stage']} - {grap_response['status']}")
    for action in grap_response['actions']:
        print(f" - {action}")