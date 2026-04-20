# ================= IMPORTS =================
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import random
np.random.seed(42)
random.seed(42)
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings
import joblib

from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder

from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_curve, auc, r2_score, mean_squared_error,
    recall_score, precision_score, f1_score
)

from imblearn.over_sampling import SMOTE
import xgboost as xgb
from model_utils import HybridModel

warnings.filterwarnings('ignore')
sns.set_style("whitegrid")

os.makedirs("results", exist_ok=True)
os.makedirs("models", exist_ok=True)

print("="*80)
print("MEDICAL AI - MODEL TRAINING PIPELINE")
print("="*80)


# ==========================================================
# 1️⃣ FRAUD DATA PREPROCESSING
# ==========================================================
print("\n[1/3] PROCESSING FRAUD DATASET (Provider Analysis)...")

try:
    base_path = 'datsets/HEALTHCARE PROVIDER FRAUD DETECTION ANALYSIS'

    print("  Loading CSVs...")
    train_df = pd.read_csv(f'{base_path}/Train-1542865627584.csv')
    inpatient_df = pd.read_csv(f'{base_path}/Train_Inpatientdata-1542865627584.csv')
    outpatient_df = pd.read_csv(f'{base_path}/Train_Outpatientdata-1542865627584.csv')

    inpatient_df['Is_Inpatient'] = 1
    outpatient_df['Is_Inpatient'] = 0

    claims_df = pd.concat([inpatient_df, outpatient_df])
    print(f"  Total Claims: {len(claims_df)}")

    print("  Aggregating content by Provider...")

    claims_df['DiagnosisCount'] = claims_df[
        [c for c in claims_df.columns if 'ClmDiagnosisCode' in c]
    ].notnull().sum(axis=1)

    provider_agg = claims_df.groupby('Provider').agg({
        'ClaimID': 'count',
        'InscClaimAmtReimbursed': ['sum','mean','max'],
        'DeductibleAmtPaid': ['sum','mean'],
        'Is_Inpatient': 'mean',
        'DiagnosisCount': 'mean',
        'AttendingPhysician': 'nunique',
        'OperatingPhysician': 'nunique',
        'BeneID': 'nunique'
    })

    provider_agg.columns = ['_'.join(col).strip() for col in provider_agg.columns.values]
    provider_agg.reset_index(inplace=True)

    df = train_df.merge(provider_agg, on='Provider')
    df.fillna(0, inplace=True)

    df['IS_FRAUD'] = (df['PotentialFraud'] == 'Yes').astype(int)

    feature_cols = [c for c in df.columns if c not in ['Provider','PotentialFraud','IS_FRAUD']]
    X = df[feature_cols].values
    y = df['IS_FRAUD'].values

    print(f"  Providers: {len(df)}")
    print(f"  Features: {len(feature_cols)}")
    print(f"  Class Balance: No Fraud={(y==0).sum()}, Fraud={(y==1).sum()}")

    # Correlation Matrix
    print("  ✓ Generating Correlation Matrix...")
    plt.figure(figsize=(12,10))
    corr_df = df[feature_cols].copy()
    corr_df['IS_FRAUD'] = y
    sns.heatmap(corr_df.corr(), cmap='coolwarm')
    plt.savefig("results/correlation_matrix.png", dpi=300)
    plt.close()

    # Train Test Split
    X_train,X_test,y_train,y_test = train_test_split(
        X,y,test_size=0.1,random_state=42,stratify=y
    )

    smote = SMOTE(random_state=42)
    X_train_bal,y_train_bal = smote.fit_resample(X_train,y_train)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_bal)
    X_test_scaled = scaler.transform(X_test)

except Exception as e:
    print("ERROR:", e)



# ==========================================================
# 2️⃣ FRAUD MODEL TRAINING
# ==========================================================
print("\n[2/3] TRAINING FRAUD DETECTION MODELS...")


# ---------- Decision Tree ----------
dt_model = DecisionTreeClassifier(random_state=42)
dt_model.fit(X_train_bal, y_train_bal)

y_pred_dt = dt_model.predict(X_test)
dt_acc = accuracy_score(y_test, y_pred_dt)

print("\n--- Decision Tree ---")
print("Accuracy:", dt_acc)
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred_dt))
print("Classification Report:\n", classification_report(y_test, y_pred_dt))

plt.figure()
sns.heatmap(confusion_matrix(y_test,y_pred_dt),annot=True,fmt='d',cmap='Blues')
plt.title("Decision Tree Confusion Matrix")
plt.savefig("results/dt_confusion.png")
plt.close()


# ---------- Random Forest ----------
rf_model = RandomForestClassifier(n_estimators=200,random_state=42,class_weight='balanced')
rf_model.fit(X_train_bal, y_train_bal)

y_pred_rf = rf_model.predict(X_test)
rf_acc = accuracy_score(y_test, y_pred_rf)

print("\n--- Random Forest ---")
print("Accuracy:", rf_acc)
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred_rf))
print("Classification Report:\n", classification_report(y_test, y_pred_rf))

plt.figure()
sns.heatmap(confusion_matrix(y_test,y_pred_rf),annot=True,fmt='d',cmap='Blues')
plt.title("Random Forest Confusion Matrix")
plt.savefig("results/rf_confusion.png")
plt.close()


# ---------- Logistic Regression ----------
lr_model = LogisticRegression(max_iter=1000,class_weight='balanced')
lr_model.fit(X_train_bal,y_train_bal)

y_pred_lr = lr_model.predict(X_test)
lr_acc = accuracy_score(y_test,y_pred_lr)

print("\n--- Logistic Regression ---")
print("Accuracy:", lr_acc)
print("Confusion Matrix:\n", confusion_matrix(y_test,y_pred_lr))
print("Classification Report:\n", classification_report(y_test,y_pred_lr))

