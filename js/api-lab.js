(() => {
  'use strict';
  const $=id=>document.getElementById(id),categories=['physics','statistics','cs','radar'];
  const fixtures=(window.PortfolioContent?.projects || []).filter(p=>!p.external&&p.id!=='portfolio').map(p=>({id:p.id,name:p.title,category:p.categories[0],active:true}));
  let created=[],lastSent=false;
  const messages={200:'OK',201:'Created',400:'Bad Request',405:'Method Not Allowed',429:'Demo Limit Reached'};
  function queryObject(params){const result=Object.create(null);for(const key of new Set(params.keys())){const values=params.getAll(key);result[key]=values.length===1?values[0]:values;}return result;}
  function request() {
    const method=$('method').value,path=$('endpoint').value,params=new URLSearchParams($('param').value.replace(/^\?/,''));
    let body,error='';
    if(method==='POST')try{body=JSON.parse($('body').value);}catch{error='Invalid JSON body. Use valid JSON with double-quoted property names.';}
    const value={simulated:true,method,path,query:queryObject(params),headers:method==='POST'?{'Content-Type':'application/json'}:{Accept:'application/json'}};
    if(method==='POST')value.body=error?'[invalid JSON]':body;
    return{method,path,params,body,error,value};
  }
  function preview() {
    const post=$('method').value==='POST';$('body').disabled=!post;$('bodyHelp').textContent=post?'POST /api/projects expects name, category, and an optional boolean active. List filters in the query string apply to GET only.':'GET requests do not send the JSON body shown here. Query filters are supported by /api/projects only.';
    $('requestPreview').textContent=JSON.stringify(request().value,null,2);
    $('requestState').textContent=lastSent?'Inputs may differ from the last response. Send again to update it.':'No network requests are made. Data live only in this page.';
  }
  function errorBody(code,message){return{simulated:true,error:{code,message}};}
  function respond() {
    const r=request();$('apiFeedback').textContent='';$('body').removeAttribute('aria-invalid');
    $('requestPreview').textContent=JSON.stringify(r.value,null,2);
    if(r.error){$('apiStatus').textContent='Not sent · invalid JSON';$('apiFeedback').textContent=r.error;$('body').setAttribute('aria-invalid','true');$('responseHeaders').textContent='No simulated route was called.';$('output').textContent=JSON.stringify(errorBody('INVALID_JSON',r.error),null,2);lastSent=true;$('requestState').textContent='Fix the body and send again. Nothing was stored.';return;}
    let status=200,result,headers={'Content-Type':'application/json; charset=utf-8','X-Demo-Mode':'browser-simulation'};
    if(r.method==='POST'&&r.path!=='/api/projects'){
      status=405;headers.Allow='GET';result=errorBody('METHOD_NOT_ALLOWED','This demo route supports GET only.');
    }else if(r.path==='/api/projects'&&r.method==='POST'){
      const b=r.body;
      if(!b||typeof b!=='object'||Array.isArray(b)||typeof b.name!=='string'||!b.name.trim()||b.name.trim().length>80||!categories.includes(b.category)||(b.active!==undefined&&typeof b.active!=='boolean')){
        status=400;result=errorBody('VALIDATION_ERROR','Use an object with a name (1–80 characters), a category from physics/statistics/cs/radar, and an optional boolean active.');
      }else if(created.length>=25){status=429;result=errorBody('DEMO_LIMIT','The page-memory demo supports 25 created records. Reset the demo to clear them.');}
      else{const item={id:'demo-'+(created.length+1),name:b.name.trim(),category:b.category,active:b.active??true};created.push(item);status=201;result={simulated:true,data:item};}
    }else if(r.path==='/api/projects'){
      const category=r.params.get('category'),rawLimit=r.params.get('limit'),limit=rawLimit===null?10:Number(rawLimit);
      if(r.params.getAll('category').length>1||r.params.getAll('limit').length>1||(category!==null&&!categories.includes(category))||(rawLimit!==null&&!/^\d+$/.test(rawLimit))||!Number.isSafeInteger(limit)||limit<1||limit>20){status=400;result=errorBody('INVALID_QUERY','Use category=physics/statistics/cs/radar and a whole-number limit from 1 to 20, each at most once.');}
      else{const rows=[...fixtures,...created].filter(item=>!category||item.category===category);result={simulated:true,data:rows.slice(0,limit),meta:{total:rows.length,returned:Math.min(rows.length,limit)}};}
    }else if(r.path==='/api/metrics'){
      const rows=[...fixtures,...created];result={simulated:true,projects:rows.length,createdThisSession:created.length,byCategory:Object.fromEntries(categories.map(category=>[category,rows.filter(item=>item.category===category).length]))};
    }else result={simulated:true,status:'ready',storage:'page memory',networkRequest:false};
    $('apiStatus').textContent=status+' '+messages[status];$('output').textContent=JSON.stringify(result,null,2);$('responseHeaders').textContent=JSON.stringify(headers,null,2);
    $('apiFeedback').textContent=status>=400?result.error.message:'';lastSent=true;$('requestState').textContent='Last response for the request shown above. Simulation only.';
  }
  ['method','endpoint','param','body'].forEach(id=>$(id).addEventListener('input',preview));
  $('send').addEventListener('click',respond);
  $('reset').addEventListener('click',()=>{created=[];lastSent=false;$('method').value='GET';$('endpoint').value='/api/projects';$('param').value='category=physics&limit=3';$('body').value=JSON.stringify({name:'Study notebook',category:'cs',active:true},null,2);$('apiStatus').textContent='Ready';$('output').textContent='Send a simulated request to inspect its response.';$('responseHeaders').textContent='Headers will appear after a valid request.';$('apiFeedback').textContent='';$('body').removeAttribute('aria-invalid');preview();});
  preview();
})();
