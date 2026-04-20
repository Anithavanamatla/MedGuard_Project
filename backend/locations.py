from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from places_service import search_nearby_hospitals, search_nearby_insurance, search_places_by_query

router = APIRouter(prefix="/api/locations", tags=["Locations"])

class LocationRequest(BaseModel):
    lat: float
    lng: float

@router.post("/nearby/hospitals")
async def get_nearby_hospitals(loc: LocationRequest):
    return await search_nearby_hospitals(loc.lat, loc.lng)

@router.post("/nearby/insurance")
async def get_nearby_insurance(loc: LocationRequest):
    return await search_nearby_insurance(loc.lat, loc.lng)

class SearchRequest(BaseModel):
    lat: float
    lng: float
    query: str

@router.post("/search")
async def search_places(req: SearchRequest):
    return await search_places_by_query(req.query, req.lat, req.lng)
