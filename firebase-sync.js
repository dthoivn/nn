import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = id => document.getElementById(id);
const state = $("cloudState"), errorBox = $("cloudError");
let auth, db, currentUser=null, unsubscribe=null, applyingRemote=false, saveTimer=null, ready=false;

function showError(message){ errorBox.textContent=message; }
function setState(message){ state.textContent=message; }
function showLogin(user){
  $("loginForm").classList.toggle("hidden",!!user);
  $("signedInPanel").classList.toggle("hidden",!user);
  $("signedEmail").textContent=user?.email||"";
}
function validConfig(){
  return firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("PASTE_") &&
    firebaseConfig.projectId && !firebaseConfig.projectId.startsWith("PASTE_") &&
    firebaseConfig.appId && !firebaseConfig.appId.startsWith("PASTE_");
}
if(!validConfig()){
  setState("Firebase chưa cấu hình");
  showLogin(null);
  showError("Cần điền firebase-config.js theo thông tin dự án Firebase trước khi đăng nhập.");
} else {
  try {
    const app=initializeApp(firebaseConfig);
    auth=getAuth(app); db=getFirestore(app);
    $("loginButton").addEventListener("click",async()=>{
      showError("");
      const email=$("loginEmail").value.trim(), password=$("loginPassword").value;
      if(!email||!password){showError("Nhập email và mật khẩu.");return;}
      $("loginButton").disabled=true; $("loginButton").textContent="ĐANG ĐĂNG NHẬP...";
      try{await signInWithEmailAndPassword(auth,email,password);}
      catch(e){showError(authMessage(e));}
      finally{$("loginButton").disabled=false;$("loginButton").textContent="ĐĂNG NHẬP VÀ ĐỒNG BỘ";}
    });
    $("logoutButton").addEventListener("click",async()=>{
      if(unsubscribe)unsubscribe();
      await signOut(auth);
    });
    onAuthStateChanged(auth,async user=>{
      currentUser=user; showLogin(user); showError("");
      if(unsubscribe){unsubscribe();unsubscribe=null;}
      ready=false;
      if(!user){setState("Chưa đăng nhập – dữ liệu chỉ lưu trên thiết bị này");return;}
      setState("Đang kết nối đám mây...");
      const ref=doc(db,"users",user.uid,"app","smartclass");
      // First snapshot wins: load cloud data if present; otherwise seed cloud from this browser's local data.
      unsubscribe=onSnapshot(ref,async snap=>{
        if(!ready){
          ready=true;
          if(snap.exists()){
            applyingRemote=true;
            window.smartClassApplyCloudData(snap.data().payload);
            applyingRemote=false;
            setState("Đã đồng bộ");
          }else{
            try{
              await setDoc(ref,{payload:window.smartClassGetLocalData(),updatedAt:serverTimestamp()});
              setState("Đã tải dữ liệu thiết bị này lên đám mây");
            }catch(e){showError(authMessage(e));setState("Lỗi đồng bộ");}
          }
        }else if(snap.exists()){
          applyingRemote=true;
          window.smartClassApplyCloudData(snap.data().payload);
          applyingRemote=false;
          setState("Đã nhận dữ liệu mới");
        }
      },e=>{showError(authMessage(e));setState("Không thể đọc dữ liệu");});
    });
    window.smartClassCloudSave=(data)=>{
      if(!currentUser||!ready||applyingRemote)return;
      clearTimeout(saveTimer);
      setState("Đang lưu...");
      saveTimer=setTimeout(async()=>{
        try{
          const ref=doc(db,"users",currentUser.uid,"app","smartclass");
          await setDoc(ref,{payload:data,updatedAt:serverTimestamp()});
          setState("Đã đồng bộ");
        }catch(e){showError(authMessage(e));setState("Lỗi đồng bộ");}
      },700);
    };
  }catch(e){setState("Lỗi khởi tạo Firebase");showError(authMessage(e));}
}
function authMessage(e){
  const code=e?.code||"";
  const map={
    "auth/invalid-credential":"Email hoặc mật khẩu không đúng.",
    "auth/user-not-found":"Không tìm thấy tài khoản. Hãy tạo tài khoản trong Firebase Authentication.",
    "auth/wrong-password":"Mật khẩu không đúng.",
    "auth/too-many-requests":"Đăng nhập tạm bị khóa do thử quá nhiều lần. Hãy đợi rồi thử lại.",
    "auth/network-request-failed":"Không kết nối được mạng. Kiểm tra Internet.",
    "permission-denied":"Firestore từ chối quyền. Kiểm tra Security Rules.",
    "auth/operation-not-allowed":"Chưa bật Email/Password trong Firebase Authentication."
  };
  return map[code]||`${code||"Lỗi"}: ${e?.message||"Không rõ nguyên nhân"}`;
}
