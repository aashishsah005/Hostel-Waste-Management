"""
Smart Hostel Waste Food Management - Model Inference Engine
Provides high-performance advance prediction for Food Requirement and Food Waste.

Functions:
  - predict_food_requirement(input_data)
  - predict_food_waste(input_data)
  - predict_all(input_data)
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

# Cache loaded models in memory for fast repeated inference
_req_model = None
_waste_model = None
_metadata = None

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
REQ_MODEL_PATH = os.path.join(MODEL_DIR, "food_requirement_model.pkl")
WASTE_MODEL_PATH = os.path.join(MODEL_DIR, "food_waste_model.pkl")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.json")

# Fallback typical benchmarks by meal type if previous-day stats are omitted
MEAL_DEFAULTS = {
    "Breakfast": {"prev_att": 440, "prev_prep": 118.0, "prev_cons": 112.0, "prev_w": 6.0, "default_menu": "Idli, Sambar, Chutney"},
    "Lunch": {"prev_att": 475, "prev_prep": 215.0, "prev_cons": 205.0, "prev_w": 10.0, "default_menu": "Dal, Rice, Roti, Mixed Veg"},
    "Snacks": {"prev_att": 445, "prev_prep": 68.0, "prev_cons": 63.0, "prev_w": 5.0, "default_menu": "Pakora, Tea"},
    "Dinner": {"prev_att": 475, "prev_prep": 220.0, "prev_cons": 210.0, "prev_w": 10.0, "default_menu": "Paneer Curry, Roti, Rice"},
}


def _load_models():
    global _req_model, _waste_model, _metadata
    if _req_model is None:
        if not os.path.exists(REQ_MODEL_PATH):
            raise FileNotFoundError(f"Food Requirement model not found at '{REQ_MODEL_PATH}'. Run train_models.py first.")
        _req_model = joblib.load(REQ_MODEL_PATH)
    
    if _waste_model is None:
        if not os.path.exists(WASTE_MODEL_PATH):
            raise FileNotFoundError(f"Food Waste model not found at '{WASTE_MODEL_PATH}'. Run train_models.py first.")
        _waste_model = joblib.load(WASTE_MODEL_PATH)

    if _metadata is None and os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _metadata = json.load(f)
        except Exception:
            _metadata = {}


def _prepare_dataframe(input_data):
    """
    Validates, infers derived fields, and converts raw input data into
    a strictly formatted pandas DataFrame matching training features.
    """
    data = dict(input_data)
    
    meal_type = data.get("meal_type", "Lunch")
    defaults = MEAL_DEFAULTS.get(meal_type, MEAL_DEFAULTS["Lunch"])

    total_students = int(data.get("total_students", 500))
    visitor_bookings = int(data.get("visitor_bookings", 0))
    
    visitor_attendance_rate = float(data.get("visitor_attendance_rate", 0.90))
    expected_visitor_attendance = data.get("expected_visitor_attendance")
    if expected_visitor_attendance is None:
        expected_visitor_attendance = int(round(visitor_bookings * visitor_attendance_rate))
    else:
        expected_visitor_attendance = int(expected_visitor_attendance)

    expected_student_attendance = data.get("expected_student_attendance")
    if expected_student_attendance is None:
        expected_student_attendance = 450
    else:
        expected_student_attendance = int(expected_student_attendance)

    student_attendance_rate = data.get("student_attendance_rate")
    if student_attendance_rate is None:
        student_attendance_rate = float(expected_student_attendance) / float(max(1, total_students))
    else:
        student_attendance_rate = float(student_attendance_rate)

    expected_attendance = data.get("expected_attendance")
    if expected_attendance is None:
        expected_attendance = expected_student_attendance + expected_visitor_attendance
    else:
        expected_attendance = int(expected_attendance)

    row = {
        "day_of_week": str(data.get("day_of_week", "Monday")),
        "meal_type": str(meal_type),
        "menu": str(data.get("menu", defaults["default_menu"])),
        "total_students": total_students,
        "visitor_bookings": visitor_bookings,
        "visitor_attendance_rate": visitor_attendance_rate,
        "expected_visitor_attendance": expected_visitor_attendance,
        "student_attendance_rate": student_attendance_rate,
        "expected_student_attendance": expected_student_attendance,
        "expected_attendance": expected_attendance,
        "previous_day_attendance": int(data.get("previous_day_attendance", defaults["prev_att"])),
        "previous_day_prepared_kg": float(data.get("previous_day_prepared_kg", defaults["prev_prep"])),
        "previous_day_consumed_kg": float(data.get("previous_day_consumed_kg", defaults["prev_cons"])),
        "previous_day_waste_kg": float(data.get("previous_day_waste_kg", defaults["prev_w"])),
        "holiday": int(data.get("holiday", 0)),
        "exam_period": int(data.get("exam_period", 0)),
        "temperature_c": float(data.get("temperature_c", 28.0))
    }

    feature_order = [
        'day_of_week', 'meal_type', 'menu',
        'total_students', 'visitor_bookings', 'visitor_attendance_rate', 'expected_visitor_attendance',
        'student_attendance_rate', 'expected_student_attendance', 'expected_attendance',
        'previous_day_attendance', 'previous_day_prepared_kg', 'previous_day_consumed_kg', 'previous_day_waste_kg',
        'holiday', 'exam_period', 'temperature_c'
    ]

    return pd.DataFrame([row])[feature_order], row


def predict_food_requirement(input_data):
    """
    Predicts recommended food preparation in kilograms (quantity_required_kg).
    """
    _load_models()
    df, _ = _prepare_dataframe(input_data)
    pred = float(_req_model.predict(df)[0])
    return round(max(0.0, pred), 2)


def predict_food_waste(input_data):
    """
    Predicts expected food waste in kilograms (waste_kg).
    """
    _load_models()
    df, _ = _prepare_dataframe(input_data)
    pred = float(_waste_model.predict(df)[0])
    return round(max(0.0, pred), 2)


def predict_all(input_data):
    """
    Executes both food requirement and waste models and returns complete JSON response.
    """
    _load_models()
    df, row_info = _prepare_dataframe(input_data)
    
    req_kg = round(max(0.0, float(_req_model.predict(df)[0])), 2)
    waste_kg = round(max(0.0, float(_waste_model.predict(df)[0])), 2)
    cons_kg = round(max(0.0, req_kg - waste_kg), 2)
    waste_pct = round((waste_kg / req_kg * 100) if req_kg > 0 else 0.0, 2)

    return {
        "success": True,
        "meal_type": row_info["meal_type"],
        "menu": row_info["menu"],
        "day_of_week": row_info["day_of_week"],
        "total_students": row_info["total_students"],
        "expected_student_attendance": row_info["expected_student_attendance"],
        "visitor_bookings": row_info["visitor_bookings"],
        "expected_visitor_attendance": row_info["expected_visitor_attendance"],
        "expected_total_attendance": row_info["expected_attendance"],
        "food_required_kg": req_kg,
        "estimated_waste_kg": waste_kg,
        "estimated_consumption_kg": cons_kg,
        "estimated_waste_percentage": waste_pct
    }


if __name__ == "__main__":
    # Support CLI arguments for JSON input or execute default sample scenario
    if len(sys.argv) > 1 and sys.argv[1].startswith("{"):
        try:
            user_input = json.loads(sys.argv[1])
            result = predict_all(user_input)
            print(json.dumps(result, indent=2))
            sys.exit(0)
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

    # Default Sample Prediction Test
    sample_input = {
        "day_of_week": "Tuesday",
        "meal_type": "Dinner",
        "menu": "Paneer Curry, Roti, Rice",
        "total_students": 500,
        "visitor_bookings": 20,
        "visitor_attendance_rate": 0.90,
        "expected_visitor_attendance": 18,
        "expected_student_attendance": 460,
        "expected_attendance": 478,
        "previous_day_attendance": 470,
        "previous_day_prepared_kg": 195,
        "previous_day_consumed_kg": 184,
        "previous_day_waste_kg": 11,
        "holiday": 0,
        "exam_period": 0,
        "temperature_c": 30
    }

    result = predict_all(sample_input)
    print("=" * 60)
    print(" SAMPLE ML PREDICTION OUTPUT (predict.py) ")
    print("=" * 60)
    print(json.dumps(result, indent=2))
