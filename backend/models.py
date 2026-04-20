"""
Pydantic Models for Healthcare Insurance Claim Processing System
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    PATIENT = "patient"
    HOSPITAL = "hospital"
    INSURANCE = "insurance"

class ClaimStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    PENDING = "Pending"

# User Models
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    role: UserRole
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole
    username: str

# Claim Models
class ClaimCreate(BaseModel):
    patient_id: str
    patient_name: str
    age: int
    gender: str
    diagnosis: str
    treatment: str
    amount_billed: float
    days_in_hospital: int
    ipfs_cid: str  # CID of medical report from IPFS

class ClaimResponse(BaseModel):
    claim_id: str
    patient_id: str
    patient_name: str
    hospital_id: str
    diagnosis: str
    treatment: str
    amount_billed: float
    ipfs_cid: str
    fraud_prediction: Optional[bool] = None
    fraud_confidence: Optional[float] = None
    risk_level: Optional[RiskLevel] = None
    estimated_cost: Optional[float] = None
    status: ClaimStatus
    blockchain_tx: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# ML Models
class FraudPredictionRequest(BaseModel):
    age: int
    gender: str
    diagnosis: str
    treatment: str
    amount_billed: float
    days_in_hospital: int

class FraudPredictionResponse(BaseModel):
    is_fraud: bool
    confidence: float
    fraud_probability: float

class CostPredictionRequest(BaseModel):
    age: int
    sex: str
    bmi: float
    children: int
    smoker: bool
    region: str

class CostPredictionResponse(BaseModel):
    estimated_cost: float
    risk_level: RiskLevel

# IPFS Models
class IPFSUploadResponse(BaseModel):
    cid: str
    filename: str
    size: int

# Blockchain Models
class BlockchainClaimRequest(BaseModel):
    claim_id: str
    ipfs_cid: str
    is_fraud: bool
    risk_level: str
    estimated_cost: float
    status: str

class BlockchainClaimResponse(BaseModel):
    transaction_hash: str
    claim_id: str
    status: str

class ClaimDecision(BaseModel):
    claim_id: str
    decision: ClaimStatus  # Approved or Rejected
    comments: Optional[str] = None
