from fastapi import Request, HTTPException
import re
import ipaddress

def validate_domain(domain: str) -> bool:
    """Basic domain regex validation"""
    # Exclude basic localhosts and protocols
    if domain.startswith("http://") or domain.startswith("https://"):
        return False
    if domain.lower() in ["localhost", "127.0.0.1", "::1"]:
        return False
        
    pattern = re.compile(
        r"^(?:[a-zA-Z0-9]"  # First character of the domain
        r"(?:[a-zA-Z0-9-_]{0,61}[a-zA-Z0-9])?\.)+"  # Sub domain + hostname
        r"[a-zA-Z]{2,11}$"  # Top level domain
    )
    return bool(pattern.match(domain))

def is_private_ip(ip: str) -> bool:
    """Check if the IP address belongs to a private range"""
    try:
        ip_obj = ipaddress.ip_address(ip)
        return ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local
    except ValueError:
        return False

# In a full production app, this should ideally use Redis or Supabase properly
# Because Vercel functions are stateless, we'd normally use Supabase.
# For simplicity and MVP speed without setting up a completely new Supabase schema
# just for rate limiting right this second, we'll demonstrate the concept.
# If we had the Supabase connection directly here, we would do:
# count = supabase.table('scans').select("id", count='exact').eq('client_ip', client_ip).gte('created_at', one_hour_ago).execute()
# and check if count > 5.

def get_client_ip(request: Request) -> str:
    """Extracts the real client IP, respecting Vercel proxies"""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host

def check_domain_safety(domain: str):
    """Ensure the domain isn't local or malformed before scanning"""
    if not validate_domain(domain):
        raise HTTPException(status_code=400, detail="Invalid domain format. Do not include http:// or https://")
        
    # Attempt to resolve the domain to an IP to check if it points to a local address (Server Side Request Forgery prevention)
    import socket
    try:
        ip = socket.gethostbyname(domain)
        if is_private_ip(ip):
            raise HTTPException(status_code=400, detail="Cannot scan private or local IP addresses.")
    except socket.gaierror:
        # If it doesn't resolve, let the scanner fail naturally rather than blocking here
        pass
    
    return True
