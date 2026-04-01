// ===============================
// 🚀 FLYER SYSTEM (Backend-Ready)
// ===============================

// --- SELECT IMPORTANT ELEMENTS ---
const adminSection = document.getElementById("admin-section");
const adminRequestsDiv = document.getElementById("admin-req");
const navGuest = document.getElementById("nav-guest");
const navUser = document.getElementById("nav-user");
const welcomeUser = document.getElementById("welcome-user");
const studentCb = document.getElementById("reg-is-student");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const guestWelcome = document.getElementById("guest-welcome");
const authSection = document.getElementById("auth-section");
const hiddenFlyersSection = document.getElementById("hidden-flyers-section");
const hiddenFlyersList = document.getElementById("hidden-flyers-list");
const showHiddenFlyersBtn = document.getElementById("show-hidden-flyers-btn");
const btnExitAdmin = document.getElementById("btn-exit-admin");

const feedSection = document.getElementById("feed-section");
const flyerSection = document.getElementById("flyer-section");
const searchSection = document.getElementById("search-section");
const regStudentp = document.getElementById("reg-student-doc-wrapper");
const btnShowLogin = document.getElementById("btn-show-login");
const btnShowRegister = document.getElementById("btn-show-register");
const btnContinueGuest = document.getElementById("btn-continue-guest");
const btnLogout = document.getElementById("btn-logout");
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const btnCreateFlyer = document.getElementById("btn-create-flyer");
const btnSearch = document.getElementById("btn-search");
const btnReturnHome = document.getElementById("btn-return-home");

const btnPayCreate = document.getElementById("btn-pay-create");
const btnCancelCreate = document.getElementById("btn-cancel-create");

const btnRunSearch = document.getElementById("btn-run-search");

const feedList = document.getElementById("feed-list");
const searchResults = document.getElementById("search-results");
//loading function 
function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}
//hide loading function 
function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}

// --------------------------
// 📦 HELPER FUNCTIONS
// --------------------------
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key, fallback) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

// Non-blocking notice and confirmation helpers
function showNotice(message, {type = 'info', duration = 3000} = {}) {
  const id = 'notice-message';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.position = 'fixed';
    el.style.top = '80px';
    el.style.left = '50%';
    el.style.transform = 'translateX(-50%)';
    el.style.padding = '10px 16px';
    el.style.borderRadius = '8px';
    el.style.zIndex = '9999';
    el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
    el.style.display = 'none';
    document.body.appendChild(el);
  }
  const colors = { info: '#0b3d91', success: '#16a34a', error: '#dc2626', warn: '#f97316' };
  el.style.background = colors[type] || colors.info;
  el.style.color = 'white';
  el.textContent = message;
  el.style.display = 'block';
  clearTimeout(el._hideTimeout);
  el._hideTimeout = setTimeout(() => { el.style.display = 'none'; }, duration);
}

function showConfirm(message) {
  return new Promise(resolve => {
    const id = 'confirm-overlay';
    let overlay = document.getElementById(id);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = id;
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'rgba(0,0,0,0.5)';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '10000';
      const box = document.createElement('div');
      box.style.background = 'white';
      box.style.padding = '20px';
      box.style.borderRadius = '8px';
      box.style.maxWidth = '90%';
      box.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
      const msg = document.createElement('p');
      msg.id = id + '-msg';
      msg.style.marginBottom = '12px';
      const btns = document.createElement('div');
      btns.style.display = 'flex';
      btns.style.gap = '8px';
      const yes = document.createElement('button');
      yes.textContent = 'Confirm';
      yes.style.background = '#16a34a';
      yes.style.color = 'white';
      const no = document.createElement('button');
      no.textContent = 'Cancel';
      no.style.background = '#dc2626';
      no.style.color = 'white';
      btns.appendChild(yes);
      btns.appendChild(no);
      box.appendChild(msg);
      box.appendChild(btns);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }
    const msgEl = document.getElementById(id + '-msg');
    msgEl.textContent = message;
    overlay.style.display = 'flex';
    const yesBtn = overlay.querySelector('button:first-of-type');
    const noBtn = overlay.querySelector('button:last-of-type');
    function cleanup(val) {
      overlay.style.display = 'none';
      resolve(val);
    }
    yesBtn.onclick = () => cleanup(true);
    noBtn.onclick = () => cleanup(false);
  });
}

