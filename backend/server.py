# backend/server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from transformers import pipeline
from PIL import Image
from io import BytesIO
import aiohttp
import asyncio
from datetime import datetime
import os
import socket
from urllib.parse import urlparse
from collections import deque

app = FastAPI(title="AMD Sentry API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("AMD SENTRY: LOADING AI MODEL...")
pipe = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
print("AMD SENTRY: SYSTEM ONLINE 🟢")

scan_history = deque(maxlen=500)
prediction_cache = {}

# Updated Request Model to include ID
class ImageRequest(BaseModel):
    url: str
    id: str

def is_safe_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https'):
            return False
        hostname = parsed.hostname
        if not hostname: return False

        # Basic SSRF protection (prevent local network scans)
        ip = socket.gethostbyname(hostname)
        if ip.startswith(('127.', '10.', '192.168.', '169.254.', '0.')):
            return False
        return True
    except Exception:
        return False

# Global session for connection pooling
http_session = None

@app.on_event("startup")
async def startup_event():
    global http_session
    http_session = aiohttp.ClientSession()

@app.on_event("shutdown")
async def shutdown_event():
    if http_session:
        await http_session.close()

async def download_image(url: str):
    if not is_safe_url(url):
        return None
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        async with http_session.get(url, headers=headers, timeout=5) as response:
            if response.status != 200: return None
            # Prevent OOM by capping download size to 10MB
            return await response.content.read(10 * 1024 * 1024)
    except Exception:
        return None

def cached_predict(url: str, image_bytes: bytes):
    if url in prediction_cache:
        return prediction_cache[url]
    try:
        img = Image.open(BytesIO(image_bytes))
        results = pipe(img)
        result = results[0]

        # Prevent memory leak
        if len(prediction_cache) > 1000:
            prediction_cache.pop(next(iter(prediction_cache)))

        prediction_cache[url] = result
        return result
    except Exception:
        return None

@app.get("/status")
async def status():
    return {"status": "online"}

@app.get("/")
async def dashboard():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "templates", "dashboard.html")
    if os.path.exists(file_path): return FileResponse(file_path)
    # Fallback if running outside backend folder
    return FileResponse(os.path.join(base_dir, "backend", "templates", "dashboard.html"))

@app.get("/api/history")
def get_history():
    return {"history": list(scan_history)}

@app.post("/analyze")
async def analyze_image(request: ImageRequest):
    image_bytes = await download_image(request.url)

    if not image_bytes:
        return JSONResponse({"error": "Download failed"}, status_code=400)

    top_result = await asyncio.to_thread(cached_predict, request.url, image_bytes)

    if not top_result:
        return JSONResponse({"error": "Processing failed"}, status_code=500)

    scan_record = {
        "time": datetime.now().strftime("%H:%M:%S"),
        "url": request.url,
        "result": top_result['label'],
        "confidence": top_result['score']
    }
    scan_history.append(scan_record)

    # Return the same ID back to the frontend
    return {
        "result": top_result['label'],
        "confidence": top_result['score'],
        "id": request.id
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
