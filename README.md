# 🛡️ SentinelScan

<p align="center">
  <em>Automated Reconnaissance & AI-Powered Vulnerability Reporting</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-Python-009688" alt="FastAPI">
  <img src="https://img.shields.io/badge/AI-OpenRouter-blue" alt="OpenRouter">
  <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E" alt="Supabase">
</p>

---

## 📖 Overview

**SentinelScan** is a modern, serverless web application that performs rapid passive and active reconnaissance on an input domain, compiling the results into a professional vulnerability assessment report driven by AI.

Built for security researchers and ethical hackers, SentinelScan runs concurrent scanning modules to gather attack surface data in seconds, streams the raw JSON to a Large Language Model, and outputs a highly readable, OWASP-mapped report in real-time.

> **⚠️ Disclaimer:** This tool is for educational purposes and ethical testing only. Only scan domains you own or have explicit authorization to test.

---

## ✨ Features

- **⚡ Blazing Fast Concurrent Recon**
  - **Subdomain Enumeration:** Merges passive certificate transparency logs (`crt.sh`) with active DNS brute-forcing (100+ common prefixes).
  - **Port Scanning:** Async connectivity checks across 15 high-profile default ports (SSH, FTP, RDP, MySQL, etc.).
  - **Header Analysis:** Detects missing or misconfigured security headers (CSP, HSTS, X-Frame-Options).
  - **Sensitive Path Probing:** Rapid-fires HTTP HEAD requests against 60+ known sensitive endpoints (`/.env`, `/.git/config`, `/backup.sql`, `/swagger`).
- **🧠 AI-Powered Analysis:** Raw data is fed into an LLM via OpenRouter, which streams a contextualized, Markdown-formatted vulnerability report mapping findings to **OWASP Top 10 / CWE** standards.
- **📱 Cyber Dark UI:** A gorgeous, responsive frontend built with Next.js, Tailwind CSS, and shadcn/ui.
- **☁️ Serverless Ready:** Designed to deploy seamlessly on Vercel with a stateless Python FastAPI backend.

---

## 🏗️ Architecture

The app uses a monorepo structure:
- **Frontend (`/src`):** Next.js App Router (React + TypeScript). Handles user input, raw data rendering, and consuming the Server-Sent Events (SSE) AI stream.
- **Backend (`/api`):** Python FastAPI. Exposes two main endpoints (`/api/scan` and `/api/report`). Orchestrates async scanning and securely interacts with the Supabase database.
- **Database:** Supabase (PostgreSQL). Stores raw scan JSON and final AI reports to enable shareable report links.

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
Create a file named `.env.local` in the root directory and add your API keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter Interface
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=arcee-ai/trinity-large-preview:free
```

### 4. Run the Development Server
Start both the Next.js frontend and FastAPI backend concurrently with a single command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment (Vercel)

SentinelScan is ready for 1-click deployment on Vercel. Vercel automatically detects the Next.js frontend and packages the `api/index.py` file into a scalable Serverless Function.

1. Import the repository into Vercel.
2. Add the `.env.local` environment variables in the Vercel project settings.
3. Deploy!

---

## 👨‍💻 Author & Professional Audits

Built by **Daniyal Rashid**. 

Automated scanning is only the first step in a mature security posture. If your SentinelScan report reveals potential weaknesses and you require a comprehensive, manual penetration test or architecture review, please reach out.

🔗 **[Contact Daniyal for Professional Cybersecurity Consulting](https://daniyal-rashid.vercel.app/)**
