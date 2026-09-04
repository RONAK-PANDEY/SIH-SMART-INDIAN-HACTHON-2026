from typing import Dict, Any

class CongestionPredictor:
    """
    Predicts OPD inflow spikes and hospital load balance recommendations.
    """
    @staticmethod
    def forecast_department_congestion(department: str, current_inflow_rate: float, capacity: int) -> Dict[str, Any]:
        load_ratio = current_inflow_rate / max(1, capacity)
        if load_ratio > 0.85:
            severity = "CRITICAL_OVERLOAD"
            action = "Trigger automated load-shedding referral suggestions to nearest tier-2 facility"
        elif load_ratio > 0.65:
            severity = "MODERATE_CONGESTION"
            action = "Notify OPD buffer pool doctors to open additional counters"
        else:
            severity = "NORMAL"
            action = "Nominal queue routing active"
            
        return {
            "department": department,
            "load_percentage": round(load_ratio * 100, 1),
            "severity": severity,
            "recommended_action": action
        }

congestion_model = CongestionPredictor()
