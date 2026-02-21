# Product Requirements Document (PRD): SentinelScan MVP — v2.0

---

## 1. Project Overview

SentinelScan is a web-based, AI-powered Automated Reconnaissance and Vulnerability Reporting platform. Users input a target domain and receive a structured, AI-generated security report in under 20 seconds. The system is built to operate on a strictly **$0 budget** using serverless infrastructure.

### What's New in v2.0
- **Two-phase async architecture** to reliably stay under Vercel's serverless timeout
- **Streaming AI report delivery** so users see output as it generates
- **Ethical consent gate** before any scan is executed
- **Rate limiting & abuse prevention** on the API layer
- **Expanded error handling** with graceful fallbacks across all layers
- **Shareable report URLs** with Open Graph metadata
- **Improved folder structure** with clearer separation of concerns

---

## 2. Technical Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui |
| Backend | Python 3.11, FastAPI, Vercel Serverless Functions |
| Database | Supabase (PostgreSQL + JSONB) |
| AI Provider | OpenRouter API — `deepseek/deepseek-r1-0528:free` |
| Deployment | Vercel (Frontend + Serverless API) |

---

## 3. Environment Configuration

All secrets must live in `.env.local` and must **never** be committed to version control. Add `.env.local` to `.gitignore` immediately.

```bash
# .env.example  ← commit this with placeholder values only

# FRONTEND — Next.js (safe to expose, prefixed NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# BACKEND — Python / FastAPI (server-side ONLY, never expose to client)
SUPABASE_URL=https://<your-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OPENROUTER_API_KEY=<your-openrouter-key>
OPENROUTER_MODEL=deepseek/deepseek-r1-0528:free
SITE_NAME=SentinelScan
```

> **Hard Rule:** `SUPABASE_SERVICE_ROLE_KEY` and `OPENROUTER_API_KEY` must only ever be accessed inside `/api` (server-side Python). They must never appear in any `NEXT_PUBLIC_` variable or client-side code.

---

## 4. UI/UX Design System (Minimalist Cyber Dark)

### 4.1 Color Palette

| Role | Tailwind Class |
|---|---|
| Page Background | `bg-zinc-950` |
| Cards / Panels | `bg-zinc-900 border border-zinc-800` |
| Primary Accent | `text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/30` |
| Secondary Accent (hover) | `text-cyan-400` |
| Headings | `text-zinc-100` |
| Body / Muted Text | `text-zinc-400` |
| Danger / Error | `text-red-400 bg-red-500/10` |
| Warning | `text-yellow-400 bg-yellow-500/10` |
| Success | `text-emerald-400 bg-emerald-500/10` |

### 4.2 Typography

- **UI Elements:** Geist Sans (Next.js default) or Inter via `next/font`
- **Technical Output** (logs, domain names, ports, IPs, raw JSON): `font-mono` — Fira Code or JetBrains Mono via Google Fonts
- **Report Markdown:** Rendered with `react-markdown` + `remark-gfm`, styled with a custom dark prose theme

### 4.3 Animations & Interactions

- **Scanning State:** Pulsing emerald ring (`animate-pulse`) around the scan indicator + a live terminal log window
- **Terminal Log Window:** New log lines appear one-by-one with a typewriter effect using `setTimeout` chaining — monospace font, green text on black, blinking cursor `_`
- **AI Report:** Streams in progressively using Server-Sent Events (SSE) or chunked fetch, giving a "live typing" feel
- **Page Transitions:** Subtle fade-in on route change to the report page

---

## 5. Core Features & Logic

### 5.1 Ethical Consent Gate (New)

Before any scan is initiated, the user must check a consent box with the following text:

> *"I confirm that I am authorized to perform a security scan on this domain. Scanning domains you do not own or have explicit permission to test may be illegal. SentinelScan accepts no liability for misuse."*

The scan API must **reject requests without a `consent: true` flag** in the request body, returning HTTP `403 Forbidden`.

---

### 5.2 Scanning Engine — Python Backend

**Core Constraint:** All four tasks run concurrently via `concurrent.futures.ThreadPoolExecutor`. No CLI binaries (Nmap, Gobuster, etc.). Target total scan time: **under 8 seconds** to leave headroom for the AI call.

#### Task 1 — Passive Subdomain Enumeration
- Query: `https://crt.sh/?q=%.{domain}&output=json`
- Parse JSON → extract `name_value` → deduplicate → strip wildcards (`*.`)
- Return max **15 unique subdomains**
- Timeout: `5s` on the HTTP request
- On failure: return `{"subdomains": [], "error": "crt.sh unavailable"}`

#### Task 2 — Lightweight Port Scanning
- Use Python `socket.connect_ex()` with a **0.5s timeout per port**
- Scan exactly these 15 ports: `21, 22, 23, 25, 53, 80, 110, 139, 443, 445, 3306, 3389, 5432, 8080, 8443`
- Return: `{"open": [80, 443], "closed": [21, 22, ...], "services": {"22": "SSH", "3306": "MySQL"}}`
- Include a hardcoded service name map for all 15 ports

