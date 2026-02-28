import os
import json
import httpx
from fastapi.responses import StreamingResponse
from .db import update_scan_report

# Initialize openrouter key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """You are an elite Cybersecurity Engineer. You have been given structured JSON recon data from an automated vulnerability scan. Generate a highly professional, visually clean vulnerability assessment report in Markdown.

STRICT FORMATTING RULES:
1. You MUST use blank lines (`\n\n`) between every single heading, paragraph, and list.
2. Use emojis to denote severity context (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low, ℹ️ Info).
3. Use blockquotes (`>`) for emphasis or tooltips.

Format your report strictly with these sections:

1. **Executive Summary**
   - A brief overview stating the target and the primary security posture. Include a clear Risk Rating.

2. **Attack Surface & Tech Stack**
   - Bulleted summary of discovered assets (Open Ports/Services, Exposed Paths, Subdomains).
   - Explicitly mention the detected Tech Stack and WAF (Web Application Firewall) if present.

3. **Vulnerability Assessment (OWASP Mapping)**
   - Detail specific risks deduced ONLY from the provided data (Headers, DNS/SPF/DMARC missing, exposed paths). 
   - For each risk, include the relevant OWASP Top 10 category or CWE ID.

4. **Remediation & Hardening**
   - Actionable, numbered steps to secure the infrastructure, prioritized by severity.

5. **Risk Score**
   - Conclude the report with a definitively formatted score taking up its own line: "Score: X/10".

Be precise, objective, and analytically strict. Do NOT hallucinate vulnerabilities not evidenced by the JSON data."""

async def stream_ai_report(scan_id: str, raw_data: dict) -> StreamingResponse:
    """Streams the AI report back to the frontend and updates the database upon completion"""
    
    async def generate():
        full_content = ""
        risk_score = 0
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://sentinelscan.vercel.app", # Adjust if deploying elsewhere
            "X-Title": "SentinelScan"
        }
        
        data = {
            "model": "arcee-ai/trinity-large-preview:free",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Please analyze this raw scan data:\n\n{json.dumps(raw_data, indent=2)}"}
            ],
            "stream": True
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream("POST", OPENROUTER_URL, headers=headers, json=data) as response:
                    
                    if response.status_code != 200:
                        yield f"data: {json.dumps({'error': f'OpenRouter API Error: {response.status_code}'})}\n\n"
                        update_scan_report(scan_id, f"Error generating report: HTTP {response.status_code}", 0, "ai_failed")
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            line_data = line[6:]
                            if line_data == "[DONE]":
                                break
                            
                            try:
                                chunk = json.loads(line_data)
                                if "choices" in chunk and len(chunk["choices"]) > 0:
                                    delta = chunk["choices"][0].get("delta", {})
                                    content = delta.get("content", "")
                                    if content:
                                        full_content += content
                                        # Yield exactly the content chunk to the frontend formatted as SSE
                                        yield f"data: {json.dumps({'text': content})}\n\n"
                            except json.JSONDecodeError:
                                continue

            # After generation is complete, try to extract the risk score from the final text
            import re
            score_match = re.search(r"Score:\s*(\d{1,2})/10", full_content, re.IGNORECASE)
            if score_match:
                try:
                    risk_score = int(score_match.group(1))
                    if risk_score > 10: risk_score = 10
                except ValueError:
                    pass

            # Update database
            update_scan_report(scan_id, full_content, risk_score, "complete")
            
            # Send final done message
            yield f"data: {json.dumps({'done': True, 'score': risk_score})}\n\n"

        except Exception as e:
            print(f"Streaming error: {e}")
            yield f"data: {json.dumps({'error': 'Failed to connect to AI provider.'})}\n\n"
            update_scan_report(scan_id, "AI generation failed due to timeout or connection error.", 0, "ai_failed")

    return StreamingResponse(generate(), media_type="text/event-stream")
