const STAGES=["保護工程","拆除工程","水電工程","泥作工程","木作工程","油漆工程","系統櫃工程","地板工程","設備安裝","清潔工程","驗收","完工","保固","其他"];
const KEY="junpin_pms_data_v1";
let db=JSON.parse(localStorage.getItem(KEY)||'{"projects":[],"reports":[],"tasks":[],"logo":""}');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const save=()=>{localStorage.setItem(KEY,JSON.stringify(db));renderAll()};
const today=()=>new Date().toISOString().slice(0,10);
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function empty(){return $("#emptyTpl").content.cloneNode(true)}
function go(page){$$(".page").forEach(x=>x.classList.toggle("active",x.id===page));$$("nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===page));$("#nav").classList.remove("open");scrollTo(0,0)}
$$("[data-page]").forEach(b=>b.onclick=()=>go(b.dataset.page));$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));$("#menuBtn").onclick=()=>$("#nav").classList.toggle("open");
function fillStages(){["projectStage","reportStage"].forEach(id=>{$("#"+id).innerHTML=STAGES.map(x=>`<option>${x}</option>`).join("")})}
function projectOptions(){const html='<option value="">請選擇案場</option>'+db.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");$("#reportProject").innerHTML=html;$("#taskProject").innerHTML='<option value="">不指定案場</option>'+db.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}
function projectCard(p){return `<article class="card"><span class="badge">${esc(p.status)}</span><h3>${esc(p.name)}</h3><div class="meta">${esc(p.stage)}<br>${esc(p.address||"尚未填寫地址")}<br>業主：${esc(p.owner||"-")}</div><div class="progress"><i style="width:${Number(p.progress)||0}%"></i></div><div class="meta">工程進度 ${Number(p.progress)||0}%</div><div class="card-actions"><button class="secondary" onclick="editProject('${p.id}')">修改</button><button class="danger" onclick="deleteProject('${p.id}')">刪除</button></div></article>`}
function reportItem(r){const p=db.projects.find(x=>x.id===r.projectId);return `<article class="list-item"><div class="list-main"><h3>${esc(p?.name||"未指定案場")}</h3><div class="meta">${esc(r.date)}｜${esc(r.stage)}｜${r.people||0} 人<br>${esc(r.work||"無施工內容")}${r.issue?`<br><b>異常：</b>${esc(r.issue)}`:""}</div></div><div class="card-actions"><button class="secondary" onclick="editReport('${r.id}')">查看／修改</button><button class="danger" onclick="deleteReport('${r.id}')">刪除</button></div></article>`}
function taskItem(t){const p=db.projects.find(x=>x.id===t.projectId);return `<article class="list-item"><div class="list-main"><h3 style="${t.done?'text-decoration:line-through;opacity:.55':''}">${esc(t.text)}</h3><div class="meta">${p?esc(p.name)+"｜":""}${esc(t.date||"未設定日期")}</div></div><div class="card-actions"><button class="secondary" onclick="toggleTask('${t.id}')">${t.done?"恢復":"完成"}</button><button class="danger" onclick="deleteTask('${t.id}')">刪除</button></div></article>`}
function renderAll(){
 projectOptions();
 $("#projectList").innerHTML=db.projects.length?db.projects.map(projectCard).join(""):""; if(!db.projects.length)$("#projectList").append(empty());
 $("#reportList").innerHTML=db.reports.length?[...db.reports].sort((a,b)=>b.date.localeCompare(a.date)).map(reportItem).join(""):""; if(!db.reports.length)$("#reportList").append(empty());
 $("#taskList").innerHTML=db.tasks.length?db.tasks.map(taskItem).join(""):""; if(!db.tasks.length)$("#taskList").append(empty());
 $("#recentProjects").innerHTML=db.projects.slice(-3).reverse().map(projectCard).join(""); if(!db.projects.length)$("#recentProjects").append(empty());
 $("#recentReports").innerHTML=[...db.reports].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(reportItem).join(""); if(!db.reports.length)$("#recentReports").append(empty());
 $("#statProjects").textContent=db.projects.filter(x=>x.status==="施工中").length;
 $("#statReports").textContent=db.reports.filter(x=>x.date===today()).length;
 $("#statTasks").textContent=db.tasks.filter(x=>!x.done).length;
 $("#statIssues").textContent=db.reports.filter(x=>x.issue?.trim()).length;
 if(db.logo){$("#brandLogo").src=db.logo;$("#brandLogo").style.display="block";$("#logoFallback").style.display="none"}
}
const pd=$("#projectDialog"), rd=$("#reportDialog");
$$("dialog .close").forEach(b=>b.onclick=()=>b.closest("dialog").close());
$("#newProjectBtn").onclick=()=>{ $("#projectForm").reset();$("#projectId").value="";$("#progress").value=0;$("#progressValue").textContent="0%";pd.showModal()};
$("#progress").oninput=e=>$("#progressValue").textContent=e.target.value+"%";
$("#projectForm").onsubmit=e=>{e.preventDefault();const id=$("#projectId").value||crypto.randomUUID();const p={id,name:$("#projectName").value.trim(),owner:$("#ownerName").value.trim(),phone:$("#ownerPhone").value.trim(),address:$("#projectAddress").value.trim(),stage:$("#projectStage").value,status:$("#projectStatus").value,start:$("#startDate").value,end:$("#endDate").value,designer:$("#designer").value.trim(),foreman:$("#foreman").value.trim(),progress:+$("#progress").value,note:$("#projectNote").value.trim()};const i=db.projects.findIndex(x=>x.id===id);i>=0?db.projects[i]=p:db.projects.push(p);pd.close();save()};
window.editProject=id=>{const p=db.projects.find(x=>x.id===id);if(!p)return;$("#projectId").value=p.id;$("#projectName").value=p.name;$("#ownerName").value=p.owner;$("#ownerPhone").value=p.phone;$("#projectAddress").value=p.address;$("#projectStage").value=p.stage;$("#projectStatus").value=p.status;$("#startDate").value=p.start;$("#endDate").value=p.end;$("#designer").value=p.designer;$("#foreman").value=p.foreman;$("#progress").value=p.progress;$("#progressValue").textContent=p.progress+"%";$("#projectNote").value=p.note;pd.showModal()};
window.deleteProject=id=>{if(confirm("確定刪除此工程？")){db.projects=db.projects.filter(x=>x.id!==id);save()}};
const sig={};
function setupCanvas(id){const c=$("#"+id),ctx=c.getContext("2d");function resize(){const r=c.getBoundingClientRect(),ratio=devicePixelRatio||1,old=c.toDataURL();c.width=r.width*ratio;c.height=r.height*ratio;ctx.scale(ratio,ratio);ctx.lineWidth=2;ctx.lineCap="round";if(old!=="data:,"){const im=new Image();im.onload=()=>ctx.drawImage(im,0,0,r.width,r.height);im.src=old}}let draw=false;const pos=e=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};c.onpointerdown=e=>{draw=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);c.setPointerCapture(e.pointerId)};c.onpointermove=e=>{if(!draw)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke()};c.onpointerup=()=>draw=false;sig[id]={c,ctx,resize};resize()}
function clearSig(id){const {c,ctx}=sig[id];ctx.clearRect(0,0,c.width,c.height)}
function loadSig(id,data){clearSig(id);if(!data)return;const {c,ctx}=sig[id],r=c.getBoundingClientRect(),im=new Image();im.onload=()=>ctx.drawImage(im,0,0,r.width,r.height);im.src=data}
$$("[data-clear-sig]").forEach(b=>b.onclick=()=>clearSig(b.dataset.clearSig));
$("#newReportBtn").onclick=()=>{if(!db.projects.length){alert("請先新增工程");go("projects");return}$("#reportForm").reset();$("#reportId").value="";$("#reportDate").value=today();clearSig("ownerSig");clearSig("companySig");rd.showModal()};
async function filesToData(files){return Promise.all([...files].slice(0,8).map(f=>new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(f)})))}
function getGps(enabled){return new Promise(res=>{if(!enabled||!navigator.geolocation)return res(null);navigator.geolocation.getCurrentPosition(p=>res({lat:p.coords.latitude,lng:p.coords.longitude}),()=>res(null),{enableHighAccuracy:true,timeout:8000})})}
$("#reportForm").onsubmit=async e=>{e.preventDefault();const id=$("#reportId").value||crypto.randomUUID();const old=db.reports.find(x=>x.id===id)||{};const photos=$("#reportPhotos").files.length?await filesToData($("#reportPhotos").files):(old.photos||[]);const gps=await getGps($("#reportGpsEnabled").checked);const r={id,projectId:$("#reportProject").value,date:$("#reportDate").value,time:$("#reportTime").value,stage:$("#reportStage").value,people:+$("#reportPeople").value,work:$("#reportWork").value.trim(),issue:$("#reportIssue").value.trim(),photos,gps:gps||old.gps||null,ownerSig:$("#ownerSig").toDataURL(),companySig:$("#companySig").toDataURL()};const i=db.reports.findIndex(x=>x.id===id);i>=0?db.reports[i]=r:db.reports.push(r);rd.close();save()};
window.editReport=id=>{const r=db.reports.find(x=>x.id===id);if(!r)return;$("#reportId").value=r.id;$("#reportProject").value=r.projectId;$("#reportDate").value=r.date;$("#reportTime").value=r.time;$("#reportStage").value=r.stage;$("#reportPeople").value=r.people;$("#reportWork").value=r.work;$("#reportIssue").value=r.issue;$("#reportGpsEnabled").checked=!!r.gps;loadSig("ownerSig",r.ownerSig);loadSig("companySig",r.companySig);rd.showModal()};
window.deleteReport=id=>{if(confirm("確定刪除此日誌？")){db.reports=db.reports.filter(x=>x.id!==id);save()}};
$("#printCurrentBtn").onclick=()=>window.print();
$("#taskForm").onsubmit=e=>{e.preventDefault();db.tasks.unshift({id:crypto.randomUUID(),text:$("#taskText").value.trim(),projectId:$("#taskProject").value,date:$("#taskDate").value,done:false});$("#taskForm").reset();save()};
window.toggleTask=id=>{const t=db.tasks.find(x=>x.id===id);if(t){t.done=!t.done;save()}};
window.deleteTask=id=>{db.tasks=db.tasks.filter(x=>x.id!==id);save()};
$("#logoUpload").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{db.logo=r.result;save()};r.readAsDataURL(f)};
$("#exportBtn").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));a.download=`均品PMS備份_${today()}.json`;a.click()};
$("#importInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();alert("匯入完成")}catch{alert("檔案格式錯誤")}};r.readAsText(f)};
$("#clearBtn").onclick=()=>{if(confirm("確定清除所有資料？此動作無法復原。")){db={projects:[],reports:[],tasks:[],logo:""};localStorage.removeItem(KEY);location.reload()}};
fillStages();setupCanvas("ownerSig");setupCanvas("companySig");renderAll();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");