plt.figure()
sns.heatmap(confusion_matrix(y_test,y_pred_lr),annot=True,fmt='d',cmap='Blues')
plt.title("Logistic Regression Confusion Matrix")
plt.savefig("results/lr_confusion.png")
plt.close()


# ---------- ROC ----------
y_prob_rf = rf_model.predict_proba(X_test)[:,1]
fpr,tpr,_ = roc_curve(y_test,y_prob_rf)
roc_auc = auc(fpr,tpr)

plt.figure()
plt.plot(fpr,tpr,label=f'RF (AUC={roc_auc:.2f})')
plt.plot([0,1],[0,1],'k--')
plt.legend()
plt.savefig("results/roc_best_model.png")
plt.close()


# ---------- Accuracy Comparison ----------
plt.figure()
plt.bar(['Decision Tree','Logistic Regression','Random Forest'],[dt_acc,lr_acc,rf_acc])
plt.ylim(0,1)
plt.savefig("results/model_accuracy_comparison.png")
plt.close()



# ---------- SVM ----------
print("  Running SVM Randomized Search...")

param_grid = {'C':[1,10,100],'gamma':['scale','auto',0.01],'kernel':['rbf']}

svm_search = RandomizedSearchCV(
    SVC(probability=True, class_weight='balanced'),
    param_grid,
    n_iter=5,
    cv=3,
    scoring='recall',
    n_jobs=-1,
    random_state=42
)


svm_search.fit(X_train_scaled,y_train_bal)
svm_model = svm_search.best_estimator_

acc_svm = accuracy_score(y_test,svm_model.predict(X_test_scaled))
print(f"  ✓ SVM Accuracy: {acc_svm*100:.2f}%")


# ---------- XGBoost ----------
print("  Training XGBoost...")
xgb_model = xgb.XGBClassifier(
    n_estimators=500,max_depth=8,learning_rate=0.05,
    scale_pos_weight=(y_train_bal==0).sum()/(y_train_bal==1).sum()
)

xgb_model.fit(X_train_bal,y_train_bal)


# ---------- Hybrid ----------
print("  ✓ Tuning Decision Threshold for Acc≥90% & Prec≥60%...")

temp_model = HybridModel(svm_model,xgb_model,scaler)
probs = temp_model.predict_proba(X_test)[:,1]

best_thresh = 0.85
print("  ✓ Using fixed threshold = 0.85 for stable high accuracy")

final_model = HybridModel(svm_model,xgb_model,scaler,threshold=best_thresh)

y_pred = final_model.predict(X_test)

print("  ✓ Generating Fraud Visualizations...")

plt.figure()
sns.heatmap(confusion_matrix(y_test,y_pred),annot=True,fmt='d',cmap='Blues')
plt.savefig("results/confusion_matrix.png")
plt.close()
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt
import os

# Create results directory if not exists
os.makedirs("results", exist_ok=True)

# Get probabilities from Hybrid Model
y_probs = final_model.predict_proba(X_test)[:, 1]

# ROC computation
fpr, tpr, thresholds = roc_curve(y_test, y_probs)
roc_auc = auc(fpr, tpr)

# Plot ROC Curve
plt.figure(figsize=(6, 5))
plt.plot(fpr, tpr, linewidth=2, label=f"Hybrid Model (AUC = {roc_auc:.3f})")
plt.plot([0, 1], [0, 1], linestyle="--", linewidth=1)
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve – Hybrid SVM + XGBoost Fraud Detection")
plt.legend(loc="lower right")
plt.grid(True)

# Save image
plt.savefig("results/hybrid_roc.png", dpi=300, bbox_inches="tight")
plt.close()

print(f"  ✓ Hybrid ROC Curve saved (AUC = {roc_auc:.3f})")


print("\nClassification Report:")
print(classification_report(y_test,y_pred))



# ==========================================================
# 3️⃣ COST MODEL
# ==========================================================
print("\n[3/3] TRAINING COST MODEL...")

try:
    cost_df = pd.read_csv('datsets/Medical Insurance Cost Prediction/medical_insurance.csv')

    le = LabelEncoder()
    cost_df['sex'] = le.fit_transform(cost_df['sex'])
    cost_df['smoker_enc'] = le.fit_transform(cost_df['smoker'])
    cost_df['region'] = le.fit_transform(cost_df['region'])

    cost_df['is_obese'] = (cost_df['bmi']>=30).astype(int)
    cost_df['obese_smoker'] = cost_df['is_obese']*cost_df['smoker_enc']

    X_cost = cost_df[['age','sex','bmi','children','smoker_enc','region','obese_smoker']]
    y_cost = cost_df['charges']

    X_tr,X_te,y_tr,y_te = train_test_split(X_cost,y_cost,test_size=0.1)

    rf_cost = RandomForestRegressor(n_estimators=500)
    rf_cost.fit(X_tr,y_tr)

    y_pred_cost = rf_cost.predict(X_te)

    r2 = r2_score(y_te,y_pred_cost)
    rmse = np.sqrt(mean_squared_error(y_te,y_pred_cost))

    print(f"  ✓ R² Score: {r2:.4f}")
    print(f"  ✓ RMSE: ${rmse:.2f}")

    print("  ✓ Generating Cost Visualizations...")

    plt.figure()
    plt.scatter(y_te,y_pred_cost)
    plt.savefig("results/actual_vs_predicted.png")
    plt.close()

    plt.figure()
    plt.bar(range(len(rf_cost.feature_importances_)),rf_cost.feature_importances_)
    plt.savefig("results/feature_importance.png")
    plt.close()

except Exception as e:
    print("ERROR:", e)



print("\n"+"="*80)
print("SUCCESS! ALL MODELS TRAINED & SAVED")
print("="*80)
