import asyncio
import httpx
import re

async def get_subdomains(domain: str) -> list[str]:
    """Task 1: Subdomain Enumeration via crt.sh"""
    url = f"https://crt.sh/?q=%.{domain}&output=json"
    subdomains = set()
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                for entry in data:
                    name = entry.get('name_value', '')
                    # Split by newline (crt.sh sometimes returns multiple in one line) and strip wildcards
                    for sub in name.split('\n'):
                        clean_sub = sub.strip().replace('*.', '')
                        if clean_sub.endswith(domain) and clean_sub != domain:
                            subdomains.add(clean_sub)
    except Exception as e:
        print(f"Error fetching subdomains: {e}")
        return []

    # Return max 15 unique subdomains
    return list(subdomains)[:15]

async def check_port(domain: str, port: int) -> int:
    """Helper to check a single port asynchronously"""
    try:
        # 0.5s timeout per port
        _, writer = await asyncio.wait_for(
            asyncio.open_connection(domain, port), 
            timeout=0.5
        )
        writer.close()
        await writer.wait_closed()
        return port
    except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
        return None

async def scan_ports(domain: str) -> dict:
    """Task 2: Lightweight Port Scanning"""
    target_ports = [21, 22, 23, 25, 53, 80, 110, 139, 443, 445, 3306, 3389, 5432, 8080, 8443]
    service_map = {
        21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS", 
        80: "HTTP", 110: "POP3", 139: "NetBIOS", 443: "HTTPS", 
        445: "SMB", 3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL", 
        8080: "HTTP-Alt", 8443: "HTTPS-Alt"
    }
    
    tasks = [check_port(domain, port) for port in target_ports]
    results = await asyncio.gather(*tasks)
    
    open_ports = [p for p in results if p is not None]
    closed_ports = [p for p in target_ports if p not in open_ports]
    
    identified_services = {str(p): service_map[p] for p in open_ports}

    return {
        "open": open_ports,
        "closed": closed_ports,
        "services": identified_services
    }

async def analyze_headers(domain: str) -> dict:
    """Task 3: HTTP Header & Tech Stack Analysis"""
    results = {}
    
    headers_to_check = {
        "Server": "Fingerprinting risk if version exposed",
        "X-Powered-By": "Backend tech disclosure",
        "Strict-Transport-Security": "HTTPS not enforced",
        "Content-Security-Policy": "XSS risk",
        "X-Frame-Options": "Clickjacking risk",
        "X-Content-Type-Options": "MIME sniffing risk"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Try HTTPS first, fallback to HTTP if fails
            try:
                response = await client.get(f"https://{domain}")
            except httpx.RequestError:
                response = await client.get(f"http://{domain}")
            
            headers = response.headers
            
            for header, risk_desc in headers_to_check.items():
                value = headers.get(header)
                if value:
                    flag = "present"
                    # Simple heuristic: If Server says "Apache/2.4" it's riskier than just "Apache"
                    if header == "Server" and re.search(r'\d', value):
                         flag = "warn (version exposed)"
                    results[header] = {"status": flag, "value": value}
                else:
                    flag = "missing"
                    if header in ["Server", "X-Powered-By"]:
                        flag = "good (hidden)" # Missing server header is good
                    results[header] = {"status": flag, "value": None}
                    
    except Exception as e:
        print(f"Error fetching headers: {e}")
        return {"error": "Host unreachable or timed out"}

    return results

async def probe_sensitive_paths(domain: str) -> dict:
    """Task 4: Sensitive Path Probing"""
    paths = [
        '/.env', '/.git/config', '/.git/HEAD', '/admin', 
        '/admin/login', '/robots.txt', '/backup.zip', 
        '/wp-login.php', '/.htaccess'
    ]
    
    results = {}
    async def check_path(client, path):
         url = f"https://{domain}{path}"
         try:
             # Fast HEAD requests
             response = await client.head(url, follow_redirects=False)
             return path, response.status_code
         except Exception:
             # Fallback to HTTP if HTTPS fails
             try:
                 url = f"http://{domain}{path}"
                 response = await client.head(url, follow_redirects=False)
                 return path, response.status_code
             except Exception:
                 return path, "error"

    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            tasks = [check_path(client, path) for path in paths]
            path_results = await asyncio.gather(*tasks)
            
            for path, status in path_results:
                severity = "low"
                if status == 200:
                    # robots.txt is normally 200, the rest shouldn't be
                    if path != '/robots.txt':
                        severity = "HIGH"
                results[path] = {"status": status, "severity": severity}
    except Exception as e:
         print(f"Error probing paths: {e}")
         return {"error": "Probing failed"}
         
    return results

async def run_scan_tasks(domain: str) -> dict:
    """Orchestrates all 4 recon tasks concurrently"""
    
    subdomains_task = get_subdomains(domain)
    ports_task = scan_ports(domain)
    headers_task = analyze_headers(domain)
    paths_task = probe_sensitive_paths(domain)
    
    # Run all tasks at the same time and wait for them all to finish
    results = await asyncio.gather(
        subdomains_task,
        ports_task,
        headers_task,
        paths_task
    )
    
    return {
        "domain": domain,
        "subdomains": results[0],
        "ports": results[1],
        "headers": results[2],
        "paths": results[3]
    }
