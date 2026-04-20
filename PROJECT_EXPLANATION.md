# MEDICAL AI PROJECT - STRUCTURE EXPLANATION

This document explains every folder and file in the project.

---

## 📂 1. BACKEND (Folder: `backend`)
This is the "Brain" of the application. It handles logic, AI predictions, and talks to the blockchain.

### Core Files
- **`main.py`**: The entry point. Starts the server and connects all parts (Auth, Claims, AI, etc.).
- **`auth.py`**: Handles User Login & Signup (JWT Tokens).
- **`claims.py`**: Manages insurance claims (Submitting, Fetching, Approving/Rejecting).
- **`locations.py`**: New features for Google Maps (Nearby Hospitals/Insurance).
- **`places_service.py`**: Helper code that actually talks to Google Places API.
- **`ml_service.py`**: Connects the AI models to the API (Predicts Fraud & Cost).
- **`ipfs_service.py`**: Uploads medical reports to IPFS (Decentralized Storage).
- **`blockchain_service.py`**: Connects Python to the Smart Contract (Read/Write to Blockchain).
- **`models.py`**: Defines data structures (e.g., What a "Claim" looks like).
- **`requirements.txt`**: List of Python libraries needed to run this.

### AI & Data
- **`train.py`**: Script to train the AI models using historical data.
- **`models/`**: Folder containing the saved AI files (`.pkl`) after training.
- **`datasets/`**: Folder where raw CSV data for training is stored.

### Config
- **`.env`**: (Hidden file) Stores secret keys and API keys.

---

## 📂 2. FRONTEND (Folder: `frontend`)
This is the "Face" of the application. It's the website the user sees.

### Core Files (in `src/`)
- **`App.tsx`**: The main container. Definitions of all Pages and Routes.
- **`main.tsx`**: The file that renders React into the HTML page.
- **`index.css`**: Global styles (Tailwind CSS configuration).

### Folders (in `src/`)
- **`pages/`**: The actual screens of the app.
    - **`Landing.tsx`**: The home page before login.
    - **`auth/`**: Login and Signup screens.
    - **`dashboard/`**:
        - **`PatientDashboard.tsx`**: Patient view (Claims history, Submit claim, Nearby Hospitals).
        - **`HospitalDashboard.tsx`**: Doctor view (Submit claims, Upload reports, Nearby Insurance).
        - **`InsuranceDashboard.tsx`**: Insurer view (Review claims, AI Analysis, Approve/Reject).
- **`components/ui/`**: Reusable building blocks.
    - **`Button.tsx`**: Custom styled buttons.
    - **`Card.tsx`**: The glass-effect boxes used everywhere.
    - **`Input.tsx`**: Text boxes for forms.
    - **`DarkVeil.tsx`**: The animated background effect.
- **`context/`**:
    - **`AuthContext.tsx`**: Manages "Is the user logged in?" state across the app.
- **`hooks/`**:
    - **`useGeolocation.ts`**: Helper to get the user's GPS location.
- **`layouts/`**: Wrappers for pages (e.g., standardizing the sidebar/header).

---

## 📂 3. BLOCKCHAIN (Folder: `blockchain`)
This is the "Ledger". It keeps a permanent, unchangeable record of claims.

### Core Files
- **`contracts/ClaimRegistry.sol`**: The **Smart Contract** code (Written in Solidity). Defines rules for storing claims on Ethereum.
- **`scripts/deploy.js`**: A script to put (deploy) the Smart Contract onto the network.
- **`hardhat.config.js`**: Settings for the local blockchain network.
- **`package.json`**: List of Node.js libraries needed for blockchain tools.

---

## 🚀 SUMMARY OF FLOW
1. **Frontend** (React) collects user input.
2. **Backend** (Python) receives it.
3. **IPFS** stores the heavy files (PDFs/Images).
4. **AI** checks the data for fraud.
5. **Blockchain** records the final transaction permanently.
