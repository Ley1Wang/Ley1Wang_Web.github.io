function calc() {

    let B = parseFloat(document.getElementById("B").value);
    let v = parseFloat(document.getElementById("v").value);
    let N = parseFloat(document.getElementById("N").value);

    const error = document.getElementById('lenzError');
    if (![B, v, N].every(Number.isFinite) || B < 0 || v < 0 || N < 1 || !Number.isInteger(N)) {
        error.textContent = 'Use nonnegative field and speed values, and a positive whole number of turns.';
        return;
    }
    error.textContent = '';

    let emf = B * v * N ;
    let current = emf / 5 ;

    document.getElementById("emf").innerText = "Model EMF · B × v × N: " + emf.toFixed(2);
    document.getElementById("current").innerText = "Fixed-load current · model / 5 Ω: " + current.toFixed(2);
}

let pos = 0;
let direction = 1;

function animate() {
    pos += direction * 0.5;

    const scene = document.querySelector('.scene');
    const magnet = document.getElementById('magnet');
    const limit = Math.max(0, scene.clientWidth - magnet.offsetWidth);
    if (pos > limit || pos < 0) {

        pos = Math.min(limit, Math.max(0, pos));

        direction *= -1; 
        

    }

    document.getElementById("magnet").style.left = pos + "px";

    requestAnimationFrame(animate);
}

animate();
calc();
