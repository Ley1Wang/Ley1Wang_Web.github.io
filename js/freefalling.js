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
    Mercury: "linear-gradient(to bottom,#bfc3c7,#71767b)",
    Venus: "linear-gradient(to bottom,#f7d89a,#cb8a3d)",
    Earth: "linear-gradient(to bottom,#5aa8ff,#dff5ff)",
    Moon: "linear-gradient(to bottom,#0f172a,#475569)",
    Mars: "linear-gradient(to bottom,#ffb08a,#b55337)",
    Jupiter: "linear-gradient(to bottom,#f8d9b0,#c48b62)",
    Saturn: "linear-gradient(to bottom,#f5e5c3,#d4b27b)",
    Uranus: "linear-gradient(to bottom,#9df4ff,#dfffff)",
    Neptune: "linear-gradient(to bottom,#1f66c2,#8fd1ff)"
};

const grounds = {
    Mercury: "#7a7f84",
    Venus: "#ba7d3e",
    Earth: "#3b7d4a",
    Moon: "#9a9a9a",
    Mars: "#a3472d",
    Jupiter: "#c08a5b",
    Saturn: "#d7bb86",
    Uranus: "#83dce8",
    Neptune: "#356bc2"
};

const horizonLines = {
    Mercury: "#d1d5db",
    Venus: "#ffe0a3",
    Earth: "#ffffff",
    Moon: "#f3f4f6",
    Mars: "#ffd1b8",
    Jupiter: "#ffe4c4",
    Saturn: "#fff3d4",
    Uranus: "#e0ffff",
    Neptune: "#b7d8ff"
};

const ballColors = {
    Mercury: "radial-gradient(circle at 25% 25%,#f3f4f6,#9ca3af,#6b7280)",
    Venus: "radial-gradient(circle at 25% 25%,#ffe2b8,#d89a54,#b9773b)",
    Earth: "radial-gradient(circle at 25% 25%,#dfffff,#34d399,#059669)",
    Moon: "radial-gradient(circle at 25% 25%,#ffffff,#cfcfcf,#8a8a8a)",
    Mars: "radial-gradient(circle at 25% 25%,#ffc0a5,#d46a44,#a3472d)",
    Jupiter: "radial-gradient(circle at 25% 25%,#ffe0b8,#d9a476,#b37b52)",
    Saturn: "radial-gradient(circle at 25% 25%,#fff0d4,#e1c58d,#c9a96b)",
    Uranus: "radial-gradient(circle at 25% 25%,#e8ffff,#9be8ef,#66c6d1)",
    Neptune: "radial-gradient(circle at 25% 25%,#b8d5ff,#4d86d8,#1457a6)"
};

const planetSelect = document.getElementById("planet");
const heightInput = document.getElementById("heightInput");

const ball = document.getElementById("ball");
const scene = document.querySelector(".scene");

const gravityInfo = document.getElementById("gravityInfo");
const timeInfo = document.getElementById("timeInfo");
const velocityInfo = document.getElementById("velocityInfo");
const planetName = document.getElementById("planetName");

const planetPreview =
    document.getElementById("planetPreview");

const horizon =
    document.getElementById("horizon");

const SCALE = 2;

let animationId = null;
let startTime = 0;

let velocityChart;
let distanceChart;

let timeData = [];
let velocityData = [];
let distanceData = [];

heightInput.addEventListener(
    "input",
    updatePlanet
);
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

    horizon.style.background =
        `linear-gradient(
            to bottom,
            ${grounds[planet]},
            rgba(0,0,0,0.25)
        )`;

    horizon.style.borderTop =
        `4px solid ${horizonLines[planet]}`;
}

updatePlanet();
const g =
    planets[planet];

const h =
    Number(heightInput.value);

const theory =
    Math.sqrt(
        2 * h / g
    );

document
    .getElementById("theoryTime")
    .innerText =
    `Expected Time: ${theory.toFixed(2)} s`;


velocityChart = new Chart(
    document
        .getElementById("velocityChart")
        .getContext("2d"),
{
    type: "line",

    data: {
        labels: [],
        datasets: [{
            label: "Velocity (m/s)",
            data: [],
            borderColor: "#10b981",
            backgroundColor:
                "rgba(16,185,129,0.2)",
            fill: true,
            borderWidth: 3,
            tension: 0.3
        }]
    },

    options: {
        animation: false,
        responsive: true
    }
});

distanceChart = new Chart(
    document
        .getElementById("distanceChart")
        .getContext("2d"),
{
    type: "line",

    data: {
        labels: [],
        datasets: [{
            label: "Distance (m)",
            data: [],
            borderColor: "#3b82f6",
            backgroundColor:
                "rgba(59,130,246,0.2)",
            fill: true,
            borderWidth: 3,
            tension: 0.3
        }]
    },

    options: {
        animation: false,
        responsive: true
    }
});

function startFall() {

    cancelAnimationFrame(
        animationId
    );

    timeData = [];
    velocityData = [];
    distanceData = [];

    velocityChart.data.labels = [];
    velocityChart.data.datasets[0].data = [];

    distanceChart.data.labels = [];
    distanceChart.data.datasets[0].data = [];

    velocityChart.update();
    distanceChart.update();

    const planet =
        planetSelect.value;

    const g =
        planets[planet];

    const height =
        Number(heightInput.value);

    const maxY =
        Math.min(
            height * SCALE,
            scene.clientHeight - 120
        );

    startTime =
        performance.now();

    function animate(now) {

        const t =
            (now - startTime) / 1000;

        let y =
            0.5 * g * t * t * SCALE;

        let v =
            g * t;

        let d =
            0.5 * g * t * t;

        if (y >= maxY) {

            y = maxY;

            ball.style.top =
                (20 + y) + "px";

            return;
        }

        ball.style.top =
            (20 + y) + "px";

        timeInfo.innerText =
            `Time: ${t.toFixed(2)} s`;

        velocityInfo.innerText =
            `Velocity: ${v.toFixed(2)} m/s`;

        timeData.push(t);
        velocityData.push(v);
        distanceData.push(d);

        velocityChart.data.labels =
            timeData;

        velocityChart.data.datasets[0].data =
            velocityData;

        distanceChart.data.labels =
            timeData;

        distanceChart.data.datasets[0].data =
            distanceData;

        if (timeData.length % 5 === 0) {

            velocityChart.update();

            distanceChart.update();
        }

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

    cancelAnimationFrame(
        animationId
    );

    ball.style.top =
        "20px";

    timeInfo.innerText =
        "Time: 0.00 s";

    velocityInfo.innerText =
        "Velocity: 0.00 m/s";

    timeData = [];
    velocityData = [];
    distanceData = [];

    velocityChart.data.labels = [];
    velocityChart.data.datasets[0].data = [];

    distanceChart.data.labels = [];
    distanceChart.data.datasets[0].data = [];

    velocityChart.update();
    distanceChart.update();
}