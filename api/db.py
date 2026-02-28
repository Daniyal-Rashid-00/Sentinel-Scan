import os
import uuid
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase client
supabase: Client = None

# In-memory fallback cache for when Supabase is unavailable
_memory_cache: dict = {}

def init_db():
    global supabase
    url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("Warning: Supabase credentials not found. Using in-memory fallback.")
        return
        
    try:
        supabase = create_client(url, key)
        print("Supabase client initialized.")
    except Exception as e:
        print(f"Failed to initialize Supabase: {e}. Using in-memory fallback.")

def insert_scan(domain: str, client_ip: str, raw_data: dict, user_id: str = None) -> Optional[str]:
    """Inserts a new scan record and returns the scan_id."""
    
    # Try Supabase first
    if supabase:
        try:
            payload = {
                "domain": domain,
                "client_ip": client_ip,
                "raw_data": raw_data,
                "status": "scanning"
            }
            if user_id:
                payload["user_id"] = user_id
                
            data, count = supabase.table('scans').insert(payload).execute()
            
            if data[1] and len(data[1]) > 0:
                scan_id = data[1][0]['id']
                print(f"Inserted scan into Supabase: {scan_id}")
                # Also cache locally for fast retrieval
                _memory_cache[scan_id] = data[1][0]
                return scan_id
        except Exception as e:
            print(f"Supabase insert failed: {e}. Falling back to in-memory cache.")

    # Fallback — generate a UUID and store in memory
    scan_id = str(uuid.uuid4())
    from datetime import datetime
    _memory_cache[scan_id] = {
        "id": scan_id,
        "domain": domain,
        "client_ip": client_ip,
        "raw_data": raw_data,
        "ai_report": None,
        "risk_score": None,
        "status": "scanning",
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat()
    }
    print(f"Stored scan in memory cache: {scan_id}")
    return scan_id

def update_scan_report(scan_id: str, ai_report: str, risk_score: int, status: str = "complete"):
    """Updates the scan record with the final AI report."""
    
    # Update in-memory cache first
    if scan_id in _memory_cache:
        _memory_cache[scan_id].update({
            "ai_report": ai_report,
            "risk_score": risk_score,
            "status": status
        })
    
    # Also update Supabase if available
    if supabase:
        try:
            supabase.table('scans').update({
                "ai_report": ai_report,
                "risk_score": risk_score,
                "status": status
            }).eq("id", scan_id).execute()
        except Exception as e:
            print(f"Supabase update failed (non-critical): {e}")

def get_scan(scan_id: str) -> Optional[dict]:
    """Fetches a scan record by ID — checks memory cache first, then Supabase."""
    
    # Check in-memory cache first (fast path)
    if scan_id in _memory_cache:
        return _memory_cache[scan_id]
    
    # Fall back to Supabase
    if supabase:
        try:
            data, count = supabase.table('scans').select("*").eq("id", scan_id).execute()
            if data[1] and len(data[1]) > 0:
                _memory_cache[scan_id] = data[1][0]  # Cache for next request
                return data[1][0]
        except Exception as e:
            print(f"Supabase get failed: {e}")
    
    return None
