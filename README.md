<p align="center">
  <img src="https://img.shields.io/badge/AMD-Ryzen_AI-ED1C24?style=for-the-badge&logo=amd&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Chrome_Extension-MV3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" />
  <img src="https://img.shields.io/badge/HuggingFace-Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" />
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" />
</p>

<h1 align="center">🛡️ AMD SENTRY</h1>

<p align="center">
  <b>Real-Time AI-Powered Deepfake Detection — Right Inside Your Browser</b>
</p>

<p align="center">
  AMD Sentry is an intelligent browser extension backed by a local AI server that <b>automatically scans every image</b> on any webpage you visit, classifies it as <b>REAL</b> or <b>FAKE</b> using a deep learning model, and provides instant visual feedback — all in real time.
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Performance](#-performance)
- [Troubleshooting](#-troubleshooting)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)
- [License](#-license)

---

## 🔍 Overview

In an era of rapidly advancing generative AI, distinguishing real images from AI-generated deepfakes has become critical. **AMD Sentry** addresses this challenge by combining the power of AMD hardware with state-of-the-art AI classification, delivering a seamless, zero-friction detection experience directly within the browser.

Unlike cloud-based solutions, AMD Sentry processes everything **locally on your machine**, ensuring **complete privacy** — no images ever leave your system.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔄 **Automatic Scanning** | Every image on every webpage is scanned automatically — no clicks needed |
| 🤖 **AI Classification** | Uses a HuggingFace deep learning model trained specifically for deepfake detection |
| 🎯 **Visual Feedback** | Fake images get a red border + grayscale filter; real images get a brief green glow |
| 📊 **Live Ops Dashboard** | A cyberpunk-themed real-time dashboard showing all scanned images and threat stats |
| 🔒 **100% Local** | All processing happens on your local machine — zero data sent to external servers |
| ⚡ **Smart Filtering** | Ignores icons, tracking pixels, SVGs, and base64 images to reduce false positives |
| 🧠 **Prediction Caching** | Previously analyzed images are cached to avoid redundant AI inference |
| 💬 **Badge Alerts** | The extension badge turns <b>RED/FAKE</b> or <b>GREEN/REAL</b> for instant glanceable status |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│                                                              │
│  ┌─────────────────┐    ┌──────────────────┐                │
│  │   Content.js    │───▶│  Background.js   │                │
│  │ (Image Scanner) │◀───│ (Service Worker) │                │
│  │                 │    │                  │                │
│  │ • Intersection  │    │ • Routes API     │                │
│  │   Observer      │    │   calls          │                │
│  │ • Mutation      │    │ • Updates badge  │                │
│  │   Observer      │    │ • Stores results │                │
│  │ • Visual        │    │                  │                │
│  │   Borders       │    └────────┬─────────┘                │
│  └─────────────────┘             │                          │
│                                  │ HTTP POST /analyze       │
│  ┌─────────────────┐             │                          │
│  │   Popup.html    │             │                          │
│  │ (Status Panel)  │             │                          │
│  └─────────────────┘             │                          │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                   LOCAL AI SERVER (FastAPI)                   │
│                                                              │
│  ┌────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │ /analyze   │  │ AI Model       │  │ /api/history      │  │
│  │ endpoint   │──│ (HuggingFace)  │  │ (Scan Logs)       │  │
│  └────────────┘  └────────────────┘  └───────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Ops Center Dashboard (localhost:5000)          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend (AI Server)
| Technology | Purpose |
|---|---|
| **Python 3.10+** | Core backend language |
| **FastAPI** | High-performance async REST API framework |
| **Uvicorn** | ASGI server for running FastAPI |
| **HuggingFace Transformers** | AI model loading & inference pipeline |
| **PyTorch** | Deep learning framework powering the AI model |
| **Pillow (PIL)** | Image processing & preprocessing |
| **aiohttp** | Async HTTP client for downloading images |
| **Pydantic** | Request validation & data modeling |

### AI Model
| Detail | Value |
|---|---|
| **Model** | `dima806/deepfake_vs_real_image_detection` |
| **Source** | HuggingFace Model Hub |
| **Task** | Image Classification (Real vs. Fake) |
| **Architecture** | Vision Transformer (ViT) based |

### Browser Extension
| Technology | Purpose |
|---|---|
| **Chrome Extension Manifest V3** | Modern, secure extension architecture |
| **Content Script** | DOM scanning with IntersectionObserver + MutationObserver |
| **Service Worker** | Background API communication & badge management |
| **Chrome Storage API** | Persisting last scan result for popup display |

### Frontend Dashboard
| Technology | Purpose |
|---|---|
| **Vanilla HTML/CSS/JS** | Zero-dependency Ops Center dashboard |
| **CSS Custom Properties** | Cyberpunk-themed neon design system |
| **Fetch API** | Real-time polling for live scan feed |

---

## 📁 Project Structure

```
AMD_Sentry/
│
├── backend/
│   ├── server.py              # FastAPI AI server + all API endpoints
│   ├── templates/
│   │   └── dashboard.html     # Live Ops Center dashboard (served at /)
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend-specific notes
│
├── extension/
│   ├── manifest.json          # Chrome Extension config (Manifest V3)
│   ├── background.js          # Service Worker — API calls & badge updates
│   ├── content.js             # Content Script — image scanning & visual borders
│   ├── popup.html             # Extension popup UI
│   └── popup.js               # Popup logic — server status check
│
└── requirements.txt           # Root-level Python dependencies
```

---

## 📦 Prerequisites

Before you begin, make sure you have the following installed:

- **Python 3.10+** → [Download Python](https://www.python.org/downloads/)
- **pip** (Python package manager, comes with Python)
- **Google Chrome** or any Chromium-based browser (Edge, Brave, etc.)
- **Git** → [Download Git](https://git-scm.com/downloads)
- Minimum **4 GB RAM** (8 GB recommended for smooth AI inference)

---

## 🚀 Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/rishikeshyaadav/AMD-slingshot.git
cd AMD-slingshot
```

### Step 2 — Set Up the Python Backend

```bash
# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

> **Note:** The first run will automatically download the AI model (~500 MB) from HuggingFace. This is a one-time download.

### Step 3 — Start the AI Server

```bash
cd backend
python server.py
```

You should see:
```
AMD SENTRY: LOADING AI MODEL...
AMD SENTRY: SYSTEM ONLINE 🟢
INFO:     Uvicorn running on http://127.0.0.1:5000
```

### Step 4 — Install the Chrome Extension

1. Open **Google Chrome**
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **"Load unpacked"**
5. Select the `extension/` folder from the cloned repository
6. The **AMD Sentry** extension icon will appear in your toolbar

### Step 5 — You're Ready!

Browse any website — AMD Sentry will **automatically scan** all images on the page.

---

## 📖 Usage Guide

### 🌐 Browsing with AMD Sentry
Once both the server and extension are running, simply browse the web normally:

- **🟢 Green border** (fades after 3s) → Image verified as **REAL**
- **🔴 Red border + grayscale** → Image detected as **FAKE / AI-GENERATED**
- **Hover over any marked image** to see the confidence percentage in the tooltip

### 📊 Live Ops Dashboard
Open your browser and navigate to:
```
http://127.0.0.1:5000
```
The Ops Center dashboard provides:
- **Images Scanned** — Total count of all analyzed images
- **Threats Detected** — Number of images flagged as fake
- **Live Interception Log** — A real-time table showing timestamp, image preview, verdict, and confidence score
- **System Status** — Live server health indicator

### 🔔 Extension Popup
Click the AMD Sentry icon in your browser toolbar to:
- Check if the AI server is **ONLINE** or **OFFLINE**
- See a warning if the last scanned image was flagged as fake

### 📛 Badge Indicators
The extension badge on the toolbar updates in real time:
| Badge | Meaning |
|---|---|
| `FAKE` (Red) | Last analyzed image was classified as a deepfake |
| `REAL` (Green) | Last analyzed image was verified as real (clears after 3s) |
| `...` (Gray) | Analysis in progress |
| `ERR` (Black) | AI server is unreachable |

---

## 📡 API Reference

The backend exposes the following REST endpoints:

### `GET /status`
Health check endpoint.
```json
{ "status": "online" }
```

### `GET /`
Serves the live Ops Center dashboard (HTML page).

### `GET /api/history`
Returns the scan history (last 500 entries).
```json
{
  "history": [
    {
      "time": "14:32:07",
      "url": "https://example.com/photo.jpg",
      "result": "real",
      "confidence": 0.9821
    }
  ]
}
```

### `POST /analyze`
Analyze an image for deepfake content.

**Request Body:**
```json
{
  "url": "https://example.com/image.jpg",
  "id": "sentry-abc123xyz"
}
```

**Response:**
```json
{
  "result": "fake",
  "confidence": 0.9543,
  "id": "sentry-abc123xyz"
}
```

---

## 🔒 Security

AMD Sentry implements multiple layers of security:

- **SSRF Protection** — Blocks requests to local/private IP ranges (`127.x`, `10.x`, `192.168.x`, `169.254.x`)
- **URL Validation** — Only `http` and `https` schemes are allowed
- **Download Size Cap** — Images are limited to **10 MB** to prevent out-of-memory attacks
- **Cache Eviction** — Prediction cache is capped at 1,000 entries to prevent memory leaks
- **100% Local Processing** — No image data is sent to any third-party cloud service

---

## ⚡ Performance

| Feature | Implementation |
|---|---|
| **Connection Pooling** | Reusable `aiohttp` session for all HTTP downloads |
| **Async Inference** | AI model runs in a thread pool (`asyncio.to_thread`) to keep the server non-blocking |
| **Prediction Caching** | Previously seen URLs skip AI inference entirely |
| **IntersectionObserver** | Images are only processed when they enter the viewport (with 500px lookahead) |
| **MutationObserver** | Dynamically loaded images (infinite scroll, lazy loading) are caught automatically |
| **Smart Filtering** | Icons (< 50×50px), SVGs, base64 strings, and data URIs are skipped |
| **Scan History Limit** | Rolling buffer of 500 scan records to bound memory usage |

---

## 🔧 Troubleshooting

| Issue | Solution |
|---|---|
| Extension shows **SYSTEM OFFLINE** | Make sure the Python server is running on `127.0.0.1:5000` |
| Badge shows **ERR** | The AI server crashed or isn't running — restart `server.py` |
| Model download is slow | First run downloads ~500 MB; ensure a stable internet connection |
| Images aren't being scanned | Check that Developer Mode is enabled and the extension is loaded |
| CORS errors in console | The server allows all origins (`*`) by default; check firewall settings |
| High memory usage | The model requires ~2-4 GB of RAM; close unused applications |

---

## 🗺️ Future Roadmap

- [ ] **AMD Ryzen AI NPU Acceleration** — Offload inference to dedicated AI hardware for 10x faster processing
- [ ] **Video Deepfake Detection** — Extend scanning to video frames in real time
- [ ] **ONNX Runtime Optimization** — Quantized model for lower memory footprint and faster cold starts
- [ ] **Firefox & Edge Extensions** — Cross-browser support
- [ ] **Confidence Threshold Settings** — User-configurable sensitivity levels
- [ ] **Detailed Analysis Reports** — Exportable PDF reports with forensic analysis
- [ ] **Browser Notification Alerts** — System-level notifications for high-confidence deepfake detections

---

## 👥 Team

Built with ❤️ by **Team AMD Sentry**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <b>🛡️ Protecting the Internet — One Image at a Time 🛡️</b>
</p>
