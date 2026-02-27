<div align="center">
  <img src="https://raw.githubusercontent.com/Daniyal-Rashid-00/SentinelScan/main/public/icon.svg" alt="SentinelScan Logo" width="120" height="120" />
</div>

<h1 align="center">SentinelScan v2.0</h1>

<p align="center">
  <strong>Automated Reconnaissance & AI-Powered Vulnerability Reporting</strong><br/>
  <i>Lightning-fast reconnaissance layered with intelligent context.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/OpenRouter-AI%20Models-white?style=flat-square" alt="OpenRouter" />
</p>

---

## ⚡ Overview

**SentinelScan** is a modern, serverless security scanning platform. It automates initial reconnaissance tasks—such as subdomain enumeration, port scanning, and sensitive path probing—and uses advanced Large Language Models (LLMs) to generate professional, compliance-ready vulnerability assessments in seconds.

## ✨ Features

- **🚀 Concurrent Reconnaissance**: Runs multiple reconnaissance modules (DNS brute-forcing, Certificate Transparency logs, HTTP header analysis, sensitive directory probing) entirely in parallel using Python `asyncio`.
- **🧠 AI-Powered Assessment**: Feeds raw JSON recon data into an LLM (via OpenRouter) to write structured, actionable, and formatted Markdown reports adhering to industry standards.
- **🌊 Instant Streaming UI**: Employs real-time Server-Sent Events (SSE) to stream the AI report line-by-line while raw scan data populates instantly on the mobile-responsive Next.js frontend.
- **🔒 Consent Gated & Rate Limited**: Designed for ethical testing only. Integrates robust rate-limiting and private-IP blocking middleware.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Python 3, FastAPI, `httpx`, `asyncio`
- **Database**: Supabase (PostgreSQL) + Edge Functions
- **AI Integration**: OpenRouter API (`arcee-ai/trinity-large-preview:free` / `deepseek-r1`)
- **Hosting**: Vercel Serverless Functions

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- Python 3.9+
- A Supabase project (for Postgres DB)
- An OpenRouter API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Daniyal-Rashid-00/SentinelScan.git
   cd SentinelScan
   ```

2. **Install dependencies:**
   ```bash
   npm install        # Frontend deps
   pip install -r requirements.txt  # Backend deps
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENROUTER_API_KEY=your_openrouter_key
   ```

4. **Run the Development Server:**
   This customized command boots up both the Next.js UI frontend and the Python FastAPI backend proxy concurrently:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 💼 Hire a Professional

Automated tools like SentinelScan are fantastic for initial surface reconnaissance, but they are no substitute for deep manual testing. If your organization requires deep-dive vulnerability analysis, business logic testing, and compliance-ready pentest reports, [contact me for a comprehensive security assessment](https://daniyal-rashid.vercel.app/).

---
<div align="center">
<p>Developed with ❤️ by <a href="https://daniyal-rashid.vercel.app/">Daniyal Rashid</a></p>
</div>
