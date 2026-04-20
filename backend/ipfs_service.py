"""
IPFS Integration Service
- Upload medical files to local IPFS node via HTTP API
- Retrieve files by CID
"""
import requests
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from models import IPFSUploadResponse
import io

router = APIRouter(prefix="/api/ipfs", tags=["IPFS"])

IPFS_API_URL = "http://127.0.0.1:5003/api/v0"

def get_ipfs_client():
    """Check IPFS connection"""
    try:
        response = requests.post(f"{IPFS_API_URL}/id", timeout=5)
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"⚠️ IPFS connection check failed: {e}")
        return False

# Check connection on startup
if get_ipfs_client():
    print("✓ Connected to IPFS node (via HTTP API)")
else:
    print("⚠️ IPFS node not reachable (ensure daemon is running on port 5001)")

@router.post("/upload", response_model=IPFSUploadResponse)
async def upload_to_ipfs(file: UploadFile = File(...)):
    """
    Upload medical report (PDF/JPG) to IPFS
    Returns the CID (Content Identifier)
    """
    try:
        # Read file content
        content = await file.read()
        
        # Prepare multipart upload
        files = {'file': (file.filename, content)}
        
        # Call IPFS API
        response = requests.post(f"{IPFS_API_URL}/add", files=files)
        response.raise_for_status()
        
        result = response.json()
        cid = result['Hash']
        
        return IPFSUploadResponse(
            cid=cid,
            filename=file.filename,
            size=len(content)
        )
    
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="IPFS node not available. Ensure IPFS daemon is running on port 5001."
        )
    except Exception as e:
        print(f"IPFS Upload Error: {e}")
        raise HTTPException(status_code=500, detail=f"IPFS upload error: {str(e)}")

@router.get("/{cid}")
async def get_from_ipfs(cid: str):
    """
    Check if file exists in IPFS
    """
    try:
        # Use cat with length limit 1 to just check existence/accessibility
        # or simplified, just rely on download logic.
        # But efficiently: use cat to get content
        params = {'arg': cid}
        response = requests.post(f"{IPFS_API_URL}/cat", params=params, stream=True)
        
        if response.status_code != 200:
             raise HTTPException(status_code=404, detail="File not found in IPFS")
             
        return {
            "cid": cid,
            "content_available": True,
            "size": "Unknown (streamed)"
        }
    
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File not found or checking failed: {str(e)}")

@router.get("/{cid}/download")
async def download_from_ipfs(cid: str):
    """
    Download file content from IPFS
    """
    try:
        params = {'arg': cid}
        response = requests.post(f"{IPFS_API_URL}/cat", params=params, stream=True)
        
        if response.status_code != 200:
             raise HTTPException(status_code=404, detail="File not found in IPFS")
        
        # Return content
        return Response(content=response.content, media_type="application/octet-stream")
    
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="IPFS node unavailable")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Download failed: {str(e)}")
