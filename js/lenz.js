function calc() {

    let B = parseFloat(document.getElementById("B").value);
    let v = parseFloat(document.getElementById("v").value);
    let N = parseFloat(document.getElementById("N").value);

    let emf = B * v * N;
    let current = emf / 5;

    document.getElementById("emf").innerText = "EMF: " + emf.toFixed(2);
    document.getElementById("current").innerText = "Current: " + current.toFixed(2);
}

let pos = 0;
let direction = 1;

function animate() {
    pos += direction * 2;

    if (pos > 200 || pos < 0) {
        direction *= -1; // 反方向
    }

    document.getElementById("magnet").style.top = pos + "px";

    requestAnimationFrame(animate);
}

animate();