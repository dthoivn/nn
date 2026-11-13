const KEY="smartclass_quick_teacher_v1";
let db={classes:[{id:"class_default",name:"Lớp học của tôi"}],activeClassId:"class_default",students:[],grades:[],behaviors:[]};
let selectedType="Khen",selectedScore=null;
const $=id=>document.getElementById(id),today=()=>new Date().toISOString().slice(0,10),uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function ensureSchema(){
  if(!Array.isArray(db.classes)||!db.classes.length){
    const oldName=db.className||"Lớp học của tôi";
    db.classes=[{id:"class_default",name:oldName}];
  }
  db.classes=db.classes.map(c=>({id:c.id||uid(),name:c.name||"Lớp chưa đặt tên"}));
  if(!db.activeClassId||!db.classes.some(c=>c.id===db.activeClassId))db.activeClassId=db.classes[0].id;
  db.students=Array.isArray(db.students)?db.students:[];
  db.grades=Array.isArray(db.grades)?db.grades:[];
  db.behaviors=Array.isArray(db.behaviors)?db.behaviors:[];
  // Migrate all existing students and records into the first class.
  db.students.forEach(s=>{if(!s.classId)s.classId=db.classes[0].id});
}
function currentClass(){return db.classes.find(c=>c.id===db.activeClassId)||db.classes[0]}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(db));$("saveStatus").textContent="● Đã lưu";if(window.smartClassCloudSave)window.smartClassCloudSave(db)}catch(e){$("saveStatus").textContent="! Lỗi lưu";toast("Không lưu được. Hãy xuất TXT.")}renderAll()}
function toast(t){const el=$("toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1900)}
function load(){try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved)db=saved}catch(e){}ensureSchema();$("classLabel").textContent=currentClass().name;renderAll()}
window.smartClassApplyCloudData=function(remote){if(!remote||typeof remote!=="object")return;db=remote;ensureSchema();try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}$("saveStatus").textContent="● Đã đồng bộ";renderAll()};
window.smartClassGetLocalData=function(){return db};
function nameOf(id){return db.students.find(s=>s.id===id)?.name||"Đã xóa học sinh"}
function initials(n){return (n||"?").trim().split(/\s+/).slice(-2).map(x=>x[0]).join("").toUpperCase()}
function switchScreen(screen){document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id==="screen-"+screen));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.screen===screen));window.scrollTo({top:0,behavior:"smooth"})}
document.querySelector(".bottom-nav").addEventListener("click",e=>{let b=e.target.closest("[data-screen]");if(b)switchScreen(b.dataset.screen)});
function classStudents(){return db.students.filter(s=>s.classId===db.activeClassId)}
function fillSelects(){
  const students=classStudents();
  let opts=students.map(s=>`<option value="${s.id}">${esc(s.code)} · ${esc(s.name)}</option>`).join("")||'<option value="">Lớp này chưa có học sinh</option>';
  $("behaviorStudent").innerHTML=$("gradeStudent").innerHTML=opts;
  $("classFilter").innerHTML='<option value="all">Tất cả lớp</option>'+db.classes.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");
  $("classFilter").value=db.activeClassId;
  $("classLabel").textContent=currentClass().name;
}
function renderAll(){fillSelects();renderStudents();renderBehaviorFeed();renderGradeFeed();renderClassList();$("behaviorTodayCount").textContent=db.behaviors.filter(x=>x.date===today()).length+" hôm nay";$("gradeTodayCount").textContent=db.grades.filter(x=>x.date===today()).length+" điểm hôm nay"}
function renderStudents(){
  let q=($("studentSearch").value||"").toLowerCase(),filter=$("classFilter").value||db.activeClassId;
  let a=db.students.filter(s=>(filter==="all"||s.classId===filter)&&(s.name+" "+s.code).toLowerCase().includes(q));
  $("studentCount").textContent=a.length+" học sinh";
  $("studentList").innerHTML=a.map(s=>{let g=db.grades.filter(x=>x.studentId===s.id);let cn=db.classes.find(c=>c.id===s.classId)?.name||"Chưa phân lớp";return `<div class="student-row"><div class="student-initial">${esc(initials(s.name))}</div><div class="student-info"><b>${esc(s.name)}</b><small>Mã: ${esc(s.code||"—")} · ${esc(cn)}</small></div><div class="student-metrics"><b>${g.length?(g.reduce((a,x)=>a+Number(x.score),0)/g.length).toFixed(1):"—"}</b>ĐTB</div><button class="delete-btn" aria-label="Chuyển lớp" title="Chuyển lớp" onclick="moveStudent('${s.id}')">⇄</button><button class="delete-btn" aria-label="Xóa học sinh" onclick="removeStudent('${s.id}')">⋯</button></div>`}).join("")||'<div class="feed-item"><div class="feed-main"><b>Chưa có học sinh</b><small>Chọn lớp hoặc nhấn + Thêm để tạo hồ sơ.</small></div></div>';
}
function renderBehaviorFeed(){let arr=db.behaviors.slice(0,12);$("behaviorFeed").innerHTML=arr.map(x=>{let cls=x.type==="Khen"?"":x.type==="Nhắc"?"remind":"negative";return `<div class="feed-item"><div class="feed-mark ${cls}">${x.type==="Khen"?"✓":x.type==="Nhắc"?"!":"×"}</div><div class="feed-main"><b>${esc(nameOf(x.studentId))}</b><small>${esc(x.type)} · ${esc(x.note||"Đã ghi nhận")} · ${esc(x.time||"")}</small></div><button class="delete-btn" onclick="removeRecord('behaviors','${x.id}')">×</button></div>`}).join("")||'<div class="feed-item"><div class="feed-main"><b>Chưa có ghi nhận</b><small>Chọn học sinh và chạm một nút nề nếp để nhập nhanh.</small></div></div>'}
function renderGradeFeed(){let arr=db.grades.slice(0,12);$("gradeFeed").innerHTML=arr.map(x=>`<div class="feed-item"><div class="feed-mark" style="background:#edf1ff;color:#3f63dc">▤</div><div class="feed-main"><b>${esc(nameOf(x.studentId))}</b><small>${esc(x.subject)} · ${esc(x.kind)} · ${esc(x.time||"")}</small></div><strong class="feed-score">${Number(x.score).toFixed(1)}</strong><button class="delete-btn" onclick="removeRecord('grades','${x.id}')">×</button></div>`).join("")||'<div class="feed-item"><div class="feed-main"><b>Chưa có điểm</b><small>Chọn học sinh, môn học và chạm mức điểm.</small></div></div>'}
function renderClassList(){
  $("classList").innerHTML=db.classes.map(c=>{let count=db.students.filter(s=>s.classId===c.id).length;return `<div class="class-item"><div><b>${esc(c.name)}</b><small>${count} học sinh</small></div><button class="plain-btn" onclick="renameClass('${c.id}')">Đổi tên</button><button class="plain-btn" onclick="deleteClass('${c.id}')">Xóa</button></div>`}).join("");
}
$("classFilter").onchange=()=>{let v=$("classFilter").value;if(v!=="all"){db.activeClassId=v;persist()}else renderStudents()};
$("behaviorTypes").addEventListener("click",e=>{let b=e.target.closest("[data-type]");if(!b)return;selectedType=b.dataset.type;document.querySelectorAll(".type-btn").forEach(x=>x.classList.toggle("selected",x===b))});
$("addBehavior").onclick=()=>{let sid=$("behaviorStudent").value;if(!sid)return toast("Hãy thêm học sinh vào lớp trước");db.behaviors.unshift({id:uid(),studentId:sid,type:selectedType,note:$("behaviorText").value.trim(),date:today(),time:new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})});$("behaviorText").value="";persist();toast("Đã ghi nhận "+selectedType.toLowerCase())};
$("scorePad").addEventListener("click",e=>{let b=e.target.closest("[data-score]");if(!b)return;selectedScore=Number(b.dataset.score);document.querySelectorAll("#scorePad button").forEach(x=>x.classList.toggle("selected",x===b));$("chosenScore").textContent=selectedScore});
$("clearScore").onclick=()=>{selectedScore=null;$("chosenScore").textContent="—";document.querySelectorAll("#scorePad button").forEach(x=>x.classList.remove("selected"))};
$("addGrade").onclick=()=>{let sid=$("gradeStudent").value,sub=$("gradeSubject").value.trim();if(!sid)return toast("Hãy thêm học sinh vào lớp trước");if(!sub)return toast("Nhập tên môn học");if(selectedScore===null)return toast("Chọn mức điểm");db.grades.unshift({id:uid(),studentId:sid,subject:sub,kind:$("gradeKind").value,score:selectedScore,date:today(),time:new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})});$("clearScore").click();persist();toast("Đã lưu điểm "+selectedScore)};
$("studentSearch").oninput=renderStudents;
$("openAddStudent").onclick=()=>{$("studentModal").classList.remove("hidden");$("newStudentName").focus()};
function closeStudent(){$("studentModal").classList.add("hidden");$("newStudentName").value=$("newStudentCode").value=""}
$("closeStudentModal").onclick=$("cancelStudent").onclick=closeStudent;
$("saveStudent").onclick=()=>{let name=$("newStudentName").value.trim();if(!name)return toast("Nhập họ tên học sinh");let code=$("newStudentCode").value.trim()||String(classStudents().length+1).padStart(2,"0");db.students.push({id:uid(),name,code,classId:db.activeClassId});closeStudent();persist();toast("Đã thêm học sinh vào "+currentClass().name)};
function moveStudent(id){let s=db.students.find(x=>x.id===id);if(!s)return;let choices=db.classes.filter(c=>c.id!==s.classId);if(!choices.length)return toast("Hãy tạo thêm lớp trước");let menu=choices.map((c,i)=>(i+1)+". "+c.name).join("\\n");let n=prompt("Chuyển "+s.name+" sang lớp nào?\\n"+menu+"\\nNhập số thứ tự:");let target=choices[Number(n)-1];if(target){s.classId=target.id;persist();toast("Đã chuyển học sinh")}}
function removeStudent(id){if(!confirm("Xóa học sinh này và toàn bộ điểm, ghi nhận liên quan?"))return;db.students=db.students.filter(s=>s.id!==id);db.grades=db.grades.filter(x=>x.studentId!==id);db.behaviors=db.behaviors.filter(x=>x.studentId!==id);persist()}
function removeRecord(type,id){if(!confirm("Xóa bản ghi này?"))return;db[type]=db[type].filter(x=>x.id!==id);persist()}
$("classSettings").onclick=()=>{$("classModal").classList.remove("hidden");$("classNameInput").value=""};
function closeClass(){$("classModal").classList.add("hidden")}
$("closeClassModal").onclick=closeClass;
$("addClass").onclick=()=>{let name=$("classNameInput").value.trim();if(!name)return toast("Nhập tên lớp");if(db.classes.some(c=>c.name.toLowerCase()===name.toLowerCase()))return toast("Tên lớp đã tồn tại");let c={id:uid(),name};db.classes.push(c);db.activeClassId=c.id;$("classNameInput").value="";persist();toast("Đã tạo lớp "+name)};
function renameClass(id){let c=db.classes.find(x=>x.id===id);if(!c)return;let name=prompt("Tên lớp mới:",c.name);if(!name||!name.trim())return;if(db.classes.some(x=>x.id!==id&&x.name.toLowerCase()===name.trim().toLowerCase()))return toast("Tên lớp đã tồn tại");c.name=name.trim();persist();toast("Đã đổi tên lớp")}
function deleteClass(id){let c=db.classes.find(x=>x.id===id);if(!c)return;if(db.students.some(s=>s.classId===id))return alert("Lớp vẫn còn học sinh. Hãy chuyển học sinh sang lớp khác trước.");if(db.classes.length===1)return alert("Phải giữ lại ít nhất một lớp.");if(!confirm("Xóa lớp "+c.name+"?"))return;db.classes=db.classes.filter(x=>x.id!==id);if(db.activeClassId===id)db.activeClassId=db.classes[0].id;persist()}
function exportTxt(){let p={app:"Smart Class Quick",version:2,exportedAt:new Date().toISOString(),data:db};let blob=new Blob(["SMART CLASS QUICK BACKUP\\n"+JSON.stringify(p,null,2)],{type:"text/plain;charset=utf-8"});let url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="SmartClass_"+today()+".txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast("Đã xuất file TXT")}
$("exportBtn").onclick=exportTxt;
$("importFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let p=JSON.parse(String(r.result).replace(/^SMART CLASS QUICK BACKUP\\s*/,""));let d=p.data||p;if(!Array.isArray(d.students)||!Array.isArray(d.grades)||!Array.isArray(d.behaviors))throw 0;if(!confirm("Nhập file sẽ thay thế dữ liệu hiện tại. Tiếp tục?"))return;db={...d,classes:d.classes,activeClassId:d.activeClassId};ensureSchema();persist();toast("Đã khôi phục dữ liệu")}catch(e){alert("File TXT không đúng định dạng Smart Class Quick.")}e.target.value=""};r.readAsText(f,"UTF-8")};
load();
