const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");

const points = [];
let scanAngle = 0;
let tick = 0;

function addDemoPoint() {
    scanAngle = (scanAngle + 2) % 360;
    tick += 1;

    const inActiveZone =
        (scanAngle > 24 && scanAngle < 82) ||
        (scanAngle > 218 && scanAngle < 258);
    const pulse = Math.sin(tick / 11) > -0.35;

    points.push({
        angle: scanAngle,
        presence: inActiveZone && pulse ? 1 : 0
    });

    if (points.length > 140) {
        points.shift();
    }
}

function drawRadar(data) {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.42;
    const activePoints = data.filter(point => point.presence > 0);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#061f22";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < activePoints.length; i++) {
        const point = activePoints[i];
        const rad = point.angle * Math.PI / 180;
        const spread = Math.PI / 50;
        const alpha = 0.04 + 0.24 * ((i + 1) / activePoints.length);

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

    const latest = data[data.length - 1];
    if (latest) {
        const rad = latest.angle * Math.PI / 180;
        ctx.strokeStyle = latest.presence ? "rgba(52, 211, 153, 0.95)" : "rgba(255, 255, 255, 0.34)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad) * radius, cy - Math.sin(rad) * radius);
        ctx.stroke();
    }

    ctx.fillStyle = "#d1fae5";
    ctx.font = "18px Inter, Arial";
    ctx.fillText("0 deg", cx + radius - 54, cy - 10);
    ctx.fillText("90 deg", cx + 10, cy - radius + 22);
    ctx.fillText("180 deg", cx - radius + 10, cy - 10);
    ctx.fillText("270 deg", cx + 10, cy + radius - 10);

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(209, 250, 229, 0.75)";
    ctx.font = "19px Inter, Arial";
    ctx.fillText("Presence direction demo", cx, cy + radius + 36);
    ctx.textAlign = "start";
}

function loop() {
    addDemoPoint();
    drawRadar(points);
    requestAnimationFrame(loop);
}

loop();
