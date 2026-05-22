# 🛡️ SentinelScan: Automated AI-Powered Attack Surface Management

**SentinelScan** is a modern, full-stack cybersecurity application designed to perform rapid, concurrent reconnaissance on internet-facing domains. It automates the discovery of attack surfaces and leverages Large Language Models (LLMs) to synthesize raw telemetry into actionable, executive-ready vulnerability reports.

This project was built to solve a critical bottleneck in penetration testing: the significant time spent manually correlating raw scanning tool outputs into digestible business risk. 

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
</p>

---

## 🏗️ Architecture & Engineering Highlights

SentinelScan employs a **monorepo architecture** specifically optimized for serverless deployment environments (Vercel). 

### 1. High-Performance Asynchronous Python Backend 
- **Framework:** FastAPI
- **The Challenge:** Traditional scanning tools are synchronous and slow. A modern web dashboard requires near-instantaneous feedback.
- **The Solution:** Engineered a custom Python reconnaissance engine utilizing `asyncio` and `aiohttp`. Instead of blocking on HTTP probes. The engine fires hundreds of concurrent networking checks.
- **Micro-Scanners Implemented:**
  - **DNS & Subdomain Enumeration:** Fetches Certificate Transparency logs and resolves targets.
  - **Async Port Scanning:** Non-blocking TCP connection tests against common exposed services (SSH, FTP, RDP, MySQL).
  - **Endpoint Fuzzing:** Heuristic checking of 60+ sensitive paths (e.g., `/.env`, `/.git/config`, `/backup.sql`).

### 2. Streaming AI Pipeline (OpenRouter API)
- **The Challenge:** LLM generation wait times lead to poor User Experience on the frontend.
- **The Solution:** Implemented **Server-Sent Events (SSE)**. The FastAPI backend orchestrates prompt engineering to contextualize the raw JSON telemetry, streams the response from the LLM, and passes it directly to the client UI as it generates, mapping findings to **OWASP Top 10**.

### 3. Dynamic React Frontend (Next.js 14 App Router)
- **Stack:** React, TypeScript, Next.js, Tailwind CSS, shadcn/ui.
- **Design:** Engineered a highly responsive "Cyber Dark" UI that provides intuitive error handling, loading states, and dynamic Markdown rendering for the final AI report.

### 4. Scalable Data Persistence
- **Database:** Supabase (PostgreSQL).
- **Features:** Stores raw scan JSON and final AI reports, enabling persistent, shareable report links without re-running intensive scans.

---

## 💡 Key Skills Demonstrated
* **Full-Stack Development:** Bridging a modern React/TypeScript frontend with an asynchronous Python/FastAPI backend.
* **Systems Design:** Designing a stateless backend capable of running complex, long-running reconnaissance tasks within Vercel's serverless function timeout limits.
* **Cybersecurity Engineering:** Applied knowledge of offensive security techniques (reconnaissance, fuzzing) and defensive standards (OWASP, CWE mappings).
* **AI Integration:** Effectively utilizing LLM APIs for data synthesis and formatting via streaming protocols (SSE).

---

## 🛠️ Local Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- **Git**

### 2. Clone and Install
```bash
git clone https://github.com/YOUR_USERNAME/SentinelScan.git
cd SentinelScan

# Install Frontend Dependencies
npm install

# Install Backend Dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Create a file named `.env.local` in the root directory and configure your keys:

```env
# Supabase Database Links
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter (LLM) Interface
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=arcee-ai/trinity-large-preview:free
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

> **⚠️ Disclaimer:** This tool is for educational purposes and ethical testing only. Only scan domains you own or have explicit authorization to test.

---

## 👨‍💻 About The Developer

Built by **Daniyal Rashid**, a software engineer passionate about intersecting cybersecurity with robust full-stack development. 

🔗 **[View My Portfolio & Resume](https://daniyal-rashid.vercel.app/)**
