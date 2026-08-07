import base64
from io import BytesIO
from pathlib import Path

import numpy as np
import torch
from flask import Flask, jsonify, request, send_file
from PIL import Image

from model import DigitCNN

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "digit_model.pth"
app = Flask(__name__, static_folder=None)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = DigitCNN().to(device)

if MODEL_PATH.exists():
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device, weights_only=True))
    model.eval()
else:
    model = None


@app.after_request
def allow_local_portfolio(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.get("/")
def home():
    return send_file(BASE_DIR / "index.html")


@app.get("/app.js")
def javascript():
    return send_file(BASE_DIR / "app.js", mimetype="text/javascript")


def prepare_image(data_url):
    """Convert a canvas PNG to the normalized 1×28×28 MNIST input format."""
    if "," not in data_url:
        raise ValueError("Invalid image data")
    encoded = data_url.split(",", 1)[1]
    image = Image.open(BytesIO(base64.b64decode(encoded))).convert("L")
    pixels = np.asarray(image)
    points = np.argwhere(pixels > 20)
    if points.size == 0:
        raise ValueError("Please draw a digit first")

    top, left = points.min(axis=0)
    bottom, right = points.max(axis=0) + 1
    digit = image.crop((left, top, right, bottom))
    scale = 20 / max(digit.size)
    resized = digit.resize(
        (max(1, round(digit.width * scale)), max(1, round(digit.height * scale))),
        Image.Resampling.LANCZOS,
    )
    centered = Image.new("L", (28, 28), 0)
    centered.paste(resized, ((28 - resized.width) // 2, (28 - resized.height) // 2))

    tensor = torch.from_numpy(np.asarray(centered, dtype=np.float32).copy())
    tensor = tensor.unsqueeze(0).unsqueeze(0) / 255.0
    return ((tensor - 0.1307) / 0.3081).to(device)


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return "", 204
    if model is None:
        return jsonify({"error": "digit_model.pth was not found; run train.py first"}), 503
    try:
        image = prepare_image((request.get_json(silent=True) or {}).get("image", ""))
        with torch.inference_mode():
            probabilities = torch.softmax(model(image), dim=1)[0]
        prediction = int(probabilities.argmax().item())
        return jsonify({
            "prediction": prediction,
            "confidence": round(float(probabilities[prediction]), 4),
            "probabilities": [round(float(value), 4) for value in probabilities.tolist()],
        })
    except (ValueError, OSError, base64.binascii.Error) as error:
        return jsonify({"error": str(error)}), 400


if __name__ == "__main__":
    print(f"Model device: {device}")
    print("Open http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
