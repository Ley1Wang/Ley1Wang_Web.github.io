let target = {
    angle: Math.random() * Math.PI * 2,
    dist: Math.random() * radius,
    life: 0,
    nextMoveTime: Date.now() + 2000
};
function updateTarget() {
    let now = Date.now();

    // 每隔几秒在附近移动一点
    if (now > target.nextMoveTime) {
        target.angle += (Math.random() - 0.5) * 0.3; // 小角度变化
        target.dist += (Math.random() - 0.5) * 20;   // 小距离变化

        // 限制范围
        target.dist = Math.max(20, Math.min(radius, target.dist));

        target.nextMoveTime = now + 2000 + Math.random() * 2000;
    }

    // 高亮衰减
    if (target.life > 0) {
        target.life--;
    }
}   
let diff = Math.abs(angle - target.angle);
diff = Math.min(diff, Math.PI * 2 - diff);

if (diff < 0.03) {
    target.life = 15; // 被扫到 → 高亮
}
let tx = center + target.dist * Math.cos(target.angle);
let ty = center + target.dist * Math.sin(target.angle);

if (target.life > 0) {
    ctx.fillStyle = "lime";   // 高亮绿色
} else {
    ctx.fillStyle = "rgba(0,255,0,0.3)";
}

ctx.beginPath();
ctx.arc(tx, ty, 5, 0, Math.PI * 2);
ctx.fill();
updateTarget();