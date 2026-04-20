import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

async def search_nearby_hospitals(lat: float, lng: float, radius: int = 5000):
    if not GOOGLE_PLACES_API_KEY:
        print("Error: GOOGLE_PLACES_API_KEY not found.")
        return []

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "hospital",
        "key": GOOGLE_PLACES_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            data = response.json()
            
            if data.get("status") != "OK":
                print(f"Google Places API Error: {data.get('status')} - {data.get('error_message')}")
                return []

            results = []
            for place in data.get("results", [])[:5]: # Top 5
                results.append({
                    "name": place.get("name"),
                    "address": place.get("vicinity"),
                    "rating": place.get("rating", "N/A"),
                    "place_id": place.get("place_id"),
                    "geometry": place.get("geometry", {}).get("location")
                })
            return results
        except Exception as e:
            print(f"Error fetching hospitals: {e}")
            return []

async def search_nearby_insurance(lat: float, lng: float, radius: int = 5000):
    if not GOOGLE_PLACES_API_KEY:
        return []

    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": "insurance agency",
        "location": f"{lat},{lng}",
        "radius": radius,
        "key": GOOGLE_PLACES_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            data = response.json()
            
            if data.get("status") != "OK":
                return []

            results = []
            for place in data.get("results", [])[:5]:
                results.append({
                    "name": place.get("name"),
                    "address": place.get("formatted_address"),
                    "rating": place.get("rating", "N/A"),
                    "place_id": place.get("place_id"),
                    "geometry": place.get("geometry", {}).get("location")
                })
            return results
        except Exception as e:
            print(f"Error fetching insurance: {e}")
            return []

async def search_places_by_query(query: str, lat: float, lng: float, radius: int = 5000):
    if not GOOGLE_PLACES_API_KEY:
        return []

    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": query,
        "location": f"{lat},{lng}",
        "radius": radius,
        "key": GOOGLE_PLACES_API_KEY
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            data = response.json()
            
            if data.get("status") != "OK":
                return []

            results = []
            for place in data.get("results", [])[:5]:
                results.append({
                    "name": place.get("name"),
                    "address": place.get("formatted_address"),
                    "rating": place.get("rating", "N/A"),
                    "place_id": place.get("place_id"),
                    "geometry": place.get("geometry", {}).get("location")
                })
            return results
        except Exception as e:
            print(f"Error searching places: {e}")
            return []
