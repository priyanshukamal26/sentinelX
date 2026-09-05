"""
Shared feature engineering module for SentinelX.
Used by BOTH the training pipeline and the live API serving path,
ensuring training-time and serving-time feature logic never drift apart.

Per 05_backend_api_spec.md: "implement this as a small shared Python module
(shared/features.py) imported by both."
"""

import re
from typing import Dict, Any, Optional

# ───────────────────────────────────────────────────────────────────────
# Tier classification: metro cities → Tier 1, major cities → Tier 2, rest → Tier 3
# Per 02_dataset_spec.md §Step 2
# ───────────────────────────────────────────────────────────────────────

# Tier 1 metros and their common pincode prefixes
TIER_1_CITIES = {
    "Mumbai": ["400"],
    "Delhi-NCR": ["110", "120", "121", "122", "201", "226"],
    "Bengaluru": ["560"],
    "Chennai": ["600"],
    "Kolkata": ["700"],
    "Hyderabad": ["500"],
    "Pune": ["411"],
    "Ahmedabad": ["380"],
}

# Tier 2: ~80-100 well-known state-capital/large-city pincode ranges
TIER_2_CITIES = {
    "Jaipur": ["302"],
    "Lucknow": ["226"],
    "Indore": ["452"],
    "Coimbatore": ["641"],
    "Patna": ["800"],
    "Surat": ["395"],
    "Nagpur": ["440"],
    "Bhopal": ["462"],
    "Chandigarh": ["160"],
    "Kochi": ["682"],
    "Visakhapatnam": ["530"],
    "Vadodara": ["390"],
    "Agra": ["282"],
    "Varanasi": ["221"],
    "Thiruvananthapuram": ["695"],
    "Kanpur": ["208"],
    "Nashik": ["422"],
    "Rajkot": ["360"],
    "Guwahati": ["781"],
    "Mysuru": ["570"],
    "Jodhpur": ["342"],
    "Ranchi": ["834"],
    "Dehradun": ["248"],
    "Amritsar": ["143"],
    "Raipur": ["492"],
    "Vijayawada": ["520"],
    "Ludhiana": ["141"],
    "Madurai": ["625"],
    "Meerut": ["250"],
    "Jabalpur": ["482"],
    "Aurangabad": ["431"],
    "Jammu": ["180"],
    "Gwalior": ["474"],
    "Bareilly": ["243"],
    "Aligarh": ["202"],
    "Moradabad": ["244"],
    "Tiruchirappalli": ["620"],
    "Salem": ["636"],
    "Bhiwandi": ["421"],
    "Gorakhpur": ["273"],
    "Hubli-Dharwad": ["580"],
    "Mangalore": ["575"],
    "Kollam": ["691"],
    "Thrissur": ["680"],
    "Kozhikode": ["673"],
    "Udaipur": ["313"],
    "Bilaspur": ["495"],
    "Bhilai": ["490"],
    "Cuttack": ["753"],
    "Bhubaneswar": ["751"],
    "Warangal": ["506"],
    "Guntur": ["522"],
    "Nellore": ["524"],
    "Tirupati": ["517"],
    "Shimla": ["171"],
    "Pondicherry": ["605"],
    "Durgapur": ["713"],
    "Siliguri": ["734"],
    "Jamshedpur": ["831"],
    "Bokaro": ["827"],
    "Dhanbad": ["826"],
    "Solapur": ["413"],
    "Kolhapur": ["416"],
    "Nanded": ["431"],
    "Sangli": ["416"],
    "Ujjain": ["456"],
    "Sagar": ["470"],
    "Muzaffarpur": ["842"],
    "Gaya": ["823"],
    "Bhagalpur": ["812"],
    "Rourkela": ["769"],
    "Sambalpur": ["768"],
    "Allahabad": ["211"],
    "Mathura": ["281"],
    "Firozabad": ["283"],
    "Saharanpur": ["247"],
    "Jalandhar": ["144"],
    "Bathinda": ["151"],
    "Patiala": ["147"],
}

# Zone complexity mapping by state (per 02_dataset_spec.md)
# Remote zones (Northeast, J&K) → high, semi-urban states → medium, rest → low
HIGH_ZONE_STATES = {
    "Arunachal Pradesh", "Assam", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Tripura", "Sikkim", "Jammu & Kashmir",
    "Jammu and Kashmir", "Ladakh", "Andaman and Nicobar Islands",
    "Lakshadweep",
}

MEDIUM_ZONE_STATES = {
    "Himachal Pradesh", "Uttarakhand", "Jharkhand", "Chhattisgarh",
    "Odisha", "Goa", "Puducherry",
}

# Landmark keywords for address quality assessment (per 02_dataset_spec.md)
LANDMARK_PATTERN = re.compile(
    r'\b(near|opposite|behind|gali|chowk|beside|opp|next\s+to|lane|cross)\b',
    re.IGNORECASE
)

# All tier-1 pincode prefixes (flattened)
_TIER_1_PREFIXES = set()
for prefixes in TIER_1_CITIES.values():
    _TIER_1_PREFIXES.update(prefixes)

