(() => {
  'use strict';
  const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
  const names={bubble:'Bubble sort',selection:'Selection sort',insertion:'Insertion sort'};
  let original=[],view=[],iterator=null,comparisons=0,writes=0,focus=[],sorted=[],playing=false,timer=null,records=new Map();
  let observedWidth=0;
  function* operations(kind,input) {
    const a=[...input];let comp=0,write=0,done=[];
    const step=(active,note)=>({values:[...a],comparisons:comp,writes:write,focus:active,sorted:[...done],note});
    if(kind==='bubble') {
      for(let end=a.length-1;end>0;end--) {
        let changed=false;
        for(let j=0;j<end;j++) {
          comp++;yield step([j,j+1],'Compare adjacent values.');
          if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];write+=2;changed=true;yield step([j,j+1],'Swap: two array positions are written.');}
        }
        done.push(end);yield step([],'The largest remaining value is now in place.');
        if(!changed)break;
      }
    } else if(kind==='selection') {
      for(let i=0;i<a.length-1;i++) {
        let minimum=i;
        for(let j=i+1;j<a.length;j++){comp++;yield step([minimum,j],'Compare the current minimum with the next candidate.');if(a[j]<a[minimum])minimum=j;}
        if(minimum!==i){[a[i],a[minimum]]=[a[minimum],a[i]];write+=2;yield step([i,minimum],'Place the minimum: two array writes.');}
        done.push(i);yield step([],'One more position is settled.');
      }
    } else {
      done=[0];
      for(let i=1;i<a.length;i++) {
        const key=a[i];let j=i-1;
        while(j>=0){comp++;yield step([j,j+1],'Compare the saved value with the sorted prefix.');if(a[j]<=key)break;a[j+1]=a[j];write++;yield step([j,j+1],'Shift one value to the right: one array write.');j--;}
        if(j+1!==i){a[j+1]=key;write++;yield step([j+1],'Insert the saved value: one array write.');}
        done=Array.from({length:i+1},(_,k)=>k);yield step([],'The sorted prefix has grown.');
      }
    }
    done=a.map((_,i)=>i);yield step([],'All values are in ascending order.');
  }
  function draw() {
    const w=Math.max(1,Math.round(canvas.getBoundingClientRect().width)),h=Math.max(260,Math.round(w*.62)),dpr=Math.min(2,devicePixelRatio||1);
    observedWidth=w;canvas.style.height=h+'px';if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);
    const left=40,right=15,top=35,bottom=50,plotW=w-left-right,plotH=h-top-bottom;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#fbfcf8';ctx.fillRect(0,0,w,h);ctx.font='12px Arial';ctx.textAlign='right';
    for(let value=0;value<=100;value+=25){const y=top+plotH*(1-value/100);ctx.strokeStyle='#e5eadd';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();ctx.fillStyle='#7b896f';ctx.fillText(String(value),left-9,y+4);}
    ctx.textAlign='left';ctx.fillStyle='#68775e';ctx.fillText('Value',left,19);
    const width=plotW/view.length;
    view.forEach((value,i)=>{const barH=value/100*plotH;ctx.fillStyle=focus.includes(i)?'#2f6652':sorted.includes(i)?'#a5b59a':'#83947a';ctx.fillRect(left+i*width+1,top+plotH-barH,Math.max(1,width-2),barH);if(view.length<=16&&width>=20){ctx.textAlign='center';ctx.fillStyle='#4e6145';ctx.fillText(String(value),left+(i+.5)*width,top+plotH-barH-7);}});
    ctx.textAlign='center';ctx.fillStyle='#7b896f';for(let i=0;i<view.length;i++)if((view.length<=16&&width>=20)||i%Math.max(1,Math.ceil(view.length/(w<450?5:10)))===0||i===view.length-1)ctx.fillText(String(i+1),left+(i+.5)*width,h-29);ctx.fillText('Array position (1-based)',left+plotW/2,h-8);
  }
  function controls() {
    $('start').textContent=playing?'Pause':iterator?'Resume':'Start';
    $('step').disabled=playing;$('algo').disabled=!!iterator;$('size').disabled=!!iterator;
    $('comp').textContent=comparisons;$('swap').textContent=writes;
    $('sizeText').textContent=original.length;$('speedText').textContent=$('speed').value+' ms / step';
    $('sortInput').textContent=original.join(', ');$('sortValues').textContent=view.join(', ');
  }
  function stop() { clearTimeout(timer);timer=null;playing=false; }
  function reset(clearResults=false) {
    stop();iterator=null;view=[...original];comparisons=writes=0;focus=[];sorted=[];
    $('state').textContent='Ready';$('sortProgress').textContent='The same starting array is reused until you shuffle or change its size.';
    if(clearResults){records.clear();renderRecords();}controls();draw();
  }
  function shuffle() {original=Array.from({length:Number($('size').value)},()=>Math.floor(10+Math.random()*90));reset(true);}
  function renderRecords() {
    const body=$('sortRecords');body.replaceChildren();
    if(!records.size){const row=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.textContent='Complete a run to compare counts on this array.';row.append(td);body.append(row);return;}
    for(const [kind,result] of records){const row=document.createElement('tr');for(const value of [names[kind],result.comparisons,result.writes]){const td=document.createElement('td');td.textContent=String(value);row.append(td);}body.append(row);}
  }
  function advance() {
    if(!iterator){view=[...original];comparisons=writes=0;sorted=[];iterator=operations($('algo').value,original);}
    const next=iterator.next();
    if(next.done){stop();iterator=null;focus=[];sorted=view.map((_,i)=>i);$('state').textContent='Sorted';records.set($('algo').value,{comparisons,writes});renderRecords();controls();draw();return false;}
    ({values:view,comparisons,writes,focus,sorted}=next.value);$('sortProgress').textContent=next.value.note;controls();draw();return true;
  }
  function loop(){if(!playing)return;if(advance()&&playing)timer=setTimeout(loop,Number($('speed').value));}
  $('start').addEventListener('click',()=>{if(playing){stop();$('state').textContent='Paused';controls();return;}playing=true;$('state').textContent='Running';controls();loop();});
  $('step').addEventListener('click',()=>{if(advance()){$('state').textContent='Paused';controls();}});
  $('shuffle').addEventListener('click',shuffle);$('restartSort').addEventListener('click',()=>reset());
  $('size').addEventListener('input',shuffle);$('speed').addEventListener('input',controls);
  $('algo').addEventListener('change',()=>reset());
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){stop();$('state').textContent='Paused';controls();}});
  new ResizeObserver(()=>{if(Math.round(canvas.getBoundingClientRect().width)!==observedWidth)draw();}).observe(canvas.parentElement);
  addEventListener('pagehide',stop);shuffle();
})();
