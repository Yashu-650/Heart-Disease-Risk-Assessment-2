"""
Heart Disease Prediction - Database Creation Helper
Author: Your Name
Date: 2026
Description: Helper script to create and initialize the SQLite database
"""

import sqlite3
from pathlib import Path

# ==================== CONFIGURATION ====================

BASE_DIR = Path(__file__).parent
DATABASE_DIR = BASE_DIR / 'database'
DATABASE_PATH = DATABASE_DIR / 'heart_disease.db'

# Create database directory
DATABASE_DIR.mkdir(exist_ok=True)

print("\n" + "=" * 60)
print("[DB] DATABASE CREATION")
print("=" * 60)

# ==================== CREATE DATABASE ====================

try:
    # Connect to database (creates if doesn't exist)
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Drop existing table if it exists (for reset)
    # Uncomment below to reset database
    # cursor.execute('DROP TABLE IF EXISTS predictions')
    
    # Drop existing table if it exists (for reset)
    cursor.execute('DROP TABLE IF EXISTS predictions')
    
    # Create predictions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            age INTEGER NOT NULL,
            sex INTEGER NOT NULL,
            chest_pain_type INTEGER NOT NULL,
            resting_blood_pressure INTEGER NOT NULL,
            cholesterol INTEGER NOT NULL,
            fasting_blood_sugar INTEGER NOT NULL,
            resting_ecg INTEGER NOT NULL,
            max_heart_rate INTEGER NOT NULL,
            exercise_induced_angina INTEGER NOT NULL,
            st_depression REAL NOT NULL,
            st_slope INTEGER NOT NULL,
            major_vessels INTEGER NOT NULL,
            thalassemia INTEGER NOT NULL,
            risk_percentage REAL NOT NULL,
            risk_level TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create index for faster queries
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_created_at 
        ON predictions(created_at DESC)
    ''')
    
    conn.commit()
    conn.close()
    
    print(f"\n[OK] Database created successfully at:")
    print(f"  {DATABASE_PATH}")
    print(f"\n[OK] Tables created:")
    print(f"  - predictions (17 columns)")
    print(f"\n[OK] Indices created:")
    print(f"  - idx_created_at")
    
except sqlite3.Error as e:
    print(f"\n[ERROR] Error creating database: {e}")
    exit(1)

except Exception as e:
    print(f"\n[ERROR] Unexpected error: {e}")
    exit(1)

print("\n" + "=" * 60)
print("[OK] SETUP COMPLETE")
print("=" * 60 + "\n")