#### Task 3 — HTTP Header & Tech Stack Analysis
- Perform `GET` to both `http://{domain}` and `https://{domain}` with a `5s` timeout
- Extract and evaluate these headers:

| Header | Risk if Missing |
|---|---|
| `Server` | Fingerprinting risk if version exposed |
| `X-Powered-By` | Backend tech disclosure |
| `Strict-Transport-Security` | HTTPS not enforced |
| `Content-Security-Policy` | XSS risk |
| `X-Frame-Options` | Clickjacking risk |
| `X-Content-Type-Options` | MIME sniffing risk |

- Return each header's **value** and a **risk flag**: `present`, `missing`, or `misconfigured`

#### Task 4 — Sensitive Path Probing
- Use fast `HEAD` requests (2s timeout each) against:
  `/.env`, `/.git/config`, `/.git/HEAD`, `/admin`, `/admin/login`, `/robots.txt`, `/backup.zip`, `/wp-login.php`, `/.htaccess`
- Return the HTTP status code for each path
- Flag any `200 OK` on a sensitive path as **HIGH severity**

---

### 5.3 Two-Phase API Architecture (New — Solves Timeout Problem)

Split into two endpoints so each stays well within Vercel's limits:

**Phase 1 — `POST /api/scan`**
- Accepts: `{ domain: string, consent: true }`
- Validates domain format (regex) + consent flag + not a private/local IP
- Runs the 4 concurrent scanning tasks
- Inserts raw scan data into Supabase with `status: "scanning"`
- Returns: `{ scan_id, raw_data }` in **< 8 seconds**
- Frontend immediately shows raw data and begins Phase 2

**Phase 2 — `POST /api/report`**
- Accepts: `{ scan_id: string }`
- Fetches raw data from Supabase by `scan_id`
- Sends data to OpenRouter API with `stream: true`
- Streams AI response back to frontend via SSE
- Updates Supabase record with `ai_report` and `status: "complete"`
- Target response time: **< 12 seconds**

This decoupling means users see scan results instantly while the AI report streams in progressively — no blank waiting screen.

---

### 5.4 Rate Limiting & Abuse Prevention (New)

Implemented in FastAPI middleware (`middleware.py`):

- Max **5 scans per IP per hour** — enforced by querying Supabase for recent records matching `client_ip` within the last 60 minutes
- Store `client_ip` as an additional column on the `scans` table
- Exceed limit → HTTP `429` with message: `"Scan limit reached. Please wait before trying again."`
- **Block private/local IPs:** Reject scans targeting `127.x.x.x`, `192.168.x.x`, `10.x.x.x`, `172.16–31.x.x`, `::1`, `localhost`
- **Domain validation:** Regex check that the input is a valid public domain — reject anything that isn't

---

### 5.5 AI Report Generation

**Trigger:** Called in Phase 2 once Phase 1 raw data is confirmed in Supabase.

**API Details:**
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `deepseek/deepseek-r1-0528:free`
- Set `"stream": true` in the request body

**System Prompt:**
```
You are an elite Cybersecurity Analyst. You have been given structured JSON recon data
from an automated scan. Generate a concise, professional vulnerability assessment report
in clean Markdown with the following sections:

1. **Executive Summary** — 2-3 sentence overall risk assessment with a rating: Low / Medium / High / Critical
2. **Attack Surface Overview** — what was discovered (subdomains, open ports, exposed paths)
3. **Potential Attack Vectors** — specific risks deduced from the data only (do not invent vulnerabilities)
4. **Header Security Analysis** — grade each security header as Pass / Warn / Fail with brief explanation
5. **Actionable Remediation Steps** — numbered list, ordered by severity (Critical → Low)
6. **Risk Score** — a score out of 10 with a one-sentence justification

Be precise. Only report on risks directly evidenced by the provided data.
```

**Error Handling:**

| Error | Behavior |
|---|---|
| HTTP `429` from OpenRouter | Return fallback message, show raw data |
| HTTP `5xx` from OpenRouter | Retry once after 2s, then fall back |
| Timeout > 15s | Fall back gracefully, update status to `"ai_failed"` |
| Invalid JSON response | Log and return fallback message |

---

### 5.6 Database Schema (Supabase)

**Table: `scans`**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `domain` | `text` | The scanned domain |
| `client_ip` | `text` | For rate limiting — do not expose to frontend |
| `raw_data` | `jsonb` | Full output from all 4 scan tasks |
| `ai_report` | `text` | Markdown from OpenRouter (nullable until Phase 2 complete) |
| `risk_score` | `int2` | 0–10, parsed from AI output |
| `status` | `text` | `scanning` → `complete` or `ai_failed` |
| `created_at` | `timestamptz` | Default `now()` |

