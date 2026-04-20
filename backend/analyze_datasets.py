# -*- coding: utf-8 -*-
"""
Dataset Analysis Script
Find the best NHS dataset for maximum fraud detection accuracy
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
import xgboost as xgb
import glob
import os
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("NHS DATASET ANALYSIS - FINDING BEST DATASET")
print("="*80)

dataset_path = 'datsets/NHIS Healthcare Claims and Fraud Dataset/'

# Find all data files
csv_files = glob.glob(dataset_path + '*.csv')
xlsx_files = glob.glob(dataset_path + '*.xlsx')

results = []

print(f"\nAnalyzing {len(csv_files)} CSV and {len(xlsx_files)} Excel files...\n")

# Test each dataset
all_files = csv_files + xlsx_files

for file in all_files:
    name = os.path.basename(file)
    
    try:
        # Load dataset
        if file.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
        
        # Check for fraud column
        fraud_cols = [col for col in df.columns if 'fraud' in col.lower()]
        
        if not fraud_cols or len(df) < 100:
            print(f"✗ {name}: No fraud column or too small ({len(df)} records)")
            continue
        
        print(f"\n{'='*80}")
        print(f"Testing: {name}")
        print(f"{'='*80}")
        print(f"Records: {len(df)}, Columns: {len(df.columns)}")
        
        # Standardize column names
        df.columns = [col.strip().upper() for col in df.columns]
        fraud_col = fraud_cols[0].upper()
        
        # Create binary fraud label
        df['IS_FRAUD'] = (df[fraud_col].astype(str).str.upper() != 'NO FRAUD').astype(int)
        
        fraud_count = df['IS_FRAUD'].sum()
        no_fraud_count = len(df) - fraud_count
        
        print(f"Fraud: {fraud_count} ({fraud_count/len(df)*100:.1f}%)")
        print(f"No Fraud: {no_fraud_count} ({no_fraud_count/len(df)*100:.1f}%)")
        
        # Skip if too imbalanced or too small
        if fraud_count < 50 or no_fraud_count < 50:
            print(f"✗ Too imbalanced or small fraud class")
            continue
        
        # Encode features
        X_list = []
        for col in df.columns:
            if col in ['IS_FRAUD', fraud_col]:
                continue
            
            col_data = df[col].copy()
            
            # Handle dates
            if pd.api.types.is_datetime64_any_dtype(col_data) or 'DATE' in col.upper():
                try:
                    col_data = pd.to_datetime(col_data, errors='coerce')
                    col_data = col_data.astype('int64') // 10**9
                except:
                    pass
            
            # Encode categorical
            if col_data.dtype == 'object':
                try:
                    col_data = LabelEncoder().fit_transform(col_data.astype(str).fillna('Unknown'))
                except:
                    continue
            
            # Convert to numeric
            col_data = pd.to_numeric(pd.Series(col_data), errors='coerce').fillna(0).values
            X_list.append(col_data)
        
        if len(X_list) == 0:
            print(f"✗ No valid features")
            continue
        
        X = np.column_stack(X_list).astype(float)
        y = df['IS_FRAUD'].values
        
        print(f"Features: {X.shape[1]}")
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # SMOTE
        smote = SMOTE(random_state=42)
        X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)
        
        # Quick test with Random Forest (fastest)
        print("\nQuick Test (Random Forest):")
        rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
        rf.fit(X_train_bal, y_train_bal)
        rf_acc = rf.score(X_test, y_test)
        print(f"  Accuracy: {rf_acc*100:.2f}%")
        
        # Test with XGBoost
        print("\nAdvanced Test (XGBoost):")
        xgb_model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.05,
            random_state=42,
            n_jobs=-1,
            eval_metric='logloss'
        )
        xgb_model.fit(X_train_bal, y_train_bal, verbose=False)
        xgb_acc = xgb_model.score(X_test, y_test)
        print(f"  Accuracy: {xgb_acc*100:.2f}%")
        
        # Test with SVM (on smaller sample if dataset is large)
        if len(X_train_bal) > 10000:
            print("\nSVM Test (sampled due to size):")
            sample_size = 10000
            indices = np.random.choice(len(X_train_bal), sample_size, replace=False)
            X_svm_train = X_train_bal[indices]
            y_svm_train = y_train_bal[indices]
        else:
            print("\nSVM Test:")
            X_svm_train = X_train_bal
            y_svm_train = y_train_bal
        
        scaler = StandardScaler()
        X_svm_train_scaled = scaler.fit_transform(X_svm_train)
        X_test_scaled = scaler.transform(X_test)
        
        svm = SVC(C=10, gamma='scale', kernel='rbf', random_state=42)
        svm.fit(X_svm_train_scaled, y_svm_train)
        svm_acc = svm.score(X_test_scaled, y_test)
        print(f"  Accuracy: {svm_acc*100:.2f}%")
        
        # Record results
        best_acc = max(rf_acc, xgb_acc, svm_acc)
        best_model = ['Random Forest', 'XGBoost', 'SVM'][np.argmax([rf_acc, xgb_acc, svm_acc])]
        
        results.append({
            'dataset': name,
            'records': len(df),
            'features': X.shape[1],
            'fraud_pct': fraud_count/len(df)*100,
            'rf_acc': rf_acc * 100,
            'xgb_acc': xgb_acc * 100,
            'svm_acc': svm_acc * 100,
            'best_acc': best_acc * 100,
            'best_model': best_model
        })
        
        print(f"\n✓ BEST: {best_model} = {best_acc*100:.2f}%")
        
    except Exception as e:
        print(f"✗ {name}: Error - {e}")

# Summary
print("\n" + "="*80)
print("ANALYSIS COMPLETE")
print("="*80)

if len(results) == 0:
    print("No suitable datasets found!")
else:
    # Sort by best accuracy
    results.sort(key=lambda x: x['best_acc'], reverse=True)
    
    print(f"\nTested {len(results)} datasets successfully\n")
    print(f"{'Dataset':<50} {'Records':>8} {'Features':>8} {'Best Acc':>10} {'Model':>15}")
    print("-" * 100)
    
    for r in results:
        print(f"{r['dataset']:<50} {r['records']:>8} {r['features']:>8} {r['best_acc']:>9.2f}% {r['best_model']:>15}")
    
    print("\n" + "="*80)
    print("BEST DATASET:")
    print("="*80)
    best = results[0]
    print(f"Dataset: {best['dataset']}")
    print(f"Records: {best['records']}")
    print(f"Features: {best['features']}")
    print(f"Fraud Rate: {best['fraud_pct']:.1f}%")
    print(f"Random Forest: {best['rf_acc']:.2f}%")
    print(f"XGBoost: {best['xgb_acc']:.2f}%")
    print(f"SVM: {best['svm_acc']:.2f}%")
    print(f"BEST: {best['best_model']} = {best['best_acc']:.2f}%")
    print("="*80)
    
    # Save best dataset name for next script
    with open('best_dataset.txt', 'w') as f:
        f.write(best['dataset'])
    
    print(f"\n✓ Best dataset name saved to: best_dataset.txt")
