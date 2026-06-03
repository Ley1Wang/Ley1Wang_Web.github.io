const planets = {
    Mercury: 3.7,
    Venus: 8.87,
    Earth: 9.81,
    Moon: 1.62,
    Mars: 3.71,
    Jupiter: 24.79,
    Saturn: 10.44,
    Uranus: 8.69,
    Neptune: 11.15
};

y = 0.5 * g * t * t
function startFall() {
    console.log("start");
}

function resetFall() {
    console.log("reset");
}
let y = 10;

function startFall() {

    function animate() {

        y += 1;

        document.getElementById("ball").style.top =
            y + "px";

        requestAnimationFrame(animate);
    }

    animate();
}

function resetFall() {

    y = 10;

    document.getElementById("ball").style.top =
        y + "px";
}