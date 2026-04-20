# Quick Start Guide for Backend

## Start the Backend Server

```bash
cd e:\Medical_AI\backend

# Option 1: Run directly with venv Python
.\venv\Scripts\python.exe main.py

# Option 2: Activate venv first, then run
.\venv\Scripts\activate
python main.py
```

## Start IPFS (if not already running)

```bash
ipfs daemon
```

## Access the API

- **API Server**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## Test the API

### 1. Create a Hospital Account
```bash
curl -X POST "http://localhost:8000/api/auth/signup" -H "Content-Type: application/json" -d "{\"username\": \"hospital1\", \"password\": \"pass123\", \"role\": \"hospital\", \"full_name\": \"City Hospital\"}"
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" -H "Content-Type: application/json" -d "{\"username\": \"hospital1\", \"password\": \"pass123\"}"
```

### 3. Test Fraud Detection
```bash
curl -X POST "http://localhost:8000/api/ml/predict-fraud" -H "Content-Type: application/json" -d "{\"age\": 45, \"gender\": \"Male\", \"diagnosis\": \"Diabetes\", \"treatment\": \"Diabetes\", \"amount_billed\": 25000, \"days_in_hospital\": 5}"
```

## Features Ready to Use

✅ **Authentication**: Signup/Login with JWT tokens  
✅ **ML Predictions**: Fraud detection (81.67%) + Cost estimation (R²=0.95)  
✅ **Claims Management**: Submit, view, analyze, approve/reject  
✅ **IPFS Integration**: Upload/download medical files (PDF/JPG)  
✅ **Blockchain**: Simulated transactions (ready for smart contract)  

## Roles Available

- **patient** - View own claims, upload medical reports
- **hospital** - Submit claims with patient details
- **insurance** - View all claims, run AI analysis, approve/reject
