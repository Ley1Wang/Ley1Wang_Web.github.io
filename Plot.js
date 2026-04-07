let dataPoints = [];

const ctx = document.getElementById('myChart').getContext('2d');

let chart = new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Experiment Data',
            data: dataPoints,
            backgroundColor: 'blue'
        }, {
            label: 'Fit Line',
            data: [],
            type: 'line',
            borderColor: 'red',
            fill: false,
            pointRadius: 0,
        }]
    },
    optons: {
        scales: {
            x: { title: { display: true, text: 'X (time)' } },
            y: { title: { display: true, text: 'Y (distance)' } }
        }
    }
});

function addData() {
    let xVal = parseFloat(document.getElementById('x').value);
    let yVal = parseFloat(document.getElementById('y').value);

    if(isNaN(xVal) || isNaN(yVal)) return alert("Enter valid numbers");

    dataPoints.push({x: xVal, y: yVal});
    document.getElementById('count').innerText = dataPoints.length;

    updateChart();
    linearFit();
}

function resetData() {
    dataPoints = [];
    chart.data.datasets[0].data = [];
    chart.data.datasets[1].data = [];
    chart.update();
    document.getElementById('count').innerText = 0;
    document.getElementById('fitResult').innerText = "";
}

// 线性回归
function linearFit() {
    let n = dataPoints.length;
    if(n < 2) return;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    dataPoints.forEach(p => {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumXX += p.x * p.x;
    });

    let slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX);
    let intercept = (sumY - slope*sumX)/n;

    document.getElementById('fitResult').innerText =
        `y = ${slope.toFixed(3)} x + ${intercept.toFixed(3)}`;

    // 更新拟合线
    let xMin = Math.min(...dataPoints.map(p=>p.x));
    let xMax = Math.max(...dataPoints.map(p=>p.x));

    chart.data.datasets[1].data = [
        {x: xMin, y: slope*xMin + intercept},
        {x: xMax, y: slope*xMax + intercept}
    ];

    chart.update();
}

function updateChart() {
    chart.data.datasets[0].data = dataPoints;
    chart.update();
}