studentCb.addEventListener("change", () => {
  if (studentCb.checked) {
    regStudentp.classList.remove("hidden");
  } else {
    regStudentp.classList.add("hidden");
  }
});

function generateId() {
  return Date.now().toString(36);
}

// --------------------------
// 🧍 AUTH LOGIC
// --------------------------
let users = loadFromStorage("users", []);
// Ensure admin exists
if (!users.some(u => u.role === "admin")) {
  users.push({
    id: "admin-1",
    name: "Administrator",
    phone: "0000",
    password: "admin123",
    role: "admin"
  });
  saveToStorage("users", users);
}
let currentUser = loadFromStorage("currentUser", null);

function registerUser() {
  const name = document.getElementById("reg-name").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const isStudent = studentCb.checked;
  const studentDoc = document.getElementById("student-doc-preview").src || "";

  if (!name || !phone || !password) {
    showNotice("Please fill all required fields", {type: 'warn'});
    return;
  }

  if (users.some(u => u.phone === phone)) {
    showNotice("User with this phone already exists", {type: 'error'});
    return;
  }

  const newUser = { id: generateId(), name, phone, password, isStudent, studentDoc, role:"user" };
  users.push(newUser);
  saveToStorage("users", users);

  showNotice("Registration successful! You can now log in.", {type: 'success'});
  showLogin();
}
// Admin dashboard logic
function showAdminDashboard() {
  if (!currentUser || currentUser.role !== "admin") {
    showNotice("Unauthorized access", { type: "error" });
    return;
  }
  authSection.classList.add("hidden");
  feedSection.classList.add("hidden");
  flyerSection.classList.add("hidden");
  searchSection.classList.add("hidden");
  navGuest.classList.add("hidden");
  adminSection.classList.remove("hidden");
  renderAdminAnalytics();
  renderAdminRequests();
}
function renderAdminRequests() {
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");
  const flyers = JSON.parse(localStorage.getItem("flyers") || "[]");

  adminRequestsDiv.innerHTML = "";

  if (requests.length === 0) {
    adminRequestsDiv.innerHTML = "<p>No payment requests yet.</p>";
    return;
  }

  requests.forEach(req => {
    const flyer = flyers.find(f => f.id === req.flyerId);
    if (!flyer) return;

    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <p><b>User:</b> ${req.user}</p>
      <p><b>Phone:</b> ${req.phone}</p>
      <p><b>Room:</b> ${flyer.title}</p>
      <p><b>Status:</b> ${req.status || "pending"}</p>
    `;

    if (!req.status || req.status === "pending") {
      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = () => approveRequest(req);

      const rejectBtn = document.createElement("button");
      rejectBtn.textContent = "Reject";
      rejectBtn.onclick = () => rejectRequest(req);

      div.appendChild(approveBtn);
      div.appendChild(rejectBtn);
    }

    adminRequestsDiv.appendChild(div);
  });
}
function renderAdminAnalytics() {
  const flyers = JSON.parse(localStorage.getItem("flyers") || "[]");
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");

  const totalUsers = users.filter(u => u.role !== "admin").length;
  const totalFlyers = flyers.length;
  const activeFlyers = flyers.filter(f => f.isActive).length;
  const pendingRequests = requests.filter(r => r.status === "pending").length;
  const approvedRequests = requests.filter(r => r.status === "approved").length;

  const revenueFromFlyers = totalFlyers * 300;
  const revenueFromSearch = approvedRequests * 900;
  const totalRevenue = revenueFromFlyers + revenueFromSearch;

  const fulfillmentRate = flyers.length > 0
    ? Math.round(
        (flyers.filter(f => f.roommatesFound >= f.roommatesNeeded).length / flyers.length) * 100
      )
    : 0;

  const analyticsDiv = document.getElementById("admin-analytics");

  analyticsDiv.innerHTML = `
    <div class="stat-card">
      <h4>Total Users</h4>
      <p>${totalUsers}</p>
    </div>

    <div class="stat-card">
      <h4>Total Revenue</h4>
      <p>₦${totalRevenue}</p>
    </div>

    <div class="stat-card">
      <h4>Active Flyers</h4>
      <p>${activeFlyers} / ${totalFlyers}</p>
    </div>

    <div class="stat-card">
      <h4>Pending Requests</h4>
      <p>${pendingRequests}</p>
    </div>

    <div class="stat-card">
      <h4>Fulfillment Rate</h4>
      <p>${fulfillmentRate}%</p>
    </div>

    <div class="stat-card">
      <h4>Approved Joinings</h4>
      <p>${approvedRequests}</p>
    </div>
  `;
}
function approveRequest(request) {
  let requests = JSON.parse(localStorage.getItem("requests") || "[]");
  let flyers = JSON.parse(localStorage.getItem("flyers") || "[]");

  const reqIndex = requests.findIndex(r => r.time === request.time);
  const flyer = flyers.find(f => f.id === request.flyerId);

  if (!flyer) return;

  // 1️⃣ mark approved
  requests[reqIndex].status = "approved";

  // 2️⃣ increment roommatesFound
  flyer.roommatesFound++;

  // 3️⃣ auto-pull if quota met
  if (flyer.roommatesFound >= flyer.roommatesNeeded) {
    flyer.isActive = false;
  }
  // Notify user
  let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  
  notifications.push({
    id: generateId(),
    phone: request.phone,
    message: "🎉 Your request has been approved!",
    time: Date.now(),
    read: false
  });
  
  localStorage.setItem("notifications", JSON.stringify(notifications));
  localStorage.setItem("requests", JSON.stringify(requests));
  localStorage.setItem("flyers", JSON.stringify(flyers));

  renderAdminRequests();
  renderFeed();
}
//admin exit logic
safeOn(btnExitAdmin,"click",()=>{
  adminSection.classList.add("hidden");
  
  authSection.classList.remove("hidden");});
  //---------end of admin exit logic------
function renderNotifications() {
  const panel = document.getElementById("notification-panel");
  let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");

  const myNotes = notifications.filter(n => 
    n.phone === currentUser.phone && !n.read
  );

  if (myNotes.length === 0) {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden");
  panel.innerHTML = "<h4>Notifications</h4>";

  myNotes.forEach(note => {
    const div = document.createElement("div");
    div.style.borderBottom = "1px solid #ddd";
    div.style.padding = "6px 0";

    div.innerHTML = `
      <p>${note.message}</p>
      <button data-id="${note.id}">Clear</button>
    `;

    div.querySelector("button").onclick = () => {
      clearNotification(note.id);
    };

    panel.appendChild(div);
  });
}
function clearNotification(id) {
  let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");

  notifications = notifications.filter(n => n.id !== id);

  localStorage.setItem("notifications", JSON.stringify(notifications));

  renderNotifications();
}
function rejectRequest(request) {
  let requests = JSON.parse(localStorage.getItem("requests") || "[]");

  const reqIndex = requests.findIndex(r => r.time === request.time);
  requests[reqIndex].status = "rejected";

  localStorage.setItem("requests", JSON.stringify(requests));

  renderAdminRequests();
}//end of admin logic

//login function
function loginUser() {
  const phone = document.getElementById("login-phone").value.trim();
  const password = document.getElementById("login-password").value.trim();

  const user = users.find(u => u.phone === phone && u.password === password);

  if (!user) {
    showNotice("Invalid phone or password", { type: "error" });
    return;
  }

  // ✅ Set session first
  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // ✅ Role-based routing
  if (user.role === "admin") {
    showAdminDashboard();
  } else {
    showFeed();
  }

  showNotice("Login successful", { type: "success" });
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  showAuth();
  adminSection.classList.add("hidden");
}

// --------------------------
// 📸 IMAGE PREVIEW HANDLERS
// --------------------------
function handleImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });
}

handleImagePreview("reg-student-doc", "student-doc-preview");
handleImagePreview("f-hostel-image", "hostel-image-preview");
handleImagePreview("f-profile-image", "profile-image-preview");

// --------------------------
// 🧾 FLYER CREATION & FEED
// --------------------------
let flyers = loadFromStorage("flyers", []);

function createFlyer() {
  const title = document.getElementById("f-title").value.trim();
  const location = document.getElementById("f-location").value.trim();
  const perPerson = document.getElementById("f-per-person").value.trim();
  const totalPrice = document.getElementById("f-total-price").value.trim();
  const contact = document.getElementById("f-contact").value.trim();
  const hostelImg = document.getElementById("hostel-image-preview").src || "";
  const profileImg = document.getElementById("profile-image-preview").src || "";
  const slotsN=document.getElementById("f-slots-needed").value.trim();
  const roommatesNeeded = slotsN ? (parseInt(slotsN,10)||0) :0;
  const roommatesFound = 0;  // always starts at 0
  
 if (!title || !location || !perPerson || !totalPrice || !contact) {
    showNotice("Please fill all fields", {type: 'warn'});
    return;
  }

  // If not logged in show a transient inline message instead of alert
  // If not logged in or browsing as guest show a transient inline message instead of alert
  if (!currentUser || currentUser.isGuest) {
    const noticeId = 'notice-message';
    let notice = document.getElementById(noticeId);
    if (!notice) {
      notice = document.createElement('div');
      notice.id = noticeId;
      notice.style.position = 'fixed';
      notice.style.top = '80px';
      notice.style.left = '50%';
      notice.style.transform = 'translateX(-50%)';
      notice.style.background = '#f97316';
      notice.style.color = 'white';
      notice.style.padding = '10px 16px';
      notice.style.borderRadius = '8px';
      notice.style.zIndex = '9999';
      notice.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
      document.body.appendChild(notice);
    }
    notice.textContent = 'Please register or login to create a flyer.';
    notice.style.display = 'block';
    setTimeout(() => { notice.style.display = 'none'; }, 3000);

    return;
  }

  const flyer = {
    id: generateId(),
    title,
    location,
    perPerson,
    totalPrice,
    contact,
    hostelImg,
    profileImg,
    user: currentUser.name,
    userPhone:currentUser.phone,
    isActive:true, 
    CreatedAt: Date.now(),
    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    roommatesNeeded,
    roommatesFound
  };

  flyers.push(flyer);
  saveToStorage("flyers", flyers);
  renderFeed();
  showFeed();
  showNotice("Flyer created successfully!", {type: 'success'});
}

function renderFeed() {
  feedList.innerHTML = "";
  if (flyers.length === 0) {
    feedList.innerHTML = "<p>No flyers yet.</p>";
    return;
  }

  flyers.forEach(f => {
    // Skip hidden flyers
    if (!f.isActive) return;
  const slotsLeft = Math.max(0, f.roommatesNeeded - f.roommatesFound);
    const flyerEl = document.createElement("div");
    flyerEl.className = "flyer";
    flyerEl.innerHTML = `
      <img src="${f.hostelImg}" class="flyer-hostel-img" alt="Hostel" />
      <h4>${f.title}</h4>
      <p><b>Location:</b> ${f.location}</p>
      <p><b>Per Person:</b> ₦${f.perPerson}</p>
      <p><b>Total Price:</b> ₦${f.totalPrice}</p>
      <p><b>Contact:</b> ${f.contact}</p>
      <p><b>Code:</b> ${f.code}</p>
      <div>
        <img src="${f.profileImg}" class="flyer-profile-img" alt="User" />
        <span>By ${f.user}</span>
      </div>
      <a href="https://wa.me/${f.contact}" target="_blank"><button>Chat on WhatsApp</button></a>
      <p><b>Slots Left:</b> ${slotsLeft}</p>
    `;
    //so you can join the roomates and also  make payment
    // JOIN logic with approval check
    if (currentUser && currentUser.phone !== f.userPhone) {
    
      const requests = JSON.parse(localStorage.getItem("requests") || "[]");
    
      const myRequest = requests.find(r =>
        r.flyerId === f.id && r.phone === currentUser.phone
      );
    
      const paymentBtn = document.createElement("button");
    
      if (myRequest?.status === "approved") {
        paymentBtn.textContent = "APPROVED";
        paymentBtn.disabled = true;
        paymentBtn.style.background = "#16a34a";
      } else if (myRequest?.status === "pending") {
        paymentBtn.textContent = "PENDING";
        paymentBtn.disabled = true;
        paymentBtn.style.background = "#f97316";
      } else {
        paymentBtn.textContent = "JOIN";
        paymentBtn.onclick = () => requestPayment(f.id);
      }
    
      flyerEl.appendChild(paymentBtn);
    }
    
    // ✅ Only the owner of the flyer sees “Pull Down” and “Delete”
    if (currentUser && f.userPhone === currentUser.phone) {
      const btnContainer = document.createElement("div");
      btnContainer.style.marginTop = "8px";
      btnContainer.style.display = "flex";
      btnContainer.style.gap = "8px";

      // 🟡 Pull Down Button
      const pullDownBtn = document.createElement("button");
      pullDownBtn.textContent = "Pull Down";
      pullDownBtn.style.background = "#eab308"; // yellow
      pullDownBtn.style.color = "white";
      pullDownBtn.style.border = "none";
      pullDownBtn.style.padding = "6px 10px";
      pullDownBtn.style.borderRadius = "6px";
      pullDownBtn.style.cursor = "pointer";
      pullDownBtn.onclick = () => pullDownFlyer(f.id);

      // 🔴 Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete Permanently";
      deleteBtn.style.background = "#b91c1c"; // red
      deleteBtn.style.color = "white";
      deleteBtn.style.border = "none";
      deleteBtn.style.padding = "6px 10px";
      deleteBtn.style.borderRadius = "6px";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.onclick = () => deleteFlyer(f.id);

      btnContainer.appendChild(pullDownBtn);
      btnContainer.appendChild(deleteBtn);
      flyerEl.appendChild(btnContainer);
    }
   
    feedList.appendChild(flyerEl);
  });
}
async function pullDownFlyer(id) {
  const flyer = flyers.find(fl => fl.id === id);
  if (!flyer) {
    showNotice("Flyer not found.", {type: 'error'});
    return;
  }
  const ok = await showConfirm("Do you want to pull down this flyer?");
  if (!ok) return;
  flyer.isActive = false;
  saveToStorage("flyers", flyers);
  renderFeed();
}
function requestPayment(flyerId) {
  showLoader();

  setTimeout(() => {

    let req = JSON.parse(localStorage.getItem("requests")||"[]");

    //prevent duplicate requests
    const existingReq = req.some( r => r.flyerId === flyerId && r.phone === currentUser.phone );

    if(existingReq){

hideLoader();

showNotice("REQUEST ALREADY EXIST", {type: "warn"});

return;
    }

    req.push({id:generateId(),
    flyerId,
    user:currentUser.name,
    phone:currentUser.phone, 
    time:Date.now()
    });

    hideLoader();
    showNotice("YOU'VE SUCCESFULY SENT YOUR REQUEST", {type:"success"} );

  },1000);
}



function renderHiddenFlyers() {
  hiddenFlyersList.innerHTML = "";
  const myHiddenFlyers = flyers.filter(
    f => !f.isActive && f.userPhone === currentUser.phone
  );

  if (myHiddenFlyers.length === 0) {
    hiddenFlyersList.innerHTML = "<p>You have no pulled down flyers.</p>";
    return;
  }

  myHiddenFlyers.forEach(f => {
    const flyerEl = document.createElement("div");
    flyerEl.className = "flyer";
    flyerEl.innerHTML = `
      <img src="${f.hostelImg}" class="flyer-hostel-img" alt="Hostel" />
      <h4>${f.title}</h4>
      <p><b>Location:</b> ${f.location}</p>
      <p><b>Per Person:</b> ₦${f.perPerson}</p>
      <p><b>Total Price:</b> ₦${f.totalPrice}</p>
      <p><b>Contact:</b> ${f.contact}</p>
      <p><b>Code:</b> ${f.code}</p>
      <div>
        <img src="${f.profileImg}" class="flyer-profile-img" alt="User" />
        <span>By ${f.user}</span>
      </div>
    `;

    const restoreBtn = document.createElement("button");
    restoreBtn.textContent = "Restore Flyer";
    restoreBtn.style.background = "#16a34a"; // green
    restoreBtn.style.color = "white";
    restoreBtn.style.border = "none";
    restoreBtn.style.padding = "6px 10px";
    restoreBtn.style.borderRadius = "6px";
    restoreBtn.style.cursor = "pointer";
    restoreBtn.onclick = () => restoreFlyer(f.id);

    flyerEl.appendChild(restoreBtn);
    hiddenFlyersList.appendChild(flyerEl);
  });
}

async function deleteFlyer(id) {
  const ok = await showConfirm("Are you sure you want to delete this flyer permanently?");
  if (!ok) return;
  const index = flyers.findIndex(fl => fl.id === id);
  if (index === -1) {
    showNotice("Flyer not found.", {type: 'error'});
    return;
  }
  flyers.splice(index, 1);
  saveToStorage("flyers", flyers);
  renderFeed();
}
function restoreFlyer(id) {
  const flyer = flyers.find(fl => fl.id === id);
  if (!flyer) {
    showNotice("Flyer not found.", {type: 'error'});
    return;
  }
  flyer.isActive = true;
  saveToStorage("flyers", flyers);
  renderHiddenFlyers();
  renderFeed();
}

// --------------------------
// 🔍 SEARCH SYSTEM
// --------------------------
function runSearch() {
  const code = document.getElementById("search-code-input").value.trim().toUpperCase();
  const results = flyers.filter(f => f.code.includes(code));

  searchResults.innerHTML = "";
  if (results.length === 0) {
    searchResults.innerHTML = "<p>No flyers found with that code.</p>";
    return;
  }

  results.forEach(f => {
    const div = document.createElement("div");
    div.className = "flyer";
    div.innerHTML = `
      <img src="${f.hostelImg}" class="flyer-hostel-img" />
      <h4>${f.title}</h4>
      <p><b>Location:</b> ${f.location}</p>
      <p><b>Code:</b> ${f.code}</p>
      <a href="https://wa.me/${f.contact}" target="_blank"><button>Chat on WhatsApp</button></a>
    `;
    searchResults.appendChild(div);
  });
}

// --------------------------
// 💾 FORM MEMORY (AUTO SAVE)
// --------------------------
function autoSaveForms() {
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      const id = input.id;
      const val = input.type === "checkbox" ? input.checked : input.value;
      saveToStorage(id, val);
    });
  });
}

function restoreFormData() {
  document.querySelectorAll("input").forEach(input => {
    const id = input.id;
    const saved = loadFromStorage(id, null);
    if (input.type === "file")return;
    if (saved !== null) {
      if (input.type === "checkbox") input.checked = saved;
      else input.value = saved;
    }
  });
}

// --------------------------
// 🧭 NAVIGATION / DISPLAY CONTROL
// --------------------------
function showAuth() {
  authSection.classList.remove("hidden");
  registerForm.classList.add("hidden");
  loginForm.classList.add("hidden");
  guestWelcome.classList.remove("hidden");

  feedSection.classList.add("hidden");
  flyerSection.classList.add("hidden");
  searchSection.classList.add("hidden");

  navGuest.classList.remove("hidden");
  navUser.classList.add("hidden");
  adminSection.classList.add("hidden");
}

function showRegister() {
  guestWelcome.classList.add("hidden");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
}

function showLogin() {
  guestWelcome.classList.add("hidden");
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
}

function showFeed() {
  hiddenFlyersSection.style.display = "none";
  authSection.classList.add("hidden");
  feedSection.classList.remove("hidden");
  flyerSection.classList.add("hidden");
  searchSection.classList.add("hidden");

  navGuest.classList.add("hidden");
  navUser.classList.remove("hidden");

  // Show a guest-specific greeting when browsing as a guest
  if (welcomeUser) {
    if (currentUser && currentUser.isGuest) {
      welcomeUser.textContent = 'Welcome, Guest!';
    } else if (currentUser) {
      welcomeUser.textContent = `Welcome, ${currentUser.name}!`;
    } else {
      welcomeUser.textContent = '';
    }
  }

  // Hide create flyer for guest users
  if (currentUser && currentUser.isGuest) {
    if (btnCreateFlyer) btnCreateFlyer.style.display = 'none';
  } else {
    if (btnCreateFlyer) btnCreateFlyer.style.display = '';
  }

  renderFeed();
  renderNotifications();
}


const sBtnReturnHome = document.getElementById("s-btn-return-home");

function showCreateFlyer() {
  // Prevent guest users from accessing the create flyer view
  if (currentUser && currentUser.isGuest) {
    const noticeId = 'notice-message';
    let notice = document.getElementById(noticeId);
    if (!notice) {
      notice = document.createElement('div');
      notice.id = noticeId;
      notice.style.position = 'fixed';
      notice.style.top = '80px';
      notice.style.left = '50%';
      notice.style.transform = 'translateX(-50%)';
      notice.style.background = '#f97316';
      notice.style.color = 'white';
      notice.style.padding = '10px 16px';
      notice.style.borderRadius = '8px';
      notice.style.zIndex = '9999';
      notice.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
      document.body.appendChild(notice);
    }
    notice.textContent = 'Please register or login to create a flyer.';
    notice.style.display = 'block';
    setTimeout(() => { notice.style.display = 'none'; }, 3000);
    return;
  }

  feedSection.classList.add("hidden");
  flyerSection.classList.remove("hidden");
  btnReturnHome.classList.remove("hidden");
  sBtnReturnHome.classList.add("hidden");
  searchSection.classList.add("hidden");
}

function showSearch() {
  feedSection.classList.add("hidden");
  searchSection.classList.remove("hidden");
  sBtnReturnHome.classList.remove("hidden");
  btnReturnHome.classList.add("hidden");
  flyerSection.classList.add("hidden");
}
// --------------------------
// 💳 SEARCH ACCESS SYSTEM
// --------------------------

// Select required elements
const btnPaySearch = document.getElementById("btn-pay-search");
const btnActivateCode = document.getElementById("btn-activate-code");
const searchCodeInput = document.getElementById("search-code-input");
const searchCodeWrapper = document.getElementById("search-code-wrapper");
const searchForm = document.getElementById("search-form");
const activeCodeInfo = document.getElementById("active-code-info");

let activeSearchCode = localStorage.getItem("activeSearchCode") || "";

// Unlock access for 7 days (simulated)
function unlockSearchAccess(code) {
  activeSearchCode = code;
  localStorage.setItem("activeSearchCode", code);
  searchCodeWrapper.classList.add("hidden");
  searchForm.classList.remove("hidden");
  activeCodeInfo.classList.remove("hidden");
  activeCodeInfo.textContent = `✅ Search access active (Code: ${code}) — valid for 7 days (simulated).`;
}

// Restore search access if previously activated
if (activeSearchCode) unlockSearchAccess(activeSearchCode);

// Payment simulation — generate a code
btnPaySearch.addEventListener("click", () => {
  const code = "LC" + Math.floor(100000 + Math.random() * 900000);
  showNotice(`Payment successful (simulated). Your access code: ${code}`, {type: 'success'});
  unlockSearchAccess(code);
});
//make loader show easily
function withLoader(action, delay = 1200) {
  showLoader();
  setTimeout(async () => {
    try {
      await action();
    } finally {
      hideLoader();
    }
  }, delay);
}

/*NETWORK STATUS HANLER*/
const networkStatus = document.getElementById("network-status");
let networkTimeout = null;

function showNetworkStatus(message, isOnline) {
  networkStatus.textContent = message;
  networkStatus.classList.remove("hidden");

  if (isOnline) {
    networkStatus.classList.add("online");
  } else {
    networkStatus.classList.remove("online");
  }

  clearTimeout(networkTimeout);
  networkTimeout = setTimeout(() => {
    networkStatus.classList.add("hidden");
  }, 4000);
}




// Manual code activation
btnActivateCode.addEventListener("click", () => {
  const entered = searchCodeInput.value.trim();
  if (!entered) { showNotice("Please enter a code.", {type: 'warn'}); return; }
  unlockSearchAccess(entered);
});
// --------------------------
// 🧩 EVENT LISTENERS
// --------------------------

// Startup diagnostics: warn if expected elements are missing
(function startupDiagnostics(){
  const expectedIds = [
    'btn-show-login','btn-show-register','btn-continue-guest',
    'btn-login','btn-register','btn-create-flyer','btn-search',
    'btn-pay-create','btn-run-search','btn-return-home','s-btn-return-home'
  ];
  expectedIds.forEach(id => {
    if (!document.getElementById(id)) console.warn(`Missing expected element id: ${id}`);
  });
})();

// Helper to safely attach event listeners
function safeOn(el, event, handler) {
  if (!el) return console.warn('Attempted to attach listener to null element');
  el.addEventListener(event, handler);
}

// Ensure overlays do not block pointer events when hidden
function ensureOverlayCleanup() {
  const overlay = document.getElementById('confirm-overlay');
  if (overlay) overlay.style.pointerEvents = overlay.style.display === 'none' ? 'none' : 'auto';
}

// run overlay cleanup periodically to be safe
setInterval(ensureOverlayCleanup, 2000);


window.addEventListener("offline", () => {
  showNetworkStatus("⚠️ You are offline. Some features may not work.", false);
});

window.addEventListener("online", () => {
  showNetworkStatus("✅ You are back online.", true);
});

safeOn(btnShowLogin, "click", ()=>{
  showLoader();

  setTimeout(() => {
    showLogin(); 
    hideLoader();
  }, 1200);
});
safeOn(btnShowRegister, "click", ()=>{
  showLoader();

  setTimeout(() => {
    showRegister(); 
    hideLoader();
  }, 1200);
});
safeOn(btnLogout, "click", ()=>{ 
  showLoader();

  setTimeout(() => {
    logoutUser(); 
    hideLoader();
  }, 1200);} );
safeOn(btnLogin, "click", ()=> {
  showLoader();

  setTimeout(() => {
    loginUser(); 
    hideLoader();
  }, 1200);}
);
safeOn(btnRegister, "click",() =>{ 
   showLoader();

  setTimeout(() => {
    registerUser(); 
    hideLoader();
  }, 1200);});
safeOn(btnCreateFlyer,"click",()=>{withLoader(showCreateFlyer)});
document.addEventListener("DOMContentLoaded", () => {

safeOn(btnPayCreate,"click",()=>{withLoader(createFlyer)});
});
safeOn(btnSearch, "click",() => {
  showLoader();

  setTimeout(() => {
    showSearch();
    hideLoader();
  }, 1200);
} );
safeOn(btnReturnHome, "click", () => {
  showLoader();

  setTimeout(() => {
    showFeed();
    hideLoader();
  }, 1200);
});
safeOn(sBtnReturnHome, "click",() => {
  showLoader();

  setTimeout(() => {
    showFeed();
    hideLoader();
  }, 1200);
} );

btnCancelCreate.addEventListener("click",() => {
  showLoader();

  setTimeout(() => {
    showFeed();
    hideLoader();
  }, 1200);
} );
safeOn(btnRunSearch, "click",() => {
  showLoader();

  setTimeout(() => {
    runSearch();
    hideLoader();
  }, 1200);
} );
safeOn(showHiddenFlyersBtn, "click", () => {
   showLoader();

  setTimeout(() => {
    renderHiddenFlyers();
    feedSection.classList.add("hidden");
    hiddenFlyersSection.style.display = "block";
    hideLoader();
  }, 1200);
});

// Continue as guest: allow browsing without registering (some actions disabled)
if (btnContinueGuest) {
  safeOn(btnContinueGuest, 'click', () => {
    currentUser = { id: 'guest', name: 'Guest', phone: '', isGuest: true };

    // Show temporary guest notice
    const noticeId = 'notice-message';
    let notice = document.getElementById(noticeId);
    if (!notice) {
      notice = document.createElement('div');
      notice.id = noticeId;
      notice.style.position = 'fixed';
      notice.style.top = '80px';
      notice.style.left = '50%';
      notice.style.transform = 'translateX(-50%)';
      notice.style.background = '#0b3d91';
      notice.style.color = 'white';
      notice.style.padding = '10px 16px';
      notice.style.borderRadius = '8px';
      notice.style.zIndex = '9999';
      notice.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
      document.body.appendChild(notice);
    }
    notice.textContent = 'Browsing as guest — some actions are disabled.';
    notice.style.display = 'block';
    setTimeout(() => { notice.style.display = 'none'; }, 3000);

    showFeed();
  });
}

// --------------------------
// 🔄 INIT APP
// --------------------------
autoSaveForms();
restoreFormData();

if (currentUser) {
  showFeed();
} else {
  showAuth();
}

// 🔗 BACKEND: In the future, replace all localStorage calls in registerUser, loginUser, and createFlyer
// with API endpoints (POST /register, POST /login, POST /flyer).