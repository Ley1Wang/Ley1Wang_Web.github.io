import csv
import json
import math
import re
import threading
import time
from pathlib import Path

try:
    import serial
except ImportError:
    serial = None

from flask import Flask, jsonify, send_file


PORT = "COM3"
BAUD_RATE = 9600
ANGLE_STEP = 3
MAX_RECORDS = 360
DATA_FILE = Path("radar_data.csv")

app = Flask(__name__)
records = []
raw_records = []
estimated_angle = 0


def parse_line(line):
    global estimated_angle

    parts = [part.strip() for part in line.split(",")]

    if len(parts) >= 2:
        try:
            angle = float(parts[0]) % 360
            distance = float(parts[1])
            return angle, distance
        except ValueError:
            pass

    numbers = re.findall(r"-?\d+(?:\.\d+)?", line)
    if not numbers:
        return None, None

    distance = float(numbers[0])
    estimated_angle = (estimated_angle + ANGLE_STEP) % 360
    return estimated_angle, distance


def save_record(record):
    file_exists = DATA_FILE.exists()

    with DATA_FILE.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["time", "angle", "distance", "raw"],
        )

        if not file_exists:
            writer.writeheader()

        writer.writerow(record)


def read_radar():
    if serial is None:
        print("pyserial is not installed. Run: python -m pip install pyserial flask")
        return

    try:
        arduino = serial.Serial(PORT, BAUD_RATE, timeout=1)
    except Exception as error:
        print(f"Could not open {PORT}: {error}")
        return

    print(f"Reading radar data from {PORT} at {BAUD_RATE} baud...")

    buffer = ""
    last_flush = time.time()

    while True:
        waiting = arduino.in_waiting
        chunk = arduino.read(waiting or 1).decode(errors="ignore")

        if chunk:
            buffer += chunk

        lines = []
        while "\n" in buffer:
            line, buffer = buffer.split("\n", 1)
            lines.append(line.strip())

        if buffer and time.time() - last_flush > 0.25:
            lines.append(buffer.strip())
            buffer = ""
            last_flush = time.time()

        for line in lines:
            if not line:
                continue

            raw_records.append({
                "time": round(time.time(), 3),
                "raw": line,
            })
            raw_records[:] = raw_records[-80:]

            angle, distance = parse_line(line)
            if angle is None or distance is None:
                print(f"raw only: {line}")
                continue

            record = {
                "time": round(time.time(), 3),
                "angle": round(angle, 2),
                "distance": round(distance, 2),
                "raw": line,
            }

            records.append(record)
            records[:] = records[-MAX_RECORDS:]
            save_record(record)
            print(json.dumps(record, ensure_ascii=False))


@app.route("/")
def index():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Radar Viewer</title>
<style>
body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    background: #f3fdf8;
    color: #1f2937;
}
.topbar {
    height: 56px;
    background: #072E33;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
}
main {
    max-width: 1100px;
    margin: 30px auto;
    padding: 0 18px;
    display: grid;
    grid-template-columns: minmax(360px, 1fr) 320px;
    gap: 18px;
}
.panel {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}
canvas {
    width: 100%;
    aspect-ratio: 1 / 1;
    display: block;
    background: #061f22;
    border-radius: 8px;
}
pre {
    min-height: 420px;
    max-height: 520px;
    overflow: auto;
    background: #071f22;
    color: #d1fae5;
    padding: 12px;
    border-radius: 8px;
    font-size: 12px;
}
a {
    color: #065f46;
    font-weight: 700;
}
@media (max-width: 820px) {
    main {
        grid-template-columns: 1fr;
    }
}
</style>
</head>
<body>
<div class="topbar">
    <strong>Radar Viewer</strong>
    <span id="status">0 points</span>
</div>
<main>
    <section class="panel">
        <canvas id="radar" width="720" height="720"></canvas>
    </section>
    <aside class="panel">
        <p><a href="/download">Download CSV</a></p>
        <p id="latest">Waiting for data...</p>
        <pre id="raw">[]</pre>
    </aside>
</main>
<script>
const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");

function drawRadar(data) {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.43;
    const maxDistance = Math.max(100, ...data.map(p => Number(p.distance) || 0));

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#061f22";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
    ctx.lineWidth = 2;
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * i / 4, 0, Math.PI * 2);
        ctx.stroke();
    }

    for (let deg = 0; deg < 360; deg += 30) {
        const rad = deg * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * radius, cy - Math.sin(rad) * radius);
        ctx.stroke();
    }

    ctx.fillStyle = "#d1fae5";
    ctx.font = "16px Arial";
    ctx.fillText("0 deg", cx + radius - 42, cy - 8);
    ctx.fillText("90 deg", cx + 8, cy - radius + 20);
    ctx.fillText("180 deg", cx - radius + 8, cy - 8);
    ctx.fillText("270 deg", cx + 8, cy + radius - 8);

    for (const point of data) {
        const angle = Number(point.angle);
        const distance = Number(point.distance);
        if (!Number.isFinite(angle) || !Number.isFinite(distance)) continue;

        const rad = angle * Math.PI / 180;
        const r = Math.min(distance / maxDistance, 1) * radius;
        const x = cx + Math.cos(rad) * r;
        const y = cy - Math.sin(rad) * r;

        ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    const latest = data[data.length - 1];
    if (latest) {
        const rad = Number(latest.angle) * Math.PI / 180;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * radius, cy - Math.sin(rad) * radius);
        ctx.stroke();
    }
}

async function update() {
    const response = await fetch("/data");
    const data = await response.json();
    const rawResponse = await fetch("/raw");
    const raw = await rawResponse.json();
    document.getElementById("status").textContent = data.length + " points";
    document.getElementById("raw").textContent = JSON.stringify({
        parsed: data.slice(-20),
        raw: raw.slice(-20)
    }, null, 2);

    const latest = data[data.length - 1];
    if (latest) {
        document.getElementById("latest").textContent =
            "Latest: angle " + latest.angle + ", distance " + latest.distance;
    } else if (raw.length) {
        document.getElementById("latest").textContent =
            "Raw data received, but no angle/distance number could be parsed yet.";
    } else {
        document.getElementById("latest").textContent =
            "Waiting for serial data. Check COM port, baud rate, and Arduino Serial Monitor.";
    }

    drawRadar(data);
}

setInterval(update, 400);
update();
</script>
</body>
</html>
"""


@app.route("/data")
def data():
    return jsonify(records)


@app.route("/raw")
def raw():
    return jsonify(raw_records)


@app.route("/download")
def download():
    if not DATA_FILE.exists():
        DATA_FILE.write_text("time,angle,distance,raw\\n", encoding="utf-8")

    return send_file(DATA_FILE, as_attachment=True)


if __name__ == "__main__":
    threading.Thread(target=read_radar, daemon=True).start()
    app.run(host="127.0.0.1", port=5000)
