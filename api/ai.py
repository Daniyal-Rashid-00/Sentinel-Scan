import os
import json
import httpx
from fastapi.responses import StreamingResponse
from .db import update_scan_report

# Initialize openrouter key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """You are an elite Cybersecurity Assessor. Generate a highly structured, professional vulnerability assessment report adhering to international cybersecurity standards (e.g., CVSS-inspired, OWASP Top 10) based ONLY on the provided JSON recon data. Do not invent vulnerabilities. Format your response strictly in Markdown with these exact sections:

## 1. Executive Summary
Provide a high-level overview of the target's security posture. Include a definitive risk rating (Low / Medium / High / Critical) and key takeaways suitable for non-technical management.

## 2. Technical Attack Surface
Summarize the exposed assets: subdomains, open ports/services, security headers, and discovered sensitive paths.

## 3. Vulnerability Assessment
Categorize identified risks (e.g., Misconfigurations, Information Disclosure). Detail the specific risk for each anomalous finding (like exposed admin panels, missing security headers, or open high-risk ports).

## 4. Remediation Planning
Provide highly actionable, prioritized recommendations organized by severity (Critical → Low) to mitigate the identified risks.

## 5. Risk Score
Conclude the report with a definitive single integer score out of 10 assessing overall risk. You must append exactly "Score: X/10" at the very end of the report where X is the score.
"""

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