# All tier-2 pincode prefixes (flattened)
_TIER_2_PREFIXES = set()
for prefixes in TIER_2_CITIES.values():
    _TIER_2_PREFIXES.update(prefixes)

# Remove overlaps: if a prefix is in both Tier 1 and Tier 2, Tier 1 wins
_TIER_2_PREFIXES -= _TIER_1_PREFIXES


def get_city_tier(pincode: str) -> int:
    """
    Classify a pincode into city tier (1/2/3).
    Uses the first 3 digits of the pincode as the prefix.
    """
    prefix = str(pincode)[:3]
    if prefix in _TIER_1_PREFIXES:
        return 1
    elif prefix in _TIER_2_PREFIXES:
        return 2
    else:
        return 3


def get_zone_complexity(state: str) -> str:
    """
    Derive zone_complexity from state name.
    Per 02_dataset_spec.md: remote zones (Northeast, J&K) → high, etc.
    """
    if state in HIGH_ZONE_STATES:
        return "high"
    elif state in MEDIUM_ZONE_STATES:
        return "medium"
    else:
        return "low"


def has_landmark_keyword(address: str) -> bool:
    """
    Check if an address contains landmark-dependent keywords.
    Per 02_dataset_spec.md: "near", "opposite", "behind", "gali", "chowk", etc.
    """
    return bool(LANDMARK_PATTERN.search(address))


def engineer_features(order: Dict[str, Any], pincode_state_map: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Compute all derived features for a single order.
    
    This function is the SINGLE source of feature engineering logic,
    used identically by:
    1. The dataset generator (training pipeline)
    2. The live API (inference path)
    
    Input `order` must contain at least:
    - pincode, payment_mode, order_value, is_first_order, device_type, order_hour
    - address (optional, for landmark detection)
    - state (or looked up via pincode_state_map)
    
    Returns the order dict enriched with derived features:
    - city_tier, zone_complexity, address_char_length, has_landmark_keyword,
      estimated_delivery_days
    """
    pincode = str(order.get("pincode", ""))
    
    # City tier
    city_tier = get_city_tier(pincode)
    order["city_tier"] = city_tier
    
    # State lookup (from provided map or from existing field)
    state = order.get("state", "")
    if not state and pincode_state_map:
        state = pincode_state_map.get(pincode, "")
        order["state"] = state
    
    # Zone complexity
    order["zone_complexity"] = get_zone_complexity(state)
    
    # Address quality features
    address = order.get("address", "")
    order["address_char_length"] = len(address)
    order["has_landmark_keyword"] = has_landmark_keyword(address)
    
    # Estimated delivery days (derived from tier per 02_dataset_spec.md)
    if city_tier == 1:
        order["estimated_delivery_days"] = order.get("estimated_delivery_days", 2)
    else:
        order["estimated_delivery_days"] = order.get("estimated_delivery_days", 6)
    
    return order


# Feature columns used by the XGBoost model (ordering matters for consistency)
MODEL_FEATURE_COLUMNS = [
    "city_tier",
    "payment_mode_cod",    # 1 if COD, 0 if prepaid
    "order_value",
    "is_first_order",
    "device_type_mobile",  # 1 if mobile, 0 if desktop
    "order_hour",
    "address_char_length",
    "has_landmark_keyword",
    "estimated_delivery_days",
    "zone_complexity_high",    # 1 if high
    "zone_complexity_medium",  # 1 if medium
    "product_category_apparel",
    "product_category_electronics",
    "product_category_grocery",
]


def order_to_feature_vector(order: Dict[str, Any]) -> Dict[str, float]:
    """
    Convert an order dict (with derived features already computed)
    into the exact feature vector the XGBoost model expects.
    
    Returns a dict of {feature_name: float_value}.
    """
    return {
        "city_tier": float(order.get("city_tier", 3)),
        "payment_mode_cod": 1.0 if order.get("payment_mode") == "COD" else 0.0,
        "order_value": float(order.get("order_value", 0)),
        "is_first_order": 1.0 if order.get("is_first_order") else 0.0,
        "device_type_mobile": 1.0 if order.get("device_type") == "mobile" else 0.0,
        "order_hour": float(order.get("order_hour", 12)),
        "address_char_length": float(order.get("address_char_length", 30)),
        "has_landmark_keyword": 1.0 if order.get("has_landmark_keyword") else 0.0,
        "estimated_delivery_days": float(order.get("estimated_delivery_days", 4)),
        "zone_complexity_high": 1.0 if order.get("zone_complexity") == "high" else 0.0,
        "zone_complexity_medium": 1.0 if order.get("zone_complexity") == "medium" else 0.0,
        "product_category_apparel": 1.0 if order.get("product_category") == "apparel" else 0.0,
        "product_category_electronics": 1.0 if order.get("product_category") == "electronics" else 0.0,
        "product_category_grocery": 1.0 if order.get("product_category") == "grocery" else 0.0,
    }
