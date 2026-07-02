import csv
import json
import threading
import time
from pathlib import Path

try:
    import serial
    from serial.tools import list_ports
except ImportError:
    serial = None
    list_ports = None

from flask import Flask, jsonify, send_file


PORT = "COM8"
BAUD_RATE = 9600
MAX_RECORDS = 360
APP_DIR = Path(__file__).resolve().parent
DATA_FILE = APP_DIR / "presence_data.csv"

app = Flask(__name__)
records = []
raw_records = []
serial_status = {
    "connected": False,
    "message": "Serial reader has not started yet.",
    "ports": [],
}


def parse_line(line):
    parts = [part.strip() for part in line.split(",")]

    if len(parts) != 2:
        return None, None

    try:
        angle = float(parts[0]) % 360
        presence = int(float(parts[1]))
    except ValueError:
        return None, None

    if presence < 0:
        presence = 0

    return angle, presence

def save_record(record):
    file_exists = DATA_FILE.exists()

    with DATA_FILE.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["time", "angle", "presence", "raw"],
        )

        if not file_exists:
            writer.writeheader()

        writer.writerow(record)


def available_ports():
    if list_ports is None:
        return []

    return [
        f"{port.device} - {port.description}"
        for port in list_ports.comports()
    ]


def read_radar():
    if serial is None:
        serial_status["connected"] = False
        serial_status["message"] = "pyserial is not installed. Run: python -m pip install pyserial flask"
        print(serial_status["message"])
        return

    while True:
        serial_status["ports"] = available_ports()

        try:
            arduino = serial.Serial(PORT, BAUD_RATE, timeout=1)
        except Exception as error:
            serial_status["connected"] = False
            serial_status["message"] = f"Could not open {PORT}: {error}. Close Serial Monitor, then wait for reconnect."
            print(serial_status["message"])
            time.sleep(2)
            continue

        serial_status["connected"] = True
        serial_status["message"] = f"Reading radar data from {PORT} at {BAUD_RATE} baud."
        print(serial_status["message"])
        print("Expected Arduino output format: angle,presence")

        buffer = ""

        try:
            while True:
                waiting = arduino.in_waiting
                chunk = arduino.read(waiting or 1).decode(errors="ignore")

                if chunk:
                    buffer += chunk

                lines = []
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    lines.append(line.strip())

                for line in lines:
                    if not line:
                        continue

                    raw_records.append({
                        "time": round(time.time(), 3),
                        "raw": line,
                    })
                    raw_records[:] = raw_records[-80:]

                    angle, presence = parse_line(line)
                    if angle is None or presence is None:
                        print(f"invalid line, expected angle,presence: {line}")
                        continue

                    record = {
                        "time": round(time.time(), 3),
                        "angle": round(angle, 2),
                        "presence": presence,
                        "raw": line,
                    }

                    records.append(record)
                    records[:] = records[-MAX_RECORDS:]
                    save_record(record)
                    print(json.dumps(record, ensure_ascii=False))
        except Exception as error:
            serial_status["connected"] = False
            serial_status["message"] = f"Serial connection lost: {error}. Retrying..."
            print(serial_status["message"])
            try:
                arduino.close()
            except Exception:
                pass
            time.sleep(2)


@app.route("/")
def index():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Presence Radar Viewer</title>
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
    <strong>Presence Radar Viewer</strong>
    <span id="status">0 points</span>
</div>
<main>
    <section class="panel">
        <canvas id="radar" width="720" height="720"></canvas>
    </section>
    <aside class="panel">
        <p><a href="/download">Download CSV</a></p>
        <p id="serialStatus">Checking serial...</p>
        <p id="ports">Ports: checking...</p>
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
    const recentData = data.slice(-50);
    const activePoints = recentData.filter(p => Number(p.presence) > 0);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#061f22";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < activePoints.length; i++) {
        const point = activePoints[i];
        const angle = Number(point.angle);
        if (!Number.isFinite(angle)) continue;

        const rad = angle * Math.PI / 180;
        const spread = Math.PI / 48;
        const alpha = 0.06 + 0.26 * ((i + 1) / activePoints.length);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, -rad - spread, -rad + spread, false);
        ctx.closePath();
        ctx.fillStyle = "rgba(16, 185, 129, " + alpha + ")";
        ctx.fill();
    }

    ctx.strokeStyle = "rgba(16, 185, 129, 0.28)";
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

    const latest = data[data.length - 1];
    if (latest) {
        const rad = Number(latest.angle) * Math.PI / 180;
        ctx.strokeStyle = Number(latest.presence) > 0 ? "rgba(52, 211, 153, 0.95)" : "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * radius, cy - Math.sin(rad) * radius);
        ctx.stroke();
    }

    ctx.fillStyle = "rgba(209, 250, 229, 0.75)";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(activePoints.length ? "Recent presence highlighted" : "No presence detected yet", cx, cy + radius + 34);
    ctx.textAlign = "start";
}

async function update() {
    const response = await fetch("/data");
    const data = await response.json();
    const rawResponse = await fetch("/raw");
    const raw = await rawResponse.json();
    const statusResponse = await fetch("/status");
    const status = await statusResponse.json();

    document.getElementById("status").textContent = data.length + " points";
    document.getElementById("serialStatus").textContent = status.message;
    document.getElementById("ports").textContent =
        "Ports: " + ((status.ports && status.ports.length) ? status.ports.join(" | ") : "none");
    document.getElementById("raw").textContent = JSON.stringify({
        parsed: data.slice(-20),
        raw: raw.slice(-20)
    }, null, 2);

    const latest = data[data.length - 1];
    if (latest) {
        document.getElementById("latest").textContent =
            Number(latest.presence) > 0 ? "Presence at angle " + latest.angle : "Scanning angle " + latest.angle + "; no presence";
    } else if (raw.length) {
        document.getElementById("latest").textContent =
            "Raw data received, but it is not valid angle,presence format yet.";
    } else {
        document.getElementById("latest").textContent =
            "Waiting for angle,presence serial data. Check COM port, baud rate, and Arduino upload.";
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


@app.route("/status")
def status():
    return jsonify(serial_status)


@app.route("/download")
def download():
    if not DATA_FILE.exists():
        DATA_FILE.write_text("time,angle,presence,raw\\n", encoding="utf-8")

    return send_file(DATA_FILE, as_attachment=True)


if __name__ == "__main__":
    threading.Thread(target=read_radar, daemon=True).start()
    app.run(host="127.0.0.1", port=5000)









