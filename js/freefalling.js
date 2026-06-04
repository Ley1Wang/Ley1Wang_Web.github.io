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

const images = {
    Mercury: "../images/mercury.png",
    Venus: "../images/venus.png",
    Earth: "../images/earth.png",
    Moon: "../images/moon.png",
    Mars: "../images/mars.png",
    Jupiter: "../images/jupiter.png",
    Saturn: "../images/saturn.png",
    Uranus: "../images/uranus.png",
    Neptune: "../images/neptune.png"
};

const planetSelect =
    document.getElementById("planet");

const ball =
    document.getElementById("ball");

const scene =
    document.querySelector(".scene");

const gravityInfo =
    document.getElementById("gravityInfo");

const SCALE = 4;

let animationId = null;
let startTime = 0;

planetSelect.addEventListener(
    "change",
    updatePlanet
);

function updatePlanet() {

    const planet =
        planetSelect.value;

    scene.style.backgroundImage =
        `url(${images[planet]})`;

    gravityInfo.innerText =
        `Gravity: ${planets[planet]} m/s²`;
}

updatePlanet();

function startFall() {

    cancelAnimationFrame(animationId);

    const planet =
        planetSelect.value;

    const g =
        planets[planet];

    startTime =
        performance.now();

    function animate(now) {

        const t =
            (now - startTime) / 1000;

        let y =
            0.5 * g * t * t * SCALE;

        const maxY = 300;

        if (y > maxY) {
            y = maxY;
        }

        ball.style.top =
            (10 + y) + "px";

        if (y < maxY) {
            animationId =
                requestAnimationFrame(
                    animate
                );
        }
    }

    animationId =
        requestAnimationFrame(
            animate
        );
}

function resetFall() {

    cancelAnimationFrame(animationId);

    ball.style.top = "10px";
}