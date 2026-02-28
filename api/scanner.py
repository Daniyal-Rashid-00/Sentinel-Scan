import asyncio
import httpx
import re
import socket
import dns.asyncresolver

# ─────────────────────────────────────────────────────────────────────────────
# COMMON SUBDOMAIN PREFIXES for DNS brute-force
# ─────────────────────────────────────────────────────────────────────────────
SUBDOMAIN_WORDLIST = [
    "www", "mail", "remote", "blog", "webmail", "server", "ns1", "ns2",
    "smtp", "secure", "vpn", "m", "shop", "ftp", "mail2", "test", "portal",
    "ns", "ww1", "host", "support", "dev", "mx", "email", "cloud", "1",
    "2", "forum", "beta", "api", "www2", "cdn", "news", "web", "direct",
    "owa", "autodiscover", "intranet", "admin", "old", "new", "staging",
    "backup", "gateway", "prod", "production", "demo", "app", "apps",
    "static", "assets", "media", "img", "images", "login", "auth",
    "sso", "status", "monitor", "metrics", "ci", "git", "gitlab",
    "github", "jira", "confluence", "wiki", "docs", "documentation",
    "help", "helpdesk", "ticket", "crm", "erp", "hr", "payroll",
    "db", "database", "mysql", "postgres", "redis", "mongo",
    "dev2", "test2", "stage", "uat", "qa", "sandbox", "preview",
    "internal", "corp", "extranet", "remote2", "rdp", "office",
    "exchange", "smtp2", "pop", "pop3", "imap", "mx1", "mx2",
    "cpanel", "whm", "plesk", "panel", "ftp2", "sftp", "files",
    "download", "downloads", "update", "updates", "store", "ecommerce",
    "payment", "pay", "billing", "invoice", "account", "accounts",
    "sentry", "grafana", "kibana", "elastic", "jenkins", "build",
    "deploy", "proxy", "lb", "loadbalancer", "firewall", "router",
]

# ─────────────────────────────────────────────────────────────────────────────
# SENSITIVE PATHS for probing
# ─────────────────────────────────────────────────────────────────────────────
SENSITIVE_PATHS = [
    # Env / secrets
    "/.env", "/.env.local", "/.env.production", "/.env.backup",
    "/.env.dev", "/.env.staging", "/env.json",
    # Git
    "/.git/config", "/.git/HEAD", "/.git/COMMIT_EDITMSG",
    "/.gitignore", "/.gitmodules",
    # Admin panels
    "/admin", "/admin/login", "/admin/dashboard",
    "/administrator", "/wp-admin", "/wp-login.php",
    "/phpmyadmin", "/pma", "/manager/html",
    "/django-admin", "/rails/info",
    # API & Docs
    "/api", "/api/v1", "/api/v2",
    "/swagger", "/swagger-ui.html", "/swagger/index.html",
    "/api-docs", "/graphql", "/playground",
    "/openapi.json", "/openapi.yaml",
    # Backups & dumps
    "/backup.zip", "/backup.tar.gz", "/backup.sql",
    "/dump.sql", "/db.sql", "/database.sql", "/data.sql",
    "/backup", "/backups",
    # Config files
    "/.htaccess", "/.htpasswd",
    "/web.config", "/config.php", "/config.yml",
    "/configuration.php", "/settings.py",
    "/application.yml", "/application.properties",
    # Common recon
    "/robots.txt", "/sitemap.xml",
    "/phpinfo.php", "/info.php", "/test.php",
    "/server-status", "/server-info",
    # Cloud / container metadata
    "/latest/meta-data/", "/latest/meta-data/iam/",
    "/.well-known/security.txt",
    # Node / Python artifacts
    "/package.json", "/requirements.txt", "/composer.json",
    "/Dockerfile", "/.dockerignore",
]


async def _resolve_subdomain(prefix: str, domain: str) -> str | None:
    """Attempt async DNS resolution of a single subdomain prefix."""
    hostname = f"{prefix}.{domain}"
    try:
        loop = asyncio.get_event_loop()
        await asyncio.wait_for(
            loop.run_in_executor(None, socket.gethostbyname, hostname),
            timeout=1.5
        )
        return hostname
    except Exception:
        return None


async def get_subdomains(domain: str) -> list[str]:
    """Task 1: Subdomain enumeration via crt.sh (passive) + DNS brute-force (active)."""
    found = set()

    # ── Passive: Certificate Transparency via crt.sh ──────────────────────────
    async def fetch_crtsh():
        url = f"https://crt.sh/?q=%.{domain}&output=json"
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    for entry in resp.json():
                        for name in entry.get("name_value", "").split("\n"):
                            clean = name.strip().replace("*.", "")
                            if clean.endswith(f".{domain}") and clean != domain:
                                found.add(clean)
        except Exception as e:
            print(f"crt.sh error: {e}")

    # ── Active: DNS brute-force ────────────────────────────────────────────────
    async def dns_bruteforce():
        tasks = [_resolve_subdomain(prefix, domain) for prefix in SUBDOMAIN_WORDLIST]
        results = await asyncio.gather(*tasks)
        for r in results:
            if r:
                found.add(r)

    # Run both sources concurrently
    await asyncio.gather(fetch_crtsh(), dns_bruteforce())

    return sorted(found)[:30]


async def check_port(domain: str, port: int) -> int | None:
    """Helper to check a single port asynchronously."""
    try:
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
    """Task 2: Lightweight port scanning."""
    target_ports = [21, 22, 23, 25, 53, 80, 110, 139, 443, 445, 3306, 3389, 5432, 8080, 8443]
    service_map = {
        21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
        80: "HTTP", 110: "POP3", 139: "NetBIOS", 443: "HTTPS",
        445: "SMB", 3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
        8080: "HTTP-Alt", 8443: "HTTPS-Alt"
    }
    results = await asyncio.gather(*[check_port(domain, p) for p in target_ports])
    open_ports = [p for p in results if p is not None]
    closed_ports = [p for p in target_ports if p not in open_ports]
    return {
        "open": open_ports,
        "closed": closed_ports,
        "services": {str(p): service_map[p] for p in open_ports}
    }


async def analyze_headers(domain: str) -> dict:
    """Task 3: HTTP header & tech stack analysis."""
    headers_to_check = {
        "Server": "Fingerprinting risk if version exposed",
        "X-Powered-By": "Backend tech disclosure",
        "Strict-Transport-Security": "HTTPS not enforced",
        "Content-Security-Policy": "XSS risk",
        "X-Frame-Options": "Clickjacking risk",
        "X-Content-Type-Options": "MIME sniffing risk",
        "Referrer-Policy": "Referrer data leakage",
        "Permissions-Policy": "Browser feature exposure",
    }
    results = {}
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            try:
                resp = await client.get(f"https://{domain}")
            except httpx.RequestError:
                resp = await client.get(f"http://{domain}")

            # Standard Security Headers
            for header, _ in headers_to_check.items():
                value = resp.headers.get(header)
                if value:
                    flag = "present"
                    results[header] = {"status": flag, "value": value}
                else:
                    results[header] = {"status": "missing", "value": None}

            # Tech Stack & WAF Detection
            server = resp.headers.get("Server", "").lower()
            xpb = resp.headers.get("X-Powered-By", "").lower()
            cookies = resp.headers.get("Set-Cookie", "").lower()
            
            # WAF Fingerprints
            waf = "None detected"
            if "cloudflare" in server or "__cfduid" in cookies or "cf-ray" in resp.headers:
                waf = "Cloudflare"
            elif "awselb" in server or "awsalb" in cookies:
                waf = "AWS WAF / ELB"
            elif "sucuri" in server or "sucuri_cloudproxy" in cookies:
                waf = "Sucuri"
            elif "akamai" in server:
                waf = "Akamai"
            elif "f5" in server or "bigip" in cookies:
                waf = "F5 BIG-IP"
                
            results["WAF_Detection"] = {"status": "info", "value": waf}
            
            # Tech Stack Fingerprints
            tech = [t for t in [server, xpb] if t]
            results["Tech_Stack"] = {"status": "info", "value": " | ".join(tech) if tech else "Unknown"}

    except Exception as e:
        print(f"Header analysis error: {e}")
        return {"error": "Host unreachable or timed out"}
    return results

async def check_dns_security(domain: str) -> dict:
    """Task 3.5: Deep DNS Checks (SPF, DMARC, TXT records)"""
    results = {}
    resolver = dns.asyncresolver.Resolver()
    resolver.timeout = 2.0
    resolver.lifetime = 2.0

    async def get_txt(target: str) -> list[str]:
        try:
            answers = await resolver.resolve(target, 'TXT')
            return [str(r).strip('"') for r in answers]
        except Exception:
            return []

    # Check SPF
    txt_records = await get_txt(domain)
    spf_record = next((r for r in txt_records if r.startswith("v=spf1")), None)
    results["SPF_Record"] = {"status": "present" if spf_record else "missing (Spoofing risk)", "value": spf_record}

    # Check DMARC
    dmarc_records = await get_txt(f"_dmarc.{domain}")
    dmarc_record = next((r for r in dmarc_records if r.startswith("v=DMARC1")), None)
    results["DMARC_Record"] = {"status": "present" if dmarc_record else "missing (Spoofing risk)", "value": dmarc_record}

    return results


async def probe_sensitive_paths(domain: str) -> dict:
    """Task 4: Sensitive path probing — 60+ paths checked concurrently."""
    results = {}

    async def check_path(client: httpx.AsyncClient, path: str):
        for scheme in ("https", "http"):
            try:
                resp = await client.head(
                    f"{scheme}://{domain}{path}",
                    follow_redirects=False,
                    timeout=2.5
                )
                return path, resp.status_code
            except Exception:
                continue
        return path, "error"

    try:
        async with httpx.AsyncClient() as client:
            path_results = await asyncio.gather(*[check_path(client, p) for p in SENSITIVE_PATHS])

        for path, status in path_results:
            is_exposed = status == 200 and path not in ("/robots.txt", "/sitemap.xml",
                                                         "/.well-known/security.txt",
                                                         "/openapi.json", "/openapi.yaml")
            results[path] = {
                "status": status,
                "severity": "HIGH" if is_exposed else "low"
            }
    except Exception as e:
        print(f"Path probing error: {e}")
        return {"error": "Probing failed"}

    return results


async def run_scan_tasks(domain: str) -> dict:
    """Orchestrates all recon tasks concurrently."""
    results = await asyncio.gather(
        get_subdomains(domain),
        scan_ports(domain),
        analyze_headers(domain),
        check_dns_security(domain),
        probe_sensitive_paths(domain),
    )
    return {
        "domain": domain,
        "subdomains": results[0],
        "ports": results[1],
        "headers": results[2],
        "dns": results[3],
        "paths": results[4],
    }
