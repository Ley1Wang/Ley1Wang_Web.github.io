(() => {
  'use strict';
  const $=id=>document.getElementById(id),canvas=$('histogram'),ctx=canvas.getContext('2d');
  let lastRun=null;
  let observedWidth=0;
  function random(seed){let state=seed>>>0;return()=>{state=(state+0x6D2B79F5)|0;let t=Math.imul(state^(state>>>15),1|state);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};}
  const models={uniform:{mean:.5,variance:1/12,label:'Uniform [0, 1]'},exponential:{mean:1,variance:1,label:'Exponential, rate = 1'},bernoulli:{mean:.3,variance:.21,label:'Bernoulli, p = 0.3'}};
  function plot() {
    const w=Math.max(1,Math.round(canvas.getBoundingClientRect().width)),h=Math.max(275,Math.round(w*.62)),dpr=Math.min(2,devicePixelRatio||1);
    observedWidth=w;canvas.style.height=h+'px';if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);
    const left=w<450?43:65,right=w<450?12:25,top=35,bottom=62,pw=w-left-right,ph=h-top-bottom;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#fbfcf8';ctx.fillRect(0,0,w,h);ctx.font='12px Arial';ctx.fillStyle='#75836b';
    if(!lastRun){ctx.fillText('Enter valid inputs and run the simulation.',left,h/2);return;}
    const r=lastRun,model=models[r.type],se=Math.sqrt(model.variance/r.n),mn=Math.min(...r.means),mx=Math.max(...r.means);
    let min=Math.min(mn,model.mean-4*se),max=Math.max(mx,model.mean+4*se),bins=30;
    if(r.type==='bernoulli'&&r.n<=29){bins=r.n+1;min=-.5/r.n;max=1+.5/r.n;}
    else {min=Math.max(0,min);if(r.type!=='exponential')max=Math.min(1,max);}
    if(max-min<1e-9){min-=.01;max+=.01;}
    const width=(max-min)/bins,frequencies=Array(bins).fill(0);
    for(const value of r.means){const index=Math.max(0,Math.min(bins-1,Math.floor((value-min)/(max-min)*bins)));frequencies[index]++;}
    const normal=x=>Math.exp(-.5*((x-model.mean)/se)**2)/(se*Math.sqrt(2*Math.PI))*width;
    const overlay=$('normalOverlay').checked,peak=Math.max(...frequencies.map(v=>v/r.count),overlay?normal(model.mean):0)*1.15;
    const px=x=>left+(x-min)/(max-min)*pw,py=y=>top+ph-y/peak*ph;
    ctx.textAlign='right';
    for(let i=0;i<=4;i++){const value=peak*i/4,y=py(value);ctx.strokeStyle='#e4eadb';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();ctx.fillStyle='#73816a';ctx.fillText((value*100).toFixed(1)+'%',left-10,y+4);}
    ctx.fillStyle='#6d8b65';frequencies.forEach((count,i)=>{const x=px(min+i*width)+1,y=py(count/r.count);ctx.fillRect(x,y,Math.max(1,pw/bins-2),top+ph-y);});
    if(overlay){ctx.strokeStyle='#96805a';ctx.lineWidth=1.8;ctx.setLineDash([5,4]);ctx.beginPath();for(let i=0;i<=240;i++){const x=min+(max-min)*i/240;i?ctx.lineTo(px(x),py(normal(x))):ctx.moveTo(px(x),py(normal(x)));}ctx.stroke();ctx.setLineDash([]);}
    ctx.textAlign='center';ctx.fillStyle='#73816a';
    const ticks=w<450?3:5;for(let i=0;i<=ticks;i++){const value=min+(max-min)*i/ticks;ctx.fillText(value.toFixed(2),px(value),h-bottom+23);}
    ctx.fillText('Sample mean',left+pw/2,h-12);ctx.textAlign='left';ctx.fillText(w<450?'Share per bin':'Share of repeated samples per bin',left,18);
    $('cltChartNote').textContent=overlay?'The dashed curve is a normal reference using population μ and σ/√n, scaled by histogram bin width. It is not a fitted curve. Small or discrete samples can depart substantially from it.':'Bars show the fraction of repeated sample means in each bin. Histogram heights depend on the chosen bin width.';
  }
  function clearInvalid(message) {
    lastRun=null;$('cltError').textContent=message;$('cltDirty').textContent='';$('cltChartNote').textContent='';$('exportMeans').disabled=true;$('summary').textContent='No new simulation was run.';
    for(const id of ['expectedMean','expectedSE','observedMean','observedSE'])$(id).textContent='—';plot();
  }
  function simulate() {
    const n=Number($('sampleSize').value),count=Number($('samples').value),seed=Number($('seed').value),type=$('population').value;
    if(!$('sampleSize').value||!Number.isSafeInteger(n)||n<1||n>200){clearInvalid('Observations per sample must be a whole number from 1 to 200.');return;}
    if(!$('samples').value||!Number.isSafeInteger(count)||count<100||count>20000){clearInvalid('Repeated samples must be a whole number from 100 to 20,000.');return;}
    if(!$('seed').value||!Number.isSafeInteger(seed)||seed<0||seed>4294967295){clearInvalid('Use a whole-number seed from 0 to 4,294,967,295.');return;}
    if(!Object.hasOwn(models,type)){clearInvalid('Choose a supported population.');return;}
    const rng=random(seed),means=[];
    for(let i=0;i<count;i++){let sum=0;for(let j=0;j<n;j++){const u=rng();sum+=type==='uniform'?u:type==='exponential'?-Math.log1p(-u):(u<.3?1:0);}means.push(sum/n);}
    const mean=means.reduce((sum,v)=>sum+v,0)/count,sd=Math.sqrt(means.reduce((sum,v)=>sum+(v-mean)**2,0)/(count-1));
    lastRun={type,n,count,seed,means};$('cltError').textContent='';$('cltDirty').textContent='';$('exportMeans').disabled=false;
    const model=models[type];$('expectedMean').textContent=model.mean.toFixed(4);$('expectedSE').textContent=Math.sqrt(model.variance/n).toFixed(4);$('observedMean').textContent=mean.toFixed(4);$('observedSE').textContent=sd.toFixed(4);
    $('summary').textContent=`Last run: ${model.label} · n = ${n} · ${count.toLocaleString()} repeated samples · seed ${seed}. Standard error (observed): ${sd.toFixed(4)}.`;
    plot();
  }
  $('simulate').addEventListener('click',simulate);$('normalOverlay').addEventListener('change',plot);
  for(const id of ['population','sampleSize','samples','seed'])$(id).addEventListener('input',()=>{$('cltDirty').textContent='Parameters changed. Run again to update the plot and results.';$('exportMeans').disabled=true;});
  $('exportMeans').addEventListener('click',()=>{
    if(!lastRun)return;const r=lastRun,csv=['population,n,repetitions,seed,replicate,sample_mean',...r.means.map((m,i)=>[r.type,r.n,r.count,r.seed,i+1,m.toPrecision(12)].join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='sample-means-seed-'+r.seed+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  new ResizeObserver(()=>{if(Math.round(canvas.getBoundingClientRect().width)!==observedWidth)plot();}).observe(canvas.parentElement);
  simulate();
})();
