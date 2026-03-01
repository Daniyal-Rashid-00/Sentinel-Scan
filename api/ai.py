import os
import json
import httpx
from fastapi.responses import StreamingResponse
from .db import update_scan_report

# Initialize openrouter key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SYSTEM_PROMPT = """You are an elite Cybersecurity Engineer analyzing JSON recon data from an automated vulnerability scan. Generate a thorough, medium-length assessment report in Markdown, targeting 600–900 words.

STRICT FORMATTING RULES:
1. Aim for 600–900 words. Be detailed and substantive, but stay focused and avoid padding.
2. You MUST use blank lines (`\n\n`) between every single heading, paragraph, and list.
3. Use emojis to denote severity (🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low, ℹ️ Info).

Format your report exactly with these sections (do not create extra sections):

1. **Risk Score**
   - The VERY FIRST LINE under this heading MUST be your definitively formatted score on its own line: "Score: X/10".
   - Follow with 2-3 sentences justifying the score based on the evidence found.

2. **Executive Summary**
   - 3-5 sentences covering the target, its overall security posture, and the most significant risk drivers discovered.

3. **Attack Surface & Tech**
   - A detailed bulleted breakdown of discovered assets: Open Ports with their services, identified Tech Stack components and versions, WAF/CDN status, DNS records, and any other notable infrastructure details.

4. **Key Findings**
   - Detail the top 4-5 highest-risk findings deduced ONLY from the provided data.
   - For each finding, include: severity emoji, finding name, a 2-3 sentence explanation of the issue and its potential impact.

5. **Remediation**
   - Provide 4-5 specific, prioritized, numbered remediation steps tied directly to the findings above.
   - Each step should include the rationale and the expected security benefit.

6. **Conclusion**
   - 2-3 sentences summarizing the overall risk level and the most critical next action the team should take.

Be precise, objective, and strict. Do NOT hallucinate vulnerabilities not evidenced by the data."""

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

            # After generation is complete, extract the risk score very robustly
            import re
            
            # Remove all markdown formatting (*, _, #) for easier parsing
            clean_content = re.sub(r'[*_#]', '', full_content)
            
            # Look for variations like "Risk Score: 1/10", "Score 1 / 10", "score: 1 /10"
            score_match = re.search(r"(?:risk\s*)?score[\s:]*(\d{1,2})\s*(?:/|out of\s*)?\s*10", clean_content, re.IGNORECASE)
            
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
