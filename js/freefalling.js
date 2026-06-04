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

const skies = {
    Mercury: "linear-gradient(to bottom,#b8b8b8,#6e6e6e)",
    Venus: "linear-gradient(to bottom,#f6d39a,#c9873c)",
    Earth: "linear-gradient(to bottom,#5aa8ff,#dff5ff)",
    Moon: "linear-gradient(to bottom,#0f172a,#334155)",
    Mars: "linear-gradient(to bottom,#ffb08a,#a3472d)",
    Jupiter: "linear-gradient(to bottom,#f7d8b0,#b37b52)",
    Saturn: "linear-gradient(to bottom,#f6e2b8,#d0b07a)",
    Uranus: "linear-gradient(to bottom,#8cecff,#d8ffff)",
    Neptune: "linear-gradient(to bottom,#1457a6,#7dc2ff)"
};

const ballColors = {
    Mercury: "radial-gradient(circle at 25% 25%,#e0e0e0,#808080)",
    Venus: "radial-gradient(circle at 25% 25%,#ffd28a,#c9873c)",
    Earth: "radial-gradient(circle at 25% 25%,#7fffd4,#10b981)",
    Moon: "radial-gradient(circle at 25% 25%,#ffffff,#999999)",
    Mars: "radial-gradient(circle at 25% 25%,#ff9a76,#b7410e)",
    Jupiter: "radial-gradient(circle at 25% 25%,#f4c28a,#b37b52)",
    Saturn: "radial-gradient(circle at 25% 25%,#f7e3b5,#c9a96b)",
    Uranus: "radial-gradient(circle at 25% 25%,#b8ffff,#66cccc)",
    Neptune: "radial-gradient(circle at 25% 25%,#8ab6ff,#1457a6)"
};
const grounds = {

    Mercury: "#6b7280",

    Venus: "#b9773b",

    Earth: "#2e8b57",

    Moon: "#8a8a8a",

    Mars: "#a3472d",

    Jupiter: "#c08a5b",

    Saturn: "#d6ba87",

    Uranus: "#7ad6e8",

    Neptune: "#2f5ea8"
};

const planetSelect =
    document.getElementById("planet");

const heightInput =
    document.getElementById("heightInput");

const ball =
    document.getElementById("ball");

const scene =
    document.querySelector(".scene");

const gravityInfo =
    document.getElementById("gravityInfo");

const timeInfo =
    document.getElementById("timeInfo");

const velocityInfo =
    document.getElementById("velocityInfo");

const planetName =
    document.getElementById("planetName");

const planetPreview =
    document.getElementById("planetPreview");

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

    planetName.innerText =
        planet;

    gravityInfo.innerText =
        `Gravity: ${planets[planet]} m/s²`;

    scene.style.background =
        skies[planet];

    planetPreview.src =
        images[planet];

    ball.style.background =
        ballColors[planet];
        
    document.getElementById("horizon").style.background =grounds[planet];
}

updatePlanet();

function startFall() {

    cancelAnimationFrame(animationId);

    const planet =
        planetSelect.value;

    const g =
        planets[planet];

    const height =
        Number(heightInput.value);

    const maxY =
        height * SCALE;

    startTime =
        performance.now();

    function animate(now) {

        const t =
            (now - startTime) / 1000;

        let y =
            0.5 * g * t * t * SCALE;

        let v =
            g * t;

        if (y >= maxY) {

            y = maxY;

            ball.style.top =
                (20 + y) + "px";

            timeInfo.innerText =
                `Time: ${t.toFixed(2)} s`;

            velocityInfo.innerText =
                `Velocity: ${v.toFixed(2)} m/s`;

            return;
        }

        ball.style.top =
            (20 + y) + "px";

        timeInfo.innerText =
            `Time: ${t.toFixed(2)} s`;

        velocityInfo.innerText =
            `Velocity: ${v.toFixed(2)} m/s`;

        animationId =
            requestAnimationFrame(
                animate
            );
    }

    animationId =
        requestAnimationFrame(
            animate
        );
}

function resetFall() {

    cancelAnimationFrame(animationId);

    ball.style.top =
        "20px";

    timeInfo.innerText =
        "Time: 0.00 s";

    velocityInfo.innerText =
        "Velocity: 0.00 m/s";
}