"""
Smart Hostel Waste Food Management - ML Model Training Pipeline
Trains two regression models:
  1. Food Requirement Prediction (Target: quantity_required_kg)
  2. Food Waste Prediction (Target: waste_kg)

Dataset: hostel_waste_food_management_final_1000_records.csv
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import TimeSeriesSplit, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def calculate_metrics(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    try:
        from sklearn.metrics import root_mean_squared_error
        rmse = root_mean_squared_error(y_true, y_pred)
    except ImportError:
        rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    return round(float(mae), 4), round(float(mse), 4), round(float(rmse), 4), round(float(r2), 4)


def main():
    print("=" * 70)
    print(" HOSTEL FOOD MANAGEMENT - ML TRAINING PIPELINE ")
    print("=" * 70)

    # 1. Load Dataset
    csv_file = "hostel_waste_food_management_final_1000_records.csv"
    if not os.path.exists(csv_file):
        raise FileNotFoundError(f"Dataset file '{csv_file}' not found.")

    df = pd.read_csv(csv_file)
    print(f"\n[1] Loaded Dataset: {csv_file}")
    print(f"    Initial Shape: {df.shape[0]} rows, {df.shape[1]} columns")

    # Ensure wasted_plates target and previous_day_wasted_plates feature exist
    if 'wasted_plates' not in df.columns:
        df['wasted_plates'] = np.maximum(0, np.round(df['waste_kg'] / 0.35)).astype(int)
    if 'previous_day_wasted_plates' not in df.columns:
        df['previous_day_wasted_plates'] = np.maximum(0, np.round(df['previous_day_waste_kg'] / 0.35)).astype(int)

    # 2. Data Cleaning & Validation Report
    print("\n[2] Data Cleaning & Validation:")
    initial_rows = len(df)
    missing_count = df.isnull().sum().sum()
    duplicate_count = df.duplicated().sum()
    print(f"    - Missing values found: {missing_count}")
    print(f"    - Duplicate rows found: {duplicate_count}")

    # Convert date to datetime and sort chronologically
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)
    print(f"    - Date Range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
    print(f"    - Rows retained after cleaning: {len(df)} (Removed: {initial_rows - len(df)})")

    # 3. Define Features & Targets (Preventing Data Leakage)
    categorical_features = ['day_of_week', 'meal_type', 'menu']
    numerical_features = [
        'total_students',
        'visitor_bookings',
        'visitor_attendance_rate',
        'expected_visitor_attendance',
        'student_attendance_rate',
        'expected_student_attendance',
        'expected_attendance',
        'previous_day_attendance',
        'previous_day_prepared_kg',
        'previous_day_consumed_kg',
        'previous_day_wasted_plates',
        'holiday',
        'exam_period',
        'temperature_c'
    ]
    feature_cols = categorical_features + numerical_features

    print(f"\n[3] Features Defined ({len(feature_cols)} total):")
    print(f"    - Categorical ({len(categorical_features)}): {categorical_features}")
    print(f"    - Numerical ({len(numerical_features)}): {numerical_features}")
    print("    - Target 1: quantity_required_kg (Food Preparation Requirement)")
    print("    - Target 2: wasted_plates (Predicted Wasted Plates)")

    X = df[feature_cols]
    y_req = df['quantity_required_kg']
    y_waste = df['wasted_plates']

    # 4. Chronological Train/Test Split (80% Train, 20% Test)
    split_idx = int(len(df) * 0.80)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_req_train, y_req_test = y_req.iloc[:split_idx], y_req.iloc[split_idx:]
    y_waste_train, y_waste_test = y_waste.iloc[:split_idx], y_waste.iloc[split_idx:]

    print(f"\n[4] Chronological Split:")
    print(f"    - Training rows: {len(X_train)} ({df['date'].iloc[0].strftime('%Y-%m-%d')} to {df['date'].iloc[split_idx-1].strftime('%Y-%m-%d')})")
    print(f"    - Testing rows:  {len(X_test)} ({df['date'].iloc[split_idx].strftime('%Y-%m-%d')} to {df['date'].iloc[-1].strftime('%Y-%m-%d')})")

    # 5. Build Preprocessor Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
            ('num', 'passthrough', numerical_features)
        ]
    )

    # 6. Candidate Algorithms
    candidate_models = {
        'Linear Regression': LinearRegression(),
        'Decision Tree': DecisionTreeRegressor(random_state=42),
        'Random Forest': RandomForestRegressor(random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(random_state=42)
    }

    # ==========================================
    # MODEL 1: FOOD REQUIREMENT PREDICTION
    # ==========================================
    print("\n" + "=" * 70)
    print(" MODEL 1: FOOD REQUIREMENT (quantity_required_kg) ")
    print("=" * 70)

    req_results = {}
    for name, model in candidate_models.items():
        pipe = Pipeline(steps=[
            ('preprocessor', clone(preprocessor)),
            ('regressor', clone(model))
        ])
        pipe.fit(X_train, y_req_train)
        preds = pipe.predict(X_test)
        preds = np.maximum(preds, 0)
        mae, mse, rmse, r2 = calculate_metrics(y_req_test, preds)
        req_results[name] = {'pipe': pipe, 'mae': mae, 'mse': mse, 'rmse': rmse, 'r2': r2}

    # Hyperparameter tuning for Random Forest and Gradient Boosting
    tscv = TimeSeriesSplit(n_splits=5)
    
    rf_grid = {
        'regressor__n_estimators': [100],
        'regressor__max_depth': [10],
        'regressor__min_samples_split': [2],
        'regressor__min_samples_leaf': [2]
    }
    rf_pipe_req = Pipeline(steps=[('preprocessor', clone(preprocessor)), ('regressor', RandomForestRegressor(random_state=42))])
    rf_search_req = GridSearchCV(rf_pipe_req, rf_grid, cv=tscv, scoring='neg_mean_absolute_error', n_jobs=1)
    rf_search_req.fit(X_train, y_req_train)
    tuned_rf_preds = np.maximum(rf_search_req.best_estimator_.predict(X_test), 0)
    mae, mse, rmse, r2 = calculate_metrics(y_req_test, tuned_rf_preds)
    req_results['Random Forest (Tuned)'] = {'pipe': rf_search_req.best_estimator_, 'mae': mae, 'mse': mse, 'rmse': rmse, 'r2': r2, 'params': rf_search_req.best_params_}

    gb_grid = {
        'regressor__n_estimators': [100],
        'regressor__learning_rate': [0.1],
        'regressor__max_depth': [3]
    }
    gb_pipe_req = Pipeline(steps=[('preprocessor', clone(preprocessor)), ('regressor', GradientBoostingRegressor(random_state=42))])
    gb_search_req = GridSearchCV(gb_pipe_req, gb_grid, cv=tscv, scoring='neg_mean_absolute_error', n_jobs=-1)
    gb_search_req.fit(X_train, y_req_train)
    tuned_gb_preds = np.maximum(gb_search_req.best_estimator_.predict(X_test), 0)
    mae, mse, rmse, r2 = calculate_metrics(y_req_test, tuned_gb_preds)
    req_results['Gradient Boosting (Tuned)'] = {'pipe': gb_search_req.best_estimator_, 'mae': mae, 'mse': mse, 'rmse': rmse, 'r2': r2, 'params': gb_search_req.best_params_}

    # Print Table
    print(f"\n{'Model':<30} {'MAE':<10} {'MSE':<10} {'RMSE':<10} {'R2':<10}")
    print("-" * 70)
    for name, res in req_results.items():
        print(f"{name:<30} {res['mae']:<10.4f} {res['mse']:<10.4f} {res['rmse']:<10.4f} {res['r2']:<10.4f}")

    best_req_name = 'Random Forest' if 'Random Forest' in req_results else 'Random Forest (Tuned)'
    best_req_info = req_results[best_req_name]
    best_req_pipe = best_req_info['pipe']
    print(f"\n>>> Selected Model: {best_req_name}")
    print(f"    MAE: {best_req_info['mae']}, MSE: {best_req_info['mse']}, RMSE: {best_req_info['rmse']}, R2: {best_req_info['r2']}")

    # ==========================================
    # MODEL 2: FOOD WASTE PREDICTION (wasted_plates)
    # ==========================================
    print("\n" + "=" * 70)
    print(" MODEL 2: FOOD WASTE IN PLATES (wasted_plates) ")
    print("=" * 70)

    waste_results = {}
    for name, model in candidate_models.items():
        pipe = Pipeline(steps=[
            ('preprocessor', clone(preprocessor)),
            ('regressor', clone(model))
        ])
        pipe.fit(X_train, y_waste_train)
        preds = pipe.predict(X_test)
        preds = np.maximum(preds, 0)
        mae, mse, rmse, r2 = calculate_metrics(y_waste_test, preds)
        waste_results[name] = {'pipe': pipe, 'mae': mae, 'mse': mse, 'rmse': rmse, 'r2': r2}

    # Hyperparameter tuning for Food Waste
    rf_pipe_waste = Pipeline(steps=[('preprocessor', clone(preprocessor)), ('regressor', RandomForestRegressor(random_state=42))])
    rf_waste_search = GridSearchCV(rf_pipe_waste, rf_grid, cv=tscv, scoring='neg_mean_absolute_error', n_jobs=-1)
    rf_waste_search.fit(X_train, y_waste_train)
    tuned_rf_waste_preds = np.maximum(rf_waste_search.best_estimator_.predict(X_test), 0)
    mae, mse, rmse, r2 = calculate_metrics(y_waste_test, tuned_rf_waste_preds)
    waste_results['Random Forest (Tuned)'] = {'pipe': rf_waste_search.best_estimator_, 'mae': mae, 'mse': mse, 'rmse': rmse, 'r2': r2, 'params': rf_waste_search.best_params_}

    gb_pipe_waste = Pipeline(steps=[('preprocessor', clone(preprocessor)), ('regressor', GradientBoostingRegressor(random_state=42))])
    gb_waste_search = GridSearchCV(gb_pipe_waste, gb_grid, cv=tscv, scoring='neg_mean_absolute_error', n_jobs=-1)
    gb_waste_search.fit(X_train, y_waste_train)
    tuned_gb_waste_preds = np.maximum(gb_waste_search.best_estimator_.predict(X_test), 0)
    mae, mse, rmse, r2 = calculate_metrics(y_waste_test, tuned_gb_waste_preds)
    waste_results['Gradient Boosting (Tuned)'] = {'pipe': gb_waste_search.best_estimator_, 'mae': mae, 'mse': mse, 'rmse': rmse, 'r2': r2, 'params': gb_waste_search.best_params_}

    # Print Table
    print(f"\n{'Model':<30} {'MAE':<10} {'MSE':<10} {'RMSE':<10} {'R2':<10}")
    print("-" * 70)
    for name, res in waste_results.items():
        print(f"{name:<30} {res['mae']:<10.4f} {res['mse']:<10.4f} {res['rmse']:<10.4f} {res['r2']:<10.4f}")

    # Select Random Forest Model for Food Waste in Plates
    best_waste_name = 'Random Forest (Tuned)' if 'Random Forest (Tuned)' in waste_results else 'Random Forest'
    best_waste_info = waste_results[best_waste_name]
    best_waste_pipe = best_waste_info['pipe']
    print(f"\n>>> Selected Model: {best_waste_name}")
    print(f"    MAE: {best_waste_info['mae']} plates, MSE: {best_waste_info['mse']}, RMSE: {best_waste_info['rmse']} plates, R2: {best_waste_info['r2']}")

    # 7. Save Models and Metadata
    os.makedirs("models", exist_ok=True)
    req_model_path = os.path.join("models", "food_requirement_model.pkl")
    waste_model_path = os.path.join("models", "food_waste_model.pkl")
    metadata_path = os.path.join("models", "model_metadata.json")

    joblib.dump(best_req_pipe, req_model_path)
    joblib.dump(best_waste_pipe, waste_model_path)

    metadata = {
        "dataset_name": csv_file,
        "total_rows": len(df),
        "training_rows": len(X_train),
        "testing_rows": len(X_test),
        "feature_columns": feature_cols,
        "categorical_features": categorical_features,
        "numerical_features": numerical_features,
        "model_version": "2.0.0",
        "target_unit": "plates",
        "training_timestamp": datetime.now().isoformat(),
        "food_requirement_model": {
            "algorithm": best_req_name,
            "target": "quantity_required_kg",
            "mae": best_req_info['mae'],
            "mse": best_req_info['mse'],
            "rmse": best_req_info['rmse'],
            "r2": best_req_info['r2'],
            "hyperparameters": str(best_req_info.get('params', best_req_pipe.named_steps['regressor'].get_params()))
        },
        "food_waste_model": {
            "algorithm": best_waste_name,
            "target": "wasted_plates",
            "mae": best_waste_info['mae'],
            "mse": best_waste_info['mse'],
            "rmse": best_waste_info['rmse'],
            "r2": best_waste_info['r2'],
            "hyperparameters": str(best_waste_info.get('params', best_waste_pipe.named_steps['regressor'].get_params()))
        }
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("\n[5] Saved Models & Metadata:")
    print(f"    - Food Requirement Model: {req_model_path}")
    print(f"    - Food Waste Model:       {waste_model_path}")
    print(f"    - Model Metadata:         {metadata_path}")

    # 8. Sanity Checks & Monotonicity Testing
    print("\n[6] Running Model Sanity Checks:")
    
    test_base = {
        "day_of_week": "Tuesday",
        "meal_type": "Dinner",
        "menu": "Paneer Curry, Roti, Rice",
        "total_students": 500,
        "visitor_bookings": 10,
        "visitor_attendance_rate": 0.90,
        "expected_visitor_attendance": 9,
        "student_attendance_rate": 0.90,
        "expected_student_attendance": 450,
        "expected_attendance": 459,
        "previous_day_attendance": 470,
        "previous_day_prepared_kg": 210.0,
        "previous_day_consumed_kg": 200.0,
        "previous_day_wasted_plates": 25,
        "holiday": 0,
        "exam_period": 0,
        "temperature_c": 28.0
    }
    
    test_high_vis = test_base.copy()
    test_high_vis.update({
        "visitor_bookings": 30,
        "expected_visitor_attendance": 27,
        "expected_attendance": 477
    })

    pred_base_req = max(0.0, float(best_req_pipe.predict(pd.DataFrame([test_base]))[0]))
    pred_base_waste_plates = max(0, int(round(best_waste_pipe.predict(pd.DataFrame([test_base]))[0])))

    pred_high_req = max(0.0, float(best_req_pipe.predict(pd.DataFrame([test_high_vis]))[0]))
    pred_high_waste_plates = max(0, int(round(best_waste_pipe.predict(pd.DataFrame([test_high_vis]))[0])))

    print(f"    - Test Base (450 students + 10 visitors = 459 exp diners):")
    print(f"      Required: {pred_base_req:.2f} kg, Predicted Wasted Plates: {pred_base_waste_plates} plates")
    print(f"    - Test High Visitors (450 students + 30 visitors = 477 exp diners):")
    print(f"      Required: {pred_high_req:.2f} kg, Predicted Wasted Plates: {pred_high_waste_plates} plates")

    assert pred_base_req >= 0, "Sanity Check Failed: Negative food requirement prediction!"
    assert pred_base_waste_plates >= 0, "Sanity Check Failed: Negative food waste prediction!"
    assert pred_high_req >= pred_base_req, "Sanity Check Failed: Higher attendance did not yield higher food requirement!"
    print("    [PASS] All Sanity & Monotonicity Checks Passed!")

    # 9. Run Required Scenarios
    print("\n[7] Required User Scenarios Validation:")
    scenarios = [
        {"desc": "TEST 1: 500 total, 450 expected students, 10 visitors", "meal": "Breakfast", "menu": "Upma, Coffee", "dow": "Tuesday", "exp_s": 450, "vis": 10, "prev_att": 440, "prev_prep": 115.0, "prev_cons": 108.0, "prev_w_plates": 18},
        {"desc": "TEST 2: 500 total, 450 expected students, 30 visitors", "meal": "Lunch", "menu": "Rajma, Rice, Salad", "dow": "Tuesday", "exp_s": 450, "vis": 30, "prev_att": 460, "prev_prep": 205.0, "prev_cons": 195.0, "prev_w_plates": 28},
        {"desc": "TEST 3: 500 total, 400 expected students, 5 visitors", "meal": "Snacks", "menu": "Fruit Chaat", "dow": "Tuesday", "exp_s": 400, "vis": 5, "prev_att": 410, "prev_prep": 60.0, "prev_cons": 55.0, "prev_w_plates": 14},
        {"desc": "TEST 4: 500 total, 480 expected students, 35 visitors", "meal": "Dinner", "menu": "Veg Biryani, Raita", "dow": "Tuesday", "exp_s": 480, "vis": 35, "prev_att": 490, "prev_prep": 225.0, "prev_cons": 215.0, "prev_w_plates": 28}
    ]

    for s in scenarios:
        vis_rate = 0.90
        exp_vis = int(round(s['vis'] * vis_rate))
        s_rate = s['exp_s'] / 500.0
        exp_tot = s['exp_s'] + exp_vis
        row = {
            "day_of_week": s['dow'],
            "meal_type": s['meal'],
            "menu": s['menu'],
            "total_students": 500,
            "visitor_bookings": s['vis'],
            "visitor_attendance_rate": vis_rate,
            "expected_visitor_attendance": exp_vis,
            "student_attendance_rate": s_rate,
            "expected_student_attendance": s['exp_s'],
            "expected_attendance": exp_tot,
            "previous_day_attendance": s['prev_att'],
            "previous_day_prepared_kg": s['prev_prep'],
            "previous_day_consumed_kg": s['prev_cons'],
            "previous_day_wasted_plates": s['prev_w_plates'],
            "holiday": 0,
            "exam_period": 0,
            "temperature_c": 27.5
        }
        req_val = max(0.0, float(best_req_pipe.predict(pd.DataFrame([row]))[0]))
        waste_plates_val = max(0, min(500, int(round(best_waste_pipe.predict(pd.DataFrame([row]))[0]))))

        print(f"\n    {s['desc']}")
        print(f"      Meal: {s['meal']} | Menu: {s['menu']}")
        print(f"      Expected Total Diners: {exp_tot} ({s['exp_s']} students + {exp_vis} visitors)")
        print(f"      Recommended Food:       {req_val:.2f} kg")
        print(f"      Predicted Wasted Plates: {waste_plates_val} plates")

    print("\n" + "=" * 70)
    print(" TRAINING & EVALUATION COMPLETED SUCCESSFULLY ")
    print("=" * 70)

    print("\n" + "=" * 70)
    print(" TRAINING & EVALUATION COMPLETED SUCCESSFULLY ")
    print("=" * 70)


if __name__ == "__main__":
    main()
