import joblib
import numpy as np
from fastapi import APIRouter, HTTPException
from models import (
    FraudPredictionRequest, FraudPredictionResponse,
    CostPredictionRequest, CostPredictionResponse,
    RiskLevel
)

from model_utils import HybridModel

router = APIRouter(prefix="/api/ml", tags=["ML Predictions"])

# Load models
try:
    # Use the new Hybrid Model
    fraud_model = joblib.load('models/fraud_detection_model.pkl')
    # Use the Scaler (though HybridModel handles scaling internally, we might need it if we debug)
    # fraud_scaler = joblib.load('models/fraud_scaler.pkl') 
    
    # Cost model
    cost_model = joblib.load('models/risk_cost_rf.pkl')
    print("✓ ML models loaded successfully (Hybrid + RF)")
except Exception as e:
    print(f"⚠️  Error loading ML models: {e}")
    fraud_model = None
    cost_model = None

@router.post("/predict-fraud", response_model=FraudPredictionResponse)
async def predict_fraud(request: FraudPredictionRequest):
    """
    Predict if a claim is fraudulent using Hybrid Model (SVM+XGB)
    """
    if fraud_model is None:
        raise HTTPException(status_code=500, detail="Fraud detection model not loaded")
    
    try:
        # Construct Feature Vector matching 'train.py' Provider features (11 features)
        # Features: ClaimID_count, InscClaimAmt_sum, InscClaimAmt_mean, InscClaimAmt_max, 
        #           Deductible_sum, Deductible_mean, Is_Inpatient_mean, DiagCount_mean, 
        #           AttendPhys_nunique, OpPhys_nunique, BeneID_nunique
        
        # Adaptation: Mapping single claim request to provider-like stats 
        # (Treating this single claim as the 'average' behavior)
        
        is_inpatient = 1.0 if request.days_in_hospital > 0 else 0.0
        
        features = np.array([[
            1.0,                        # ClaimID_count
            request.amount_billed,      # InscClaimAmtReimbursed_sum
            request.amount_billed,      # InscClaimAmtReimbursed_mean
            request.amount_billed,      # InscClaimAmtReimbursed_max
            0.0,                        # DeductibleAmtPaid_sum (Unknown)
            0.0,                        # DeductibleAmtPaid_mean (Unknown)
            is_inpatient,               # Is_Inpatient_mean
            1.0,                        # DiagnosisCount_mean (Assume 1)
            1.0,                        # AttendingPhysician_nunique
            1.0,                        # OperatingPhysician_nunique
            1.0                         # BeneID_nunique
        ]])
        
        # Predict
        prediction = fraud_model.predict(features)[0]
        probabilities = fraud_model.predict_proba(features)[0]
        
        is_fraud = bool(prediction == 1)
        fraud_prob = float(probabilities[1])
        confidence = float(max(probabilities))
        
        return FraudPredictionResponse(
            is_fraud=is_fraud,
            confidence=confidence,
            fraud_probability=fraud_prob
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/predict-cost-risk", response_model=CostPredictionResponse)
async def predict_cost_risk(request: CostPredictionRequest):
    """
    Predict cost and risk level using Random Forest model
    """
    if cost_model is None:
        raise HTTPException(status_code=500, detail="Cost prediction model not loaded")
    
    try:
        # Encode gender (sex)
        sex_encoded = 1 if request.sex.lower() == 'female' else 0
        
        # Encode smoker
        smoker_encoded = 1 if request.smoker else 0
        
        # Encode region
        region_map = {'northeast': 0, 'northwest': 1, 'southeast': 2, 'southwest': 3}
        region_encoded = region_map.get(request.region.lower(), 0)
        
        # Features: age, sex, bmi, children, smoker, region
        features = np.array([[
            request.age,
            sex_encoded,
            request.bmi,
            request.children,
            smoker_encoded,
            region_encoded
        ]])
        
        # Predict cost (USD)
        predicted_cost_usd = float(cost_model.predict(features)[0])
        
        # Convert to Rupees (approx 85 INR per USD)
        predicted_cost_inr = predicted_cost_usd * 85.0
        
        # Classify risk
        if predicted_cost_usd < 10000:
            risk = RiskLevel.LOW
        elif predicted_cost_usd < 30000:
            risk = RiskLevel.MEDIUM
        else:
            risk = RiskLevel.HIGH
        
        return CostPredictionResponse(
            estimated_cost=predicted_cost_inr,
            risk_level=risk
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
