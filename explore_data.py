"""
EDA & Data Quality Analysis for hostel_food_waste_dataset.csv
"""

import pandas as pd
import numpy as np

df = pd.read_csv('hostel_food_waste_dataset.csv')
print("=== BASIC INFO ===")
print("Shape:", df.shape)
print("\nColumns and Data Types:")
print(df.dtypes)

print("\n=== MISSING VALUES ===")
print(df.isnull().sum())

print("\n=== DUPLICATE RECORDS ===")
duplicates = df.duplicated().sum()
print("Number of full duplicate rows:", duplicates)

print("\n=== UNIQUE VALUES PER CATEGORICAL COLUMN ===")
cat_cols = df.select_dtypes(include=['object']).columns
for col in cat_cols:
    print(f"\nColumn: {col} (Unique count: {df[col].nunique()})")
    print(df[col].value_counts(dropna=False).head(10))

print("\n=== NUMERICAL FEATURES SUMMARY ===")
num_cols = df.select_dtypes(include=[np.number]).columns
print(df[num_cols].describe().T[['mean', 'std', 'min', '25%', '50%', '75%', 'max']])

print("\n=== TARGET VARIABLE (Waste_Meals) ANALYSIS ===")
print(df['Waste_Meals'].describe())
print("Zero waste count:", (df['Waste_Meals'] == 0).sum())
print("Negative waste count:", (df['Waste_Meals'] < 0).sum())

print("\n=== CHRONOLOGICAL & DATE CHECK ===")
if 'Date' in df.columns:
    df['Date_parsed'] = pd.to_datetime(df['Date'], errors='coerce')
    print("Invalid dates count:", df['Date_parsed'].isnull().sum())
    print("Min date:", df['Date_parsed'].min(), "Max date:", df['Date_parsed'].max())
    print("Is date strictly sorted?", df['Date_parsed'].is_monotonic_increasing)
    # Check distribution of dates
    print("Unique dates count:", df['Date_parsed'].nunique())
    # Count of records per date
    print("Meals per date distribution:")
    print(df.groupby('Date_parsed')['Meal_Type'].count().value_counts())

print("\n=== CHECKING LEAKAGE COLUMNS AND CORRELATIONS ===")
# Planned_Meals, Actual_Consumption, Surplus_Meals, Waste_Meals
if all(c in df.columns for c in ['Planned_Meals', 'Actual_Consumption', 'Surplus_Meals', 'Waste_Meals']):
    print("Planned_Meals - Actual_Consumption == Surplus_Meals check:")
    diff = (df['Planned_Meals'] - df['Actual_Consumption']) - df['Surplus_Meals']
    print("Max absolute discrepancy with Surplus_Meals:", diff.abs().max())
    
    print("\nCorrelations with Waste_Meals:")
    numeric_df = df[num_cols]
    print(numeric_df.corr()['Waste_Meals'].sort_values(ascending=False))
