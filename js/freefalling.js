(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const planets = { Mercury:3.7, Venus:8.87, Earth:9.81, Moon:1.62, Mars:3.71, Jupiter:24.79, Saturn:10.44, Uranus:8.69, Neptune:11.15 };
  const input = $('heightInput'), planet = $('planet'), ball = $('ball'), scene = document.querySelector('.scene');
  let trial = null, frame = null, lastWall = 0, lastChart = 0, points = [], nextSample = 0;
  const charts = ['velocityChart','distanceChart'].map((id,index) => new Chart($(id), {
    type:'line', data:{ datasets:[{label:index ? 'Fallen distance (m)' : 'Downward velocity (m/s)',data:[],borderColor:index ? '#827750' : '#426c50',borderWidth:2,pointRadius:0,tension:0,fill:false}] },
    options:{ responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}},scales:{
      x:{type:'linear',min:0,title:{display:true,text:'Simulation time (s)'},grid:{color:'#edf0e8'},ticks:{maxTicksLimit:5}},
      y:{min:0,title:{display:true,text:index ? 'Fallen distance (m)' : 'Velocity (m/s)'},grid:{color:'#edf0e8'},ticks:{maxTicksLimit:5}},
    } },
  }));
  function parameters() {
    const h = Number(input.value), g = planets[planet.value];
    return input.value.trim() && Number.isFinite(h) && h >= .1 && h <= 10000 && g ? {h,g,planet:planet.value,duration:Math.sqrt(2*h/g)} : null;
  }
  const at = (t, model) => ({ t:Math.min(model.duration,Math.max(0,t)), d:Math.min(model.h,.5*model.g*Math.min(model.duration,Math.max(0,t))**2) });
  function setStatus(text) { $('fallState').textContent=text; }
  function renderBall(d,h) {
    const release=20,ground=$('horizon').offsetTop;
    const travel=Math.max(0,ground-ball.offsetHeight-release);
    ball.style.top=(release+travel*Math.min(1,Math.max(0,d/h)))+'px';
  }
  function render(force=false) {
    const p=trial || parameters();
    if(!p)return;
    const time=trial?.t || 0, sample=at(time,p);
    $('timeInfo').textContent='Time: '+sample.t.toFixed(2)+' s';
    $('velocityInfo').textContent='Velocity: '+(p.g*sample.t).toFixed(2)+' m/s ↓';
    $('fallenInfo').textContent='Fallen: '+sample.d.toFixed(2)+' m';
    $('remainingInfo').textContent='Remaining: '+Math.max(0,p.h-sample.d).toFixed(2)+' m';
    $('fallScaleLabel').textContent=p.h.toLocaleString()+' m fallen';
    renderBall(sample.d,p.h);
    if(force || performance.now()-lastChart>120) {
      charts[0].data.datasets[0].data=points.map(point=>({x:point.t,y:p.g*point.t}));
      charts[1].data.datasets[0].data=points.map(point=>({x:point.t,y:point.d}));
      charts.forEach(chart=>chart.update('none'));lastChart=performance.now();
    }
  }
  function lock(locked) {
    input.disabled=planet.disabled=locked;
    $('startFallButton').disabled=locked;
    $('pauseFallButton').disabled=!locked;
    $('exportFallButton').disabled=!points.length;
  }
  function recordUntil(time) {
    while(nextSample <= time+1e-9 && nextSample <= trial.duration+1e-9) {
      points.push(at(nextSample,trial));nextSample=Math.round((nextSample+.1)*1e9)/1e9;
    }
    if(time>=trial.duration && Math.abs((points.at(-1)?.t ?? -1)-trial.duration)>1e-8)points.push(at(trial.duration,trial));
    $('exportFallButton').disabled=!points.length;
  }
  function advance(now) {
    if(!trial?.running)return;
    trial.t=Math.min(trial.duration,trial.t+Math.max(0,now-lastWall)/1000*trial.speed);lastWall=now;
    recordUntil(trial.t);
    if(trial.t>=trial.duration) {
      trial.running=false;trial.finished=true;setStatus('Landed');
      $('pauseFallButton').textContent='Pause';lock(false);$('pauseFallButton').disabled=true;
    }
    render(!trial.running);
  }
  function tick(now) {
    frame=null;advance(now);
    if(trial?.running)frame=requestAnimationFrame(tick);
  }
  function start() {
    const p=parameters();
    if(!p) { $('fallError').textContent='Enter a height between 0.1 and 10,000 metres.';input.setAttribute('aria-invalid','true');return; }
    cancelAnimationFrame(frame);$('fallError').textContent='';input.removeAttribute('aria-invalid');
    trial={...p,t:0,speed:Number($('fallSpeed').value),running:true,finished:false};
    points=[];nextSample=0;lastWall=performance.now();recordUntil(0);lock(true);
    $('pauseFallButton').textContent='Pause';setStatus('Running');render(true);frame=requestAnimationFrame(tick);
  }
  function pause() {
    if(!trial || trial.finished)return;
    if(trial.running) {
      advance(performance.now());cancelAnimationFrame(frame);
      if(trial.finished)return;
      trial.running=false;$('pauseFallButton').textContent='Resume';setStatus('Paused');render(true);
    } else {
      trial.running=true;lastWall=performance.now();$('pauseFallButton').textContent='Pause';setStatus('Running');frame=requestAnimationFrame(tick);
    }
  }
  function reset() {
    cancelAnimationFrame(frame);trial=null;points=[];nextSample=0;lock(false);
    $('pauseFallButton').disabled=true;$('pauseFallButton').textContent='Pause';setStatus('Ready');
    charts.forEach(chart=>{chart.data.datasets[0].data=[];chart.update('none');});
    render(true);
  }
  function updateParameters() {
    reset();
    const p=parameters(), name=planet.value;
    $('planetName').textContent=name;
    $('planetPreview').src='../images/'+name.toLowerCase()+'.png';$('planetPreview').alt=name+' illustration';
    $('gravityInfo').textContent='Gravity: '+planets[name]+' m/s²';
    $('theoryTime').textContent='Expected time: '+(p ? p.duration.toFixed(2)+' s' : '—');
    $('impactInfo').textContent='Impact speed: '+(p ? Math.sqrt(2*p.g*p.h).toFixed(2)+' m/s' : '—');
    $('fallError').textContent=p ? '' : 'Enter a height between 0.1 and 10,000 metres.';
    if(!p){$('timeInfo').textContent='Time: —';$('velocityInfo').textContent='Velocity: —';$('fallenInfo').textContent='Fallen: —';$('remainingInfo').textContent='Remaining: —';$('fallScaleLabel').textContent='Height not set';ball.style.top='20px';}
    if(p)input.removeAttribute('aria-invalid');else input.setAttribute('aria-invalid','true');
    charts.forEach((chart,i)=>{chart.options.scales.x.max=p?.duration || 1;chart.options.scales.y.max=p ? (i ? p.h : p.g*p.duration) : 1;chart.update('none');});
  }
  $('startFallButton').addEventListener('click',start);
  $('pauseFallButton').addEventListener('click',pause);
  $('resetFallButton').addEventListener('click',updateParameters);
  planet.addEventListener('change',updateParameters);input.addEventListener('input',updateParameters);
  $('fallSpeed').addEventListener('change',()=>{
    if(trial?.running)advance(performance.now());
    if(trial)trial.speed=Number($('fallSpeed').value);
  });
  $('exportFallButton').addEventListener('click',()=>{
    if(!trial || !points.length)return;
    if(trial.running)advance(performance.now());
    const csv=['planet,height_m,gravity_m_s2,time_s,fallen_m,remaining_m,downward_velocity_m_s',...points.map(p=>[trial.planet,trial.h,trial.g,p.t.toFixed(6),p.d.toFixed(6),Math.max(0,trial.h-p.d).toFixed(6),(trial.g*p.t).toFixed(6)].join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');
    link.href=url;link.download='freefall-'+trial.planet.toLowerCase()+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden && trial?.running){pause();if(!trial.finished)setStatus('Paused · tab hidden');}});
  addEventListener('pagehide',()=>cancelAnimationFrame(frame));
  new ResizeObserver(()=>render()).observe(scene);
  updateParameters();
})();
