"""
Heart Disease Prediction System - Model Training
Author: Your Name
Date: 2026
Description: Train and save all ML models for heart disease prediction
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
import joblib
import os
from pathlib import Path
import warnings

warnings.filterwarnings('ignore')

# ==================== CONFIGURATION ====================

BASE_DIR = Path(__file__).parent
MODELS_DIR = BASE_DIR / 'models'
DATA_DIR = BASE_DIR / 'data'
DATA_FILE = DATA_DIR / 'heart.csv'
RANDOM_STATE = 42

# Create models directory
MODELS_DIR.mkdir(exist_ok=True)

print("\n" + "=" * 70)
print("HEART DISEASE PREDICTION - MODEL TRAINING")
print("=" * 70)

# ==================== LOAD DATA ====================

print("\n[STEP] Step 1: Loading data...")

try:
    # Try to load from URL first
    url = 'https://raw.githubusercontent.com/uciml/UCI-ML-Heart-Disease/master/heart.csv'
    df = pd.read_csv(url)
    print("[OK] Data loaded from URL successfully")
except:
    # Fallback to local file
    try:
        df = pd.read_csv(DATA_FILE)
        print(f"[OK] Data loaded from {DATA_FILE}")
    except FileNotFoundError:
        print(f"[ERROR] Data file not found at {DATA_FILE}")
        print("Please ensure heart.csv is in the data folder")
        exit(1)

print(f"  Dataset shape: {df.shape}")
print(f"  Columns: {list(df.columns)}")

# ==================== DATA EXPLORATION ====================

print("\n[STEP] Step 2: Exploring data...")

print(f"  Missing values: {df.isnull().sum().sum()}")
print(f"  Data types:\n{df.dtypes}")
print(f"\n  Target distribution:")
print(df['target'].value_counts())

# ==================== DATA PREPROCESSING ====================

print("\n[STEP] Step 3: Preprocessing data...")

# Separate features and target
X = df.drop('target', axis=1)
y = df['target']

print(f"  Features shape: {X.shape}")
print(f"  Target shape: {y.shape}")

# Store feature names for later use
feature_names = X.columns.tolist()
joblib.dump(feature_names, MODELS_DIR / 'feature_names.pkl')
print(f"  [OK] Feature names saved ({len(feature_names)} features)")

# ==================== TRAIN-TEST SPLIT ====================

print("\n[STEP]  Step 4: Splitting data (80% train, 20% test)...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
)

print(f"  Training set: {X_train.shape}")
print(f"  Test set: {X_test.shape}")
print(f"  Train target distribution: {y_train.value_counts().to_dict()}")
print(f"  Test target distribution: {y_test.value_counts().to_dict()}")

# ==================== FEATURE SCALING ====================

print("\n[STEP] Step 5: Scaling features...")

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

joblib.dump(scaler, MODELS_DIR / 'scaler.pkl')
print("  [OK] Scaler fitted and saved")

# ==================== MODEL TRAINING ====================

print("\n[STEP] Step 6: Training models...")

models = {}
results = []

# 1. K-Nearest Neighbor
print("\n  [1]  K-Nearest Neighbor (KNN)")
knn = KNeighborsClassifier(n_neighbors=5, metric='euclidean')
knn.fit(X_train_scaled, y_train)
models['knn'] = knn
y_pred_knn = knn.predict(X_test_scaled)
acc_knn = accuracy_score(y_test, y_pred_knn)
print(f"     Accuracy: {acc_knn:.4f}")
results.append({'model': 'KNN', 'accuracy': acc_knn})

# 2. Decision Tree
print("\n  [2]  Decision Tree")
dt = DecisionTreeClassifier(max_depth=10, random_state=RANDOM_STATE)
dt.fit(X_train_scaled, y_train)
models['decision_tree'] = dt
y_pred_dt = dt.predict(X_test_scaled)
acc_dt = accuracy_score(y_test, y_pred_dt)
print(f"     Accuracy: {acc_dt:.4f}")
results.append({'model': 'Decision Tree', 'accuracy': acc_dt})

# 3. Naive Bayes
print("\n  [3]  Naive Bayes")
nb = GaussianNB()
nb.fit(X_train_scaled, y_train)
models['naive_bayes'] = nb
y_pred_nb = nb.predict(X_test_scaled)
acc_nb = accuracy_score(y_test, y_pred_nb)
print(f"     Accuracy: {acc_nb:.4f}")
results.append({'model': 'Naive Bayes', 'accuracy': acc_nb})

# 4. Support Vector Machine
print("\n  [4]  Support Vector Machine (SVM)")
svm = SVC(kernel='rbf', random_state=RANDOM_STATE, probability=True)
svm.fit(X_train_scaled, y_train)
models['svm'] = svm
y_pred_svm = svm.predict(X_test_scaled)
acc_svm = accuracy_score(y_test, y_pred_svm)
print(f"     Accuracy: {acc_svm:.4f}")
results.append({'model': 'SVM', 'accuracy': acc_svm})

# 5. Logistic Regression
print("\n  [5]  Logistic Regression")
lr = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE)
lr.fit(X_train_scaled, y_train)
models['logistic_regression'] = lr
y_pred_lr = lr.predict(X_test_scaled)
acc_lr = accuracy_score(y_test, y_pred_lr)
print(f"     Accuracy: {acc_lr:.4f}")
results.append({'model': 'Logistic Regression', 'accuracy': acc_lr})

# 6. Multi-Layer Perceptron
print("\n  [6]  Multi-Layer Perceptron (MLP)")
mlp = MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=1000, 
                    random_state=RANDOM_STATE, early_stopping=True)
mlp.fit(X_train_scaled, y_train)
models['mlp'] = mlp
y_pred_mlp = mlp.predict(X_test_scaled)
acc_mlp = accuracy_score(y_test, y_pred_mlp)
print(f"     Accuracy: {acc_mlp:.4f}")
results.append({'model': 'MLP', 'accuracy': acc_mlp})

# ==================== MODEL EVALUATION ====================

print("\n[STEP] Step 7: Detailed Model Evaluation...")

evaluation_metrics = {
    'KNN': {
        'accuracy': accuracy_score(y_test, y_pred_knn),
        'precision': precision_score(y_test, y_pred_knn, zero_division=0),
        'recall': recall_score(y_test, y_pred_knn, zero_division=0),
        'f1': f1_score(y_test, y_pred_knn, zero_division=0),
        'roc_auc': roc_auc_score(y_test, y_pred_knn)
    },
    'Decision Tree': {
        'accuracy': accuracy_score(y_test, y_pred_dt),
        'precision': precision_score(y_test, y_pred_dt, zero_division=0),
        'recall': recall_score(y_test, y_pred_dt, zero_division=0),
        'f1': f1_score(y_test, y_pred_dt, zero_division=0),
        'roc_auc': roc_auc_score(y_test, y_pred_dt)
    },
    'Naive Bayes': {
        'accuracy': accuracy_score(y_test, y_pred_nb),
        'precision': precision_score(y_test, y_pred_nb, zero_division=0),
        'recall': recall_score(y_test, y_pred_nb, zero_division=0),
        'f1': f1_score(y_test, y_pred_nb, zero_division=0),
        'roc_auc': roc_auc_score(y_test, y_pred_nb)
    },
    'SVM': {
        'accuracy': accuracy_score(y_test, y_pred_svm),
        'precision': precision_score(y_test, y_pred_svm, zero_division=0),
        'recall': recall_score(y_test, y_pred_svm, zero_division=0),
        'f1': f1_score(y_test, y_pred_svm, zero_division=0),
        'roc_auc': roc_auc_score(y_test, y_pred_svm)
    },
    'Logistic Regression': {
        'accuracy': accuracy_score(y_test, y_pred_lr),
        'precision': precision_score(y_test, y_pred_lr, zero_division=0),
        'recall': recall_score(y_test, y_pred_lr, zero_division=0),
        'f1': f1_score(y_test, y_pred_lr, zero_division=0),
        'roc_auc': roc_auc_score(y_test, y_pred_lr)
    },
    'MLP': {
        'accuracy': accuracy_score(y_test, y_pred_mlp),
        'precision': precision_score(y_test, y_pred_mlp, zero_division=0),
        'recall': recall_score(y_test, y_pred_mlp, zero_division=0),
        'f1': f1_score(y_test, y_pred_mlp, zero_division=0),
        'roc_auc': roc_auc_score(y_test, y_pred_mlp)
    }
}

# Print detailed metrics
for model_name, metrics in evaluation_metrics.items():
    print(f"\n  {model_name}:")
    for metric_name, metric_value in metrics.items():
        print(f"    {metric_name:15s}: {metric_value:.4f}")

# ==================== SAVE MODELS ====================

print("\n[STEP] Step 8: Saving models...")

for model_name, model in models.items():
    filepath = MODELS_DIR / f'{model_name}.pkl'
    joblib.dump(model, filepath)
    print(f"  [OK] {model_name}.pkl saved")

# ==================== SUMMARY ====================

print("\n" + "=" * 70)
print("[OK] TRAINING COMPLETE!")
print("=" * 70)

print("\n[INFO] Model Accuracy Summary:")
results_df = pd.DataFrame(results)
print(results_df.to_string(index=False))

best_model = max(results, key=lambda x: x['accuracy'])
print(f"\n[STAR] Best Model: {best_model['model']} with {best_model['accuracy']:.4f} accuracy")

print("\n[INFO] Files saved in 'models/' directory:")
for file in MODELS_DIR.glob('*.pkl'):
    print(f"  [OK] {file.name}")

print("\n" + "=" * 70)
print("[READY] Ready to deploy!")
print("Run: python app.py")
print("=" * 70 + "\n")