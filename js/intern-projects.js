const dataRoot="../projects/internship-2026/data/";
async function json(name){const response=await fetch(dataRoot+name);if(!response.ok)throw new Error("Unable to load data");return response.json()}
async function loadBaidu(){const body=document.querySelector("#hotRows");try{const rows=await json("baidu_hot.json");body.innerHTML=rows.slice(1).map(r=>`<tr><td>${r[0]+1}</td><td><a href="${r[2]}" target="_blank" rel="noopener">${r[1]}</a></td><td>${r[3]||"—"}</td></tr>`).join("")}catch(e){body.innerHTML='<tr><td colspan="3">Archived data could not be loaded.</td></tr>'}}
async function loadMovies(){const body=document.querySelector("#movieRows");try{const movies=await json("douban_top100.json");body.innerHTML=movies.map(m=>`<tr><td>${m.rank}</td><td><a href="${m.url}" target="_blank" rel="noopener">${m.title}</a></td><td>${m.year}</td><td>${m.rating}</td><td>${m.category}</td></tr>`).join("")}catch(e){body.innerHTML='<tr><td colspan="5">Archived data could not be loaded.</td></tr>'}}
async function loadDashboard(){try{const movies=await json("douban_top100.json"),ratings={},years={};movies.forEach(m=>{ratings[m.rating]=(ratings[m.rating]||0)+1;years[m.year]=(years[m.year]||0)+1});document.querySelector("#movieCount").textContent=movies.length;document.querySelector("#averageRating").textContent=(movies.reduce((a,m)=>a+m.rating,0)/movies.length).toFixed(2);document.querySelector("#yearCount").textContent=Object.keys(years).length;const max=Math.max(...Object.values(ratings));document.querySelector("#ratingChart").innerHTML=Object.entries(ratings).sort((a,b)=>a[0]-b[0]).map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join("")}catch(e){document.querySelector("#ratingChart").textContent=e.message}}
function startSql(){
 const rows=[[1001,"Tom",175.5],[1002,"Jerry",168],[1003,"Alice",162.8]],body=document.querySelector("#studentRows"),insert=document.querySelector("#insertStudent");
 const feedback=document.createElement('p');feedback.className='field-feedback';feedback.setAttribute('role','status');insert.after(feedback);
 const render=()=>{
  body.replaceChildren();
  rows.forEach((row,index)=>{
   const tr=document.createElement('tr');
   row.forEach(value=>{const td=document.createElement('td');td.textContent=String(value);tr.append(td)});
   const td=document.createElement('td'),button=document.createElement('button');button.className='button secondary';button.dataset.delete=String(index);button.textContent='Delete';button.setAttribute('aria-label','Delete '+row[1]);td.append(button);tr.append(td);body.append(tr);
  });
 };
 insert.addEventListener('click',()=>{
  const idInput=document.querySelector('#sid'),nameInput=document.querySelector('#studentName'),heightInput=document.querySelector('#height');
  const sid=Number(idInput.value),name=nameInput.value.trim(),height=Number(heightInput.value);
  if(!idInput.value||!Number.isSafeInteger(sid)||sid<1||!name||name.length>80||!heightInput.value||!Number.isFinite(height)||height<=0||height>300){feedback.textContent='Use a positive whole-number ID, a name (up to 80 characters), and height between 0 and 300 cm.';return;}
  if(rows.some(row=>row[0]===sid)){feedback.textContent='That ID is already in the table. Choose a new one.';return;}
  if(rows.length>=200){feedback.textContent='This small demonstration supports up to 200 rows.';return;}
  rows.push([sid,name,height]);feedback.textContent='Row added. Demo rows reset when this page reloads.';render();
 });
 body.addEventListener('click',event=>{const button=event.target.closest('button[data-delete]');if(button){rows.splice(Number(button.dataset.delete),1);render();feedback.textContent='Row removed.';}});
 render();
}
function startApi(){document.querySelector("#sendGet").addEventListener("click",()=>document.querySelector("#apiOutput").textContent=JSON.stringify({method:"GET",query:{value:document.querySelector("#getValue").value},status:200},null,2));document.querySelector("#sendPost").addEventListener("click",()=>document.querySelector("#apiOutput").textContent=JSON.stringify({method:"POST",query:{param:document.querySelector("#postParam").value},body:{value:document.querySelector("#postBody").value},status:200},null,2))}
