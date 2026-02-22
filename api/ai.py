import os
import json
import httpx
from fastapi.responses import StreamingResponse
from .db import update_scan_report

# Initialize openrouter key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """You are an elite Cybersecurity Analyst. You have been given structured JSON recon data from an automated scan. Generate a concise, professional vulnerability assessment report in clean Markdown with the following sections:

1. **Executive Summary** — 2-3 sentence overall risk assessment with a rating: Low / Medium / High / Critical
2. **Attack Surface Overview** — what was discovered (subdomains, open ports, exposed paths)
3. **Potential Attack Vectors** — specific risks deduced from the data only (do not invent vulnerabilities)
4. **Header Security Analysis** — grade each security header as Pass / Warn / Fail with brief explanation
5. **Actionable Remediation Steps** — numbered list, ordered by severity (Critical → Low)
6. **Risk Score** — a definitive score integer specifically between 0 and 10, clearly marked as "Score: X/10" at the very end of the report.

Be precise. Only report on risks directly evidenced by the provided data."""

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
