# backend/server.py
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from transformers import pipeline
from PIL import Image
import requests
from io import BytesIO
from datetime import datetime

# Tell Flask to look for HTML files in the 'templates' folder
app = Flask(__name__, template_folder='templates')
CORS(app)

# MEMORY STORAGE (resets when you restart server)
scan_history = []

print("--------------------------------------------------")
print("AMD SENTRY: INITIALIZING AI MODEL...")
pipe = pipeline("image-classification", model="dima806/deepfake_vs_real_image_detection")
print("AMD SENTRY: MODEL READY 🟢")
print("--------------------------------------------------")

# 1. NEW ROUTE: The Dashboard Page
@app.route('/')
def dashboard():
    return render_template('dashboard.html')

# 2. NEW ROUTE: API for the Dashboard to get data
@app.route('/api/history')
def get_history():
    return jsonify({"history": scan_history})

@app.route('/status', methods=['GET'])
def check_status():
    return jsonify({"status": "online"})

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.json
        image_url = data.get('url')
        print(f"Analyzing: {image_url}")

        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(image_url, headers=headers, timeout=5)
        img = Image.open(BytesIO(response.content))
        
        results = pipe(img)
        top_result = results[0]
        
        # SAVE RESULT TO HISTORY
        scan_record = {
            "time": datetime.now().strftime("%H:%M:%S"),
            "url": image_url,
            "result": top_result['label'],
            "confidence": top_result['score']
        }
        scan_history.append(scan_record)

        print(f"VERDICT: {top_result['label'].upper()} ({top_result['score']:.2f})")
        
        return jsonify({
            "result": top_result['label'],
            "confidence": top_result['score']
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed"}), 500

if __name__ == '__main__':
    app.run(port=5000)