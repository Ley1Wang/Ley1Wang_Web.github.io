const canvas=document.getElementById("canvas"),context=canvas.getContext("2d"),prediction=document.getElementById("prediction"),statusText=document.getElementById("status"),probabilityList=document.getElementById("probabilities");
let drawing=false;
const isLocal=["127.0.0.1","localhost"].includes(window.location.hostname);
const predictionEndpoint=isLocal&&window.location.port==="5000"?"/predict":"http://127.0.0.1:5000/predict";
function clearCanvas(){context.fillStyle="black";context.fillRect(0,0,canvas.width,canvas.height);prediction.textContent="—";statusText.textContent="Draw a digit to begin.";probabilityList.innerHTML=""}
function pointerPosition(event){const rect=canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height}}
canvas.addEventListener("pointerdown",event=>{drawing=true;const point=pointerPosition(event);context.beginPath();context.moveTo(point.x,point.y);canvas.setPointerCapture(event.pointerId)});
canvas.addEventListener("pointermove",event=>{if(!drawing)return;const point=pointerPosition(event);context.strokeStyle="white";context.lineWidth=20;context.lineCap="round";context.lineJoin="round";context.lineTo(point.x,point.y);context.stroke()});
canvas.addEventListener("pointerup",()=>drawing=false);canvas.addEventListener("pointercancel",()=>drawing=false);
function renderProbabilities(values){probabilityList.innerHTML=values.map((value,digit)=>{const percent=value*100;return `<div class="probability"><b>${digit}</b><div class="track"><div class="fill" style="width:${percent}%"></div></div><span>${percent.toFixed(1)}%</span></div>`}).join("")}
document.getElementById("clearButton").addEventListener("click",clearCanvas);
document.getElementById("predictButton").addEventListener("click",async()=>{
 const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
 if(!pixels.some((value,index)=>index%4!==3&&value>20)){statusText.textContent="Draw one centered digit before recognizing.";return;}
 const button=document.getElementById("predictButton"),clear=document.getElementById("clearButton");
 button.disabled=true;clear.disabled=true;statusText.textContent="Contacting the local model…";
 try{
  const response=await fetch(predictionEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:canvas.toDataURL("image/png")}),signal:AbortSignal.timeout(7000)});
  const data=await response.json().catch(()=>{throw new Error("The local server did not return a prediction. Check that the digit-model service is running on port 5000.")});
  if(!response.ok)throw new Error(data.error||"Prediction failed");
  if(!Array.isArray(data.probabilities)||data.probabilities.length!==10||!Number.isFinite(data.confidence))throw new Error("The model response was incomplete.");
  prediction.textContent=String(data.prediction);statusText.textContent=`Confidence: ${(data.confidence*100).toFixed(1)}%`;renderProbabilities(data.probabilities);
 }catch(error){
  statusText.textContent=error instanceof TypeError||error.name==="TimeoutError"?"Could not reach the local model. Start server.py on port 5000, or open the local model interface below.":error.message;
 }finally{button.disabled=false;clear.disabled=false;}
});
clearCanvas();
