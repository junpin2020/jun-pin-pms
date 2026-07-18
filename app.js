import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
   apiKey: "AIzaSyBdvGkqZngmz--wp4AtYvMR-nnEZb-3JUQ",
  authDomain: "junpin-pms.firebaseapp.com",
  projectId: "junpin-pms",
  storageBucket: "junpin-pms.firebasestorage.app",
  messagingSenderId: "216349083927",
  appId: "1:216349083927:web:bab8d0972ed7ff00e94f52"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const loginMessage = document.querySelector("#loginMessage");
const userInfo = document.querySelector("#userInfo");
const projectList = document.querySelector("#projectList");
const projectDialog = document.querySelector("#projectDialog");
const projectForm = document.querySelector("#projectForm");
const newProjectBtn = document.querySelector("#newProjectBtn");
const closeDialogBtn = document.querySelector("#closeDialogBtn");
const cancelBtn = document.querySelector("#cancelBtn");
const formMessage = document.querySelector("#formMessage");

let unsubscribeProjects = null;

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

loginBtn.addEventListener("click", async () => {
  loginMessage.textContent = "";
  try {
    if (isMobile()) {
      await signInWithRedirect(auth, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
  } catch (error) {
    loginMessage.textContent = "登入失敗：" + error.message;
  }
});

getRedirectResult(auth).catch((error) => {
  loginMessage.textContent = "登入失敗：" + error.message;
});

logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (unsubscribeProjects) {
    unsubscribeProjects();
    unsubscribeProjects = null;
  }

  if (!user) {
    loginView.classList.remove("hidden");
    appView.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    projectList.innerHTML = "";
    return;
  }

  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  userInfo.textContent = user.displayName ? `登入者：${user.displayName}` : `登入者：${user.email}`;

  const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
    if (snapshot.empty) {
      projectList.innerHTML = '<div class="empty">目前沒有工程，請按「新增工程」。</div>';
      return;
    }

    projectList.innerHTML = "";
    snapshot.forEach((doc) => {
      const p = doc.data();
      const card = document.createElement("article");
      card.className = "project-card";
      card.innerHTML = `
        <span class="tag">${escapeHtml(p.projectType || "未分類")}</span>
        <h3>${escapeHtml(p.name || "未命名工程")}</h3>
        <p>業主：${escapeHtml(p.owner || "—")}</p>
        <p>電話：${escapeHtml(p.ownerPhone || "—")}</p>
        <p>地址：${escapeHtml(p.address || "—")}</p>
      `;
      projectList.appendChild(card);
    });
  }, (error) => {
    projectList.innerHTML = `<div class="empty">讀取工程失敗：${escapeHtml(error.message)}</div>`;
  });
});

newProjectBtn.addEventListener("click", () => {
  projectForm.reset();
  formMessage.textContent = "";
  projectDialog.showModal();
});

closeDialogBtn.addEventListener("click", () => projectDialog.close());
cancelBtn.addEventListener("click", () => projectDialog.close());

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const user = auth.currentUser;
  if (!user) {
    formMessage.textContent = "請先登入。";
    return;
  }

  const form = new FormData(projectForm);
  try {
    await addDoc(collection(db, "projects"), {
      name: String(form.get("name") || "").trim(),
      owner: String(form.get("owner") || "").trim(),
      ownerPhone: String(form.get("ownerPhone") || "").trim(),
      address: String(form.get("address") || "").trim(),
      projectType: String(form.get("projectType") || "住宅"),
      createdBy: user.uid,
      createdByEmail: user.email || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    projectDialog.close();
  } catch (error) {
    formMessage.textContent = "儲存失敗：" + error.message;
  }
});

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  });
}
