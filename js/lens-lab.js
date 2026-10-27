(() => {
  'use strict';
  const $=id=>document.getElementById(id),c=$('canvas'),ctx=c.getContext('2d');
  let observedWidth=0;
  function draw() {
    const w=Math.max(1,Math.round(c.getBoundingClientRect().width)),h=Math.max(260,Math.round(w*.62)),dpr=Math.min(2,devicePixelRatio||1);
    observedWidth=w;c.style.height=h+'px';if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);
    const distance=Number($('dist').value),height=Number($('height').value),f=Number($('focal').value);
    const atFocus=Math.abs(distance-f)<1e-9,di=atFocus?Infinity:f*distance/(distance-f),m=atFocus?NaN:-di/distance,hi=m*height;
    const bound=4*Math.max(distance,f),includeImage=Number.isFinite(di)&&Math.abs(di)<=bound;
    const xmin=Math.min(-distance*1.2,-2.3*f,includeImage&&di<0?di*1.15:0);
    const xmax=Math.max(2.3*f,includeImage&&di>0?di*1.15:0);
    const ymax=Math.max(height*1.4,f*.7,includeImage?Math.min(Math.abs(hi)*1.2,height*4):0);
    const pad=w<450?28:52,scale=Math.min((w-2*pad)/(xmax-xmin),(h-2*pad)/(2*ymax));
    const x0=pad+((w-2*pad)-(xmax-xmin)*scale)/2-xmin*scale,y0=h/2;
    const point=(x,y)=>[x0+x*scale,y0-y*scale];
    const left=(20-x0)/scale,right=(w-20-x0)/scale;
    const imageVisible=Number.isFinite(di)&&point(di,hi)[0]>=20&&point(di,hi)[0]<=w-20&&point(di,hi)[1]>=20&&point(di,hi)[1]<=h-20;
    const colors=['#426c50','#9a8155','#6a7d89'];
    function line(points,color,dashed=false){ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.setLineDash(dashed?[6,5]:[]);ctx.beginPath();points.forEach(([x,y],i)=>{const [px,py]=point(x,y);i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();ctx.setLineDash([]);}
    function arrow(x,h,color,label){const [px,py]=point(x,h),[,base]=point(x,0),sign=h>=0?-1:1;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,base);ctx.lineTo(px,py);ctx.stroke();ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-5,py-sign*10);ctx.lineTo(px+5,py-sign*10);ctx.closePath();ctx.fill();ctx.font='12px Arial';ctx.textAlign='center';ctx.fillText(label,px,py+(h>=0?-15:24));}
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#fbfcf8';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#c8d2bf';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(15,y0);ctx.lineTo(w-15,y0);ctx.stroke();
    ctx.fillStyle='#708366';ctx.font='12px Arial';ctx.textAlign='center';
    for(const k of [-2,-1,1,2]){const x=x0+k*f*scale;if(x<20||x>w-20)continue;ctx.beginPath();ctx.moveTo(x,y0-4);ctx.lineTo(x,y0+4);ctx.stroke();ctx.fillText(k<0?(k===-1?'−F':'−2F'):(k===1?'F':'2F'),x,y0+22);}
    const lensHeight=Math.min(h/2-30,Math.max(height*scale*1.4,includeImage?Math.abs(hi)*scale+20:90,90));ctx.strokeStyle='#71866a';ctx.fillStyle='#dae5d433';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x0,y0-lensHeight);ctx.bezierCurveTo(x0+13,y0-lensHeight/2,x0+13,y0+lensHeight/2,x0,y0+lensHeight);ctx.bezierCurveTo(x0-13,y0+lensHeight/2,x0-13,y0-lensHeight/2,x0,y0-lensHeight);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.save();ctx.beginPath();ctx.rect(15,15,w-30,h-30);ctx.clip();
    // Draw virtual extensions first so real incoming paths remain solid on top.
    if(di<0){const target=Math.max(left,di);line([[0,height],[target,height-height/f*target]],colors[0],true);line([[0,0],[target,-height/distance*target]],colors[1],true);if(!atFocus)line([[0,hi],[target,hi]],colors[2],true);}
    line([[-distance,height],[0,height],[right,height-height/f*right]],colors[0]);
    line([[-distance,height],[0,0],[right,-height/distance*right]],colors[1]);
    if(!atFocus){const intercept=-height*f/(distance-f);line([[-distance,height],[0,intercept],[right,intercept]],colors[2]);}
    arrow(-distance,height,'#6c6654','Object');
    if(imageVisible)arrow(di,hi,'#315e43',di>0?'Real image':'Virtual image');
    ctx.restore();
    ctx.font='11px Arial';ctx.textAlign='left';ctx.fillStyle='#7c8b70';ctx.fillText(w<500?'Auto-fit diagram · model units (u)':'Diagram automatically fits the main geometry · model units (u)',15,h-10);
    $('dText').textContent=distance+' u';$('hText').textContent=height+' u';$('fText').textContent=f+' u';
    $('imageD').textContent=atFocus?'∞':di.toFixed(1)+' u';$('mag').textContent=atFocus?'—':m.toFixed(2)+'×';$('type').textContent=atFocus?'At focus':di>0?'Real':'Virtual';
    $('lensRelation').textContent=atFocus?'dₒ = f':distance>f?'dₒ > f':'dₒ < f';
    $('imageNotes').textContent=atFocus?'The outgoing principal rays are parallel. There is no finite image plane, so magnification is not displayed.':(di>0?'The image is on the opposite side of the lens and is inverted.':'The image is on the object side and upright. Dashed backward extensions show where the outgoing rays appear to meet.')+(!imageVisible?' The image is outside the current drawing window; the numerical distance remains valid.':'');
  }
  for(const id of ['dist','height','focal'])$(id).addEventListener('input',draw);
  document.querySelectorAll('[data-lens-preset]').forEach(button=>button.addEventListener('click',()=>{
    $('focal').value='120';$('dist').value=({real:'240',virtual:'80',focus:'120'})[button.dataset.lensPreset];draw();
  }));
  new ResizeObserver(()=>{if(Math.round(c.getBoundingClientRect().width)!==observedWidth)draw();}).observe(c.parentElement);
  draw();
})();
