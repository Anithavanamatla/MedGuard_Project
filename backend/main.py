"""
Main FastAPI Application
Healthcare Insurance Claim Processing System
(Reload Triggered)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import auth
import claims
import ml_service
import ipfs_service
import blockchain_service

# Create FastAPI app
app = FastAPI(
    title="Healthcare Insurance Claim Processing System",
    description="AI-powered claim processing with IPFS and Blockchain",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(claims.router)
app.include_router(ml_service.router)
app.include_router(ipfs_service.router)
app.include_router(blockchain_service.router)
import locations
app.include_router(locations.router)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Healthcare Insurance Claim Processing System API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "api": "healthy",
        "ml_models": "loaded",
        "services": {
            "authentication": "active",
            "claims": "active",
            "ml_predictions": "active",
            "ipfs": "active (check IPFS daemon)",
            "blockchain": "active (simulated)"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*80)
    print("HEALTHCARE INSURANCE CLAIM PROCESSING SYSTEM - API SERVER")
    print("="*80)
    print("\nStarting server at http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("="*80 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
