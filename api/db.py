import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# We will initialize this in init_db
supabase: Client = None

def init_db():
    global supabase
    url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for backend writing
    
    if not url or not key:
        print("Warning: Supabase credentials not found in environment.")
        return
        
    try:
        supabase = create_client(url, key)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")

def get_supabase() -> Client:
    return supabase

def insert_scan(domain: str, client_ip: str, raw_data: dict) -> str:
    """Inserts a new scan record and returns the scan_id"""
    if not supabase:
        print("Supabase client not initialized")
        return "development_id_123" # Fallback for dev without DB
        
    try:
        data, count = supabase.table('scans').insert({
            "domain": domain,
            "client_ip": client_ip,
            "raw_data": raw_data,
            "status": "scanning"
        }).execute()
        
        if len(data[1]) > 0:
            return data[1][0]['id']
    except Exception as e:
        print(f"Error inserting scan: {e}")
    
    return None

def update_scan_report(scan_id: str, ai_report: str, risk_score: int, status: str = "complete"):
    """Updates the scan record with the final AI report"""
    if not supabase:
        return
        
    try:
        supabase.table('scans').update({
            "ai_report": ai_report,
            "risk_score": risk_score,
            "status": status
        }).eq("id", scan_id).execute()
    except Exception as e:
        print(f"Error updating scan: {e}")

def get_scan(scan_id: str):
    """Fetches a scan record by ID"""
    if not supabase:
        return None
        
    try:
        data, count = supabase.table('scans').select("*").eq("id", scan_id).execute()
        if len(data[1]) > 0:
            return data[1][0]
    except Exception as e:
        print(f"Error fetching scan: {e}")
    
    return None
