let dataPoints = [];
const chart = new Chart(document.getElementById('myChart'), {
  type: 'scatter',
  data: { datasets: [
    { label: 'Observations', data: [], backgroundColor: '#416d50', pointRadius: 5, pointHoverRadius: 7 },
    { label: 'Least-squares fit', data: [], type: 'line', borderColor: '#9b8a5c', borderWidth: 2, fill: false, pointRadius: 0 },
  ] },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7, padding: 20, font: { size: 11 } } } },
    scales: {
      x: { type: 'linear', title: { display: true, text: 'Independent variable · x' }, grid: { color: '#edf1e7' } },
      y: { title: { display: true, text: 'Response variable · y' }, grid: { color: '#edf1e7' } },
    },
  },
});
function addData() {
  const x = document.getElementById('x'), y = document.getElementById('y');
  const error = document.getElementById('plotError');
  if (!x.value.trim() || !y.value.trim() || !Number.isFinite(Number(x.value)) || !Number.isFinite(Number(y.value))) {
    error.textContent = 'Enter a finite number for both x and y.'; return;
  }
  if (dataPoints.length >= 1000) { error.textContent = 'This small workspace supports up to 1,000 points.'; return; }
  dataPoints.push({ x: Number(x.value), y: Number(y.value) });
  error.textContent = ''; updateChart(); x.value = ''; y.value = ''; x.focus();
}
function resetData() {
  dataPoints = []; document.getElementById('plotError').textContent = ''; updateChart();
}
function loadSample() {
  dataPoints = [{ x: 1, y: 2 }, { x: 2, y: 3.2 }, { x: 3, y: 4.4 }, { x: 4, y: 4.8 }, { x: 5, y: 6.3 }];
  document.getElementById('plotError').textContent = ''; updateChart();
}
function linearFit() {
  const n = dataPoints.length, output = document.getElementById('fitResult');
  chart.data.datasets[1].data = [];
  if (n < 2) { output.textContent = 'Add at least two points with distinct x values to fit a line.'; return; }
  const meanX = dataPoints.reduce((sum, p) => sum + p.x, 0) / n;
  const meanY = dataPoints.reduce((sum, p) => sum + p.y, 0) / n;
  const sxx = dataPoints.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
  if (sxx <= 0 || !Number.isFinite(sxx)) { output.textContent = 'A finite slope needs at least two distinct x values.'; return; }
  const sxy = dataPoints.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
  const slope = sxy / sxx, intercept = meanY - slope * meanX;
  const residual = dataPoints.reduce((sum, p) => sum + (p.y - slope * p.x - intercept) ** 2, 0);
  const total = dataPoints.reduce((sum, p) => sum + (p.y - meanY) ** 2, 0);
  output.textContent = 'y = ' + slope.toFixed(3) + 'x ' + (intercept < 0 ? '− ' : '+ ') + Math.abs(intercept).toFixed(3) + ' · R² = ' + (total > 0 ? Math.max(0, 1 - residual / total).toFixed(3) : 'undefined for constant y');
  const min = Math.min(...dataPoints.map(p => p.x)), max = Math.max(...dataPoints.map(p => p.x));
  chart.data.datasets[1].data = [{ x: min, y: slope * min + intercept }, { x: max, y: slope * max + intercept }];
}
function updateChart() {
  chart.data.datasets[0].data = dataPoints;
  document.getElementById('count').textContent = dataPoints.length;
  linearFit(); chart.update();
}
document.querySelectorAll('#x, #y').forEach(input => input.addEventListener('keydown', event => { if (event.key === 'Enter') addData(); }));
loadSample();
