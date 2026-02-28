from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import re

from .scanner import run_scan_tasks
from .ai import stream_ai_report
from .middleware import check_domain_safety, get_client_ip
from .db import init_db, insert_scan, get_scan

app = FastAPI(title="SentinelScan API", version="2.0")

@app.on_event("startup")
async def startup_event():
    init_db()

class ScanRequest(BaseModel):
    domain: str
    consent: bool
    user_id: str | None = None

class ReportRequest(BaseModel):
    scan_id: str

@app.post("/api/scan")
async def start_scan(request: Request, body: ScanRequest):
    if not body.consent:
        raise HTTPException(status_code=400, detail="Explicit consent is required to perform a scan.")

    # Middleware equivalent validation
    domain = body.domain.strip().lower()
    check_domain_safety(domain)
    
    # Normally we would enforce the 5 scans/hour rate limit here using Supabase
    client_ip = get_client_ip(request)

    # 1. Run Recon Tasks Concurrently
    raw_data = await run_scan_tasks(domain)
    
    # 2. Insert into Supabase
    scan_id = insert_scan(domain, client_ip, raw_data, body.user_id)
    
    if not scan_id:
        raise HTTPException(status_code=500, detail="Failed to initialize scan in database.")
        
    # 3. Return immediately so frontend can route to the report stream
    return {"scan_id": scan_id, "raw_data": raw_data}

@app.post("/api/report")
async def generate_report(request: Request, body: ReportRequest):
    # 1. Fetch raw data from Supabase
    scan_record = get_scan(body.scan_id)
    
    if not scan_record:
        raise HTTPException(status_code=404, detail="Scan not found.")
        
    # 2. Kick off the streaming response
    raw_data = scan_record.get('raw_data', {})
    
    # FastAPI streaming response
    return await stream_ai_report(body.scan_id, raw_data)

@app.get("/api/scan/{scan_id}")
async def get_scan_data(scan_id: str):
    scan_record = get_scan(scan_id)
    if not scan_record:
        raise HTTPException(status_code=404, detail="Scan not found.")
    # Don't expose client_ip to frontend
    scan_record.pop("client_ip", None)
    return scan_record

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

