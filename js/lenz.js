function calc() {

    let B = parseFloat(document.getElementById("B").value);
    let v = parseFloat(document.getElementById("v").value);
    let N = parseFloat(document.getElementById("N").value);

    let emf = B * v * N * direction;
    let current = emf / 5 * direction;

    document.getElementById("emf").innerText = "EMF: " + emf.toFixed(2);
    document.getElementById("current").innerText = "Current: " + current.toFixed(2);
}

let pos = 0;
let direction = 1;

function animate() {
    pos += direction * 0.5;

    if (pos > 300 || pos < 0) {
        direction *= -1; 

    }

    document.getElementById("magnet").style.left = pos + "px";

    requestAnimationFrame(animate);
}

animate();