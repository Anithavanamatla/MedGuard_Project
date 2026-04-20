# MEDICAL AI PROJECT - DEPLOYMENT GUIDE

Use this guide to set up the project on a **new computer** after unzipping the project folder.

## 0. PREREQUISITES
Before starting, ensure you have these installed on the new computer:
1. **Node.js**: [Download Here](https://nodejs.org/) (Version 18+)
2. **Python**: [Download Here](https://www.python.org/) (Version 3.10+)
3. **IPFS Desktop**: [Download Here](https://docs.ipfs.tech/install/ipfs-desktop/)

---

## 1. INSTALLATION SETUP
Run these commands ONCE to set up dependencies.

### Backend Setup (Terminal 1)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Encryption Key Setup
Create a file named `.env` inside the `backend` folder. This file keeps your security keys safe.
Add the following lines:

```ini
# A random string to sign your login tokens (keep this secret!)
SECRET_KEY=your_secret_key_here

# The encryption method (Standard is HS256)
ALGORITHM=HS256

# How long a user stays logged in (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Your Google Places API Key for location features
GOOGLE_PLACES_API_KEY=your_google_maps_api_key
```

### Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
```

### Blockchain Setup (Terminal 3)
```bash
cd blockchain
npm install
```

---

## 2. RUNNING THE PROJECT
Follow these steps **every time** you want to run the project. Open 4 Separate Terminal Windows.

### TERMINAL 1: IPFS Storage
```bash
ipfs daemon
```
*(Wait for "Daemon is ready")*

### TERMINAL 2: Blockchain Network
```bash
cd blockchain
npx hardhat node
```
*(Leave this running)*

### TERMINAL 3: Deploy Smart Contract
**IMPORTANT:** Run this whenever you restart Terminal 2.
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### TERMINAL 4: Backend API
```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### TERMINAL 5: Frontend UI
```bash
cd frontend
npm run dev
```
*(Ctrl+Click the link to open: http://localhost:5173)*

---

## 3. QUICK DATA SETUP (Optional)
To create test accounts (Hospital, Patient, Insurance) instantly:
1. Make sure all services above are running.
2. Open a new terminal in the project root folder.
3. Run:
   ```bash
   python final-test.py
   ```
4. Login with:
   - **Hospital**: `ADMIN` / `admin123` (or check script output)
   - **Patient**: `PT-2024-001` / `password123`
   - **Insurance**: `INS-001` / `password123`
