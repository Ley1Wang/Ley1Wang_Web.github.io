function calc() {

    let B = parseFloat(document.getElementById("B").value);
    let v = parseFloat(document.getElementById("v").value);
    let N = parseFloat(document.getElementById("N").value);

    let emf = B * v * N;
    let current = emf / 5;

    document.getElementById("emf").innerText = "EMF: " + emf.toFixed(2);
    document.getElementById("current").innerText = "Current: " + current.toFixed(2);
}