**Row Level Security (RLS):**
- Anon users can **SELECT** any scan by `id` (enables shareable public report URLs)
- Only the **service role key** (backend Python) can `INSERT` or `UPDATE`
- `client_ip` column must be excluded from anon select policy

---

## 6. Frontend Pages & Components

### 6.1 Pages

**`/` — Landing & Search (`page.tsx`)**
- Hero with tagline and subtle animated background (CSS grid or scanline pattern)
- Monospace domain input + "Scan Now" button (disabled until consent checked)
- Consent checkbox with required acknowledgement text
- Recent scans feed (last 5 completed scans from Supabase, domain + risk score + timestamp)

**`/scan/[id]` — Live Progress Page**
- Shows the domain being scanned
- Terminal log window with animated task-by-task status messages
- Automatically transitions to `/report/[id]` or reveals the report inline once complete

**`/report/[id]` — Report View Page**
- Renders `ai_report` Markdown via `react-markdown` + `remark-gfm`
- Raw data panels (subdomains, ports, headers, paths) in collapsible `<details>` cards
- Risk score badge — color-coded (green / yellow / orange / red)
- Share button copies the full report URL to clipboard
- OG meta tags for social link previews
- "Scan Another Domain" CTA at the bottom

### 6.2 Components

| Component | Purpose |
|---|---|
| `DomainInput` | Controlled input with format validation + consent gate |
| `TerminalLog` | Typewriter-effect animated log window |
| `ReportRenderer` | `react-markdown` with custom dark-theme CSS |
| `RiskBadge` | Color-coded severity chip (Low / Medium / High / Critical) |
| `ScanResultCard` | Collapsible card for raw result sections |
| `ShareButton` | Copies `/report/[id]` URL to clipboard with toast feedback |

---

## 7. Folder Structure

```
/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout, font config, OG defaults
│   │   ├── page.tsx                  # Landing + domain search page
│   │   ├── scan/
│   │   │   └── [id]/page.tsx         # Live scan progress page
│   │   └── report/
│   │       └── [id]/
│   │           ├── page.tsx          # Report view page
│   │           └── opengraph-image.tsx  # Dynamic OG image
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components
│   │   ├── DomainInput.tsx
│   │   ├── TerminalLog.tsx
│   │   ├── ReportRenderer.tsx
│   │   ├── RiskBadge.tsx
│   │   ├── ScanResultCard.tsx
│   │   └── ShareButton.tsx
│   └── lib/
│       ├── supabase.ts               # Supabase browser client (anon key only)
│       └── utils.ts                  # Domain validation, formatting helpers
├── api/
│   ├── index.py                      # FastAPI app, CORS config, route wiring
│   ├── scanner.py                    # ThreadPoolExecutor scan logic (4 tasks)
│   ├── ai.py                         # OpenRouter streaming integration
│   ├── db.py                         # Supabase service-role client (Python)
│   └── middleware.py                 # Rate limiting, IP validation, consent check
├── .env.example                      # Placeholder keys only — safe to commit
├── .env.local                        # Real secrets — NEVER commit (in .gitignore)
├── .gitignore
├── requirements.txt
├── package.json
├── tailwind.config.ts
└── vercel.json
```

---

## 8. Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.py", "use": "@vercel/python" },
    { "src": "package.json", "use": "@vercel/next" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.py" },
    { "src": "/(.*)", "dest": "/" }
  ],
  "functions": {
    "api/index.py": {
      "maxDuration": 25
    }
  }
}
```

> Set `maxDuration: 25` — this is available on Vercel's free Hobby plan and gives enough headroom for both phases.

---

## 9. Python Dependencies (`requirements.txt`)

```
fastapi==0.111.0
uvicorn==0.29.0
requests==2.31.0
supabase==2.4.0
python-dotenv==1.0.1
```

---

## 10. Acceptance Criteria

| # | Feature | Pass Condition |
|---|---|---|
| 1 | Consent gate | API returns `403` if `consent` is not `true` |
| 2 | Private IP block | Scanning `localhost` or `192.168.x.x` returns `400` |
| 3 | Rate limiting | 6th scan from same IP within 1 hour returns `429` |
| 4 | Subdomain enum | Returns up to 15 unique results from crt.sh |
| 5 | Port scan | Correctly identifies open/closed for all 15 ports |
| 6 | Header analysis | Returns value + risk flag for all 6 headers |
| 7 | Path probing | Returns correct HTTP status for all 9 paths |
| 8 | Phase 1 timing | `/api/scan` responds in under 8 seconds |
| 9 | AI streaming | Report text begins rendering within 2s of Phase 2 call |
| 10 | Supabase write | Every completed scan has a working `/report/[id]` URL |
| 11 | AI fallback | If OpenRouter fails, raw data is shown with a warning banner |
| 12 | Secret security | No API keys appear in client-side code or `NEXT_PUBLIC_` vars |
