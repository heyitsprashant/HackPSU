import base64
import json
from typing import Any, Dict, Optional
import requests
import google.generativeai as genai
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ELEVEN_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

VOICE_MAP = {
    "rachel": "21m00Tcm4TlvDq8ikWAM",
    "bella": "EXAVITQu4vr4xnSDxMaL",
    "adam": "pNInz6obpgDQGcFmaJgB",
}


def _generate_eval(question: str, answer: str) -> Dict[str, Any]:
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    prompt = f"""
You are an expert technical interview coach. Evaluate the candidate's answer concisely.

Question: {question}
Candidate Answer: {answer}

Provide feedback in this exact JSON format:
{{
  "evaluation": {{"score": <0-100>, "verdict": "Excellent"|"Good"|"Needs Improvement"}},
  "summary": "<one sentence summary of their answer>",
  "visual_prompt": "<what diagram would help explain this concept>",
  "explanation": "<clear feedback with markdown formatting for emphasis. Use **bold** for key points, bullets for lists>",
  "theory": "<additional context or best practices>"
}}

Format the explanation clearly with proper structure. Use markdown: **bold** for emphasis, - for bullets.
Return ONLY valid JSON, no code fences.
"""
    resp = model.generate_content(prompt)
    txt = resp.text or "{}"
    txt = txt.strip()
    if txt.startswith('```json'):
        txt = txt[7:]
    if txt.startswith('```'):
        txt = txt[3:]
    if txt.endswith('```'):
        txt = txt[:-3]
    txt = txt.strip()
    try:
        start = txt.find("{")
        end = txt.rfind("}") + 1
        if start >= 0 and end > start:
            jtxt = txt[start:end]
            return json.loads(jtxt)
        return json.loads(txt)
    except Exception:
        return {
            "evaluation": {"score": 0, "verdict": "Needs Improvement"},
            "summary": "Unable to parse response",
            "visual_prompt": "",
            "explanation": txt.strip() if txt else "No feedback available",
            "theory": "",
        }


def _generate_svg(prompt: str) -> str:
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    svg_prompt = f"Return a single valid SVG (800x500, light bg, dark labels) illustrating: {prompt}. No markdown fences."
    try:
        res = model.generate_content(svg_prompt)
        svg = (res.text or '').strip()
        if not svg.startswith('<svg'):
            raise ValueError('not svg')
        return svg
    except Exception:
        safe = prompt.replace('<','&lt;').replace('>','&gt;')
        return f"""<?xml version=\"1.0\"?><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"800\" height=\"500\"><rect width=\"100%\" height=\"100%\" fill=\"#f1f5f9\"/><text x=\"40\" y=\"60\" fill=\"#0f172a\">Diagram: {safe}</text></svg>"""


def _tts_b64(text: str, voice: Optional[str]) -> Optional[str]:
    if not ELEVEN_API_KEY or not text:
        return None
    vid = voice or "rachel"
    vid = VOICE_MAP.get(vid.lower(), vid)
    if len(vid) < 21:
        vid = VOICE_MAP.get("rachel")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/stream?optimize_streaming_latency=3"
    payload = {"text": text, "model_id": "eleven_multilingual_v2", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
    headers = {"xi-api-key": ELEVEN_API_KEY, "accept": "audio/mpeg", "content-type": "application/json"}
    r = requests.post(url, json=payload, headers=headers, timeout=60)
    if r.status_code != 200:
        return None
    return base64.b64encode(r.content).decode("utf-8")


def run_unified(question: str, answer: str, mode: str = "text", voice: Optional[str] = None) -> Dict[str, Any]:
    ai = _generate_eval(question, answer)
    image_b64 = None
    if mode == "visual" and ai.get("visual_prompt"):
        svg = _generate_svg(ai["visual_prompt"])
        image_b64 = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
    audio_b64 = _tts_b64(ai.get("explanation", ""), voice)
    return {"ai": ai, "image": image_b64, "audio": audio_b64}
