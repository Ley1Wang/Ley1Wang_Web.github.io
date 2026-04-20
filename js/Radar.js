const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

const center = canvas.width / 2;
const radius = 220;

let angle = 0;
const speed = 0.02;


let target = {
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * radius,


    vAngle: (Math.random() - 0.5) * 0.02,
    vDist: (Math.random() - 0.5) * 0.5,

    life: 0,
    nextMoveTime: Date.now() + 2000
};

function update() {
    let now = Date.now();


    angle += speed;
    angle %= Math.PI * 2;


    target.angle += target.vAngle;
    target.dist += target.vDist;


    if (target.dist < 30 || target.dist > radius) {
        target.vDist *= -1;
    }


    if (now > target.nextMoveTime) {
        target.vAngle += (Math.random() - 0.5) * 0.02;
        target.vDist += (Math.random() - 0.5) * 0.3;

        target.nextMoveTime = now + 2000 + Math.random() * 2000;
    }


    let diff = Math.abs(angle - target.angle);
    diff = Math.min(diff, Math.PI * 2 - diff);

    if (diff < 0.03) {
        target.life = 20;
    }

    if (target.life > 0) {
        target.life--;
    }
}

function draw() {

    ctx.fillStyle = "rgba(0, 20, 0, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(0,255,0,0.4)";
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();


    let x = center + radius * Math.cos(angle);
    let y = center + radius * Math.sin(angle);

    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(x, y);
    ctx.stroke();


    let tx = center + target.dist * Math.cos(target.angle);
    let ty = center + target.dist * Math.sin(target.angle);

    if (target.life > 0) {
        ctx.fillStyle = "lime"; // 高亮
    } else {
        ctx.fillStyle = "rgba(0,255,0,0.3)";
    }

    ctx.beginPath();
    ctx.arc(tx, ty, 5, 0, Math.PI * 2);
    ctx.fill();
}


function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();