// ==========================================
// 🧾 FLYER SYSTEM MODULE (js/flyers.js)
// Handles creation of roommate flyers, feed rendering, pulling down/hiding flyers,
// permanent flyer deletion, restoration, and joining/payment request processing.
// ==========================================

import { loadFromStorage, saveToStorage } from './storage.js';
import { showNotice, showConfirm, generateId, showLoader, hideLoader } from './utils.js';
import { openChat } from './chat.js';
import { currentUser } from './auth.js';
import { feedList, hiddenFlyersList } from './dom.js';

// Load stored array of flyers from localStorage; default to empty array if missing
export let flyers = loadFromStorage("flyers", []);

/**
 * Checks if the current user is eligible to post a new flyer based on their monthly quota (3 free flyers/month)
 * or active premium subscription status.
 * 
 * @returns {boolean} True if posting allowed, false if limit exceeded
 */
export function canUserPostFlyer() {
  if (!currentUser) return false; // Unauthenticated users cannot post

  const now = Date.now(); // Current millisecond timestamp
  const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  // Filter user's posted flyers created within the past 30 days
  const userFlyers = flyers.filter(f =>
    f.userPhone === currentUser.phone &&
    (now - f.CreatedAt) <= oneMonth
  );

  // Retrieve premium subscription record from localStorage
  const subscription = JSON.parse(localStorage.getItem("subscription") || "{}");

  // Check if user has an active non-expired premium subscription
  if (
    subscription.phone === currentUser.phone &&
    subscription.expires > now
  ) {
    return true; // Unlimited posting access unlocked for subscribers
  }

  // Free tier limit: max 3 flyers per month
  return userFlyers.length < 3;
}

/**
 * Reads flyer creation form input fields, creates a new flyer object, and saves it to storage.
 */
export function createFlyer() {
  // Read and sanitize form field values
  const title = document.getElementById("f-title").value.trim();
  const location = document.getElementById("f-location").value.trim();
  const perPerson = document.getElementById("f-per-person").value.trim();
  const totalPrice = document.getElementById("f-total-price").value.trim();
  const gender = document.getElementById("f-gender").value;
  const roomType = document.getElementById("f-room-type").value;
  const contact = document.getElementById("f-contact").value.trim();
  const hostelImg = document.getElementById("hostel-image-preview").src || "";
  const profileImg = document.getElementById("profile-image-preview").src || "";
  const slotsN = document.getElementById("f-slots-needed").value.trim();
  const roommatesNeeded = Number(slotsN) || 0; // Convert slots string to number
  const roommatesFound = 0;  // Initial roommates found count starts at zero
  const preferences = String(document.getElementById("f-preferences").value || "");

  // Verify whether current user can post another flyer based on quota limits
  if (!canUserPostFlyer()) {
    showNotice(
      "You’ve reached your 3 flyers/month limit. Upgrade for unlimited access.",
      { type: "warn" }
    );
    return;
  }

  // Validate required text input fields
  if (!title || !location || !perPerson || !totalPrice || !contact) {
    showNotice("Please fill all fields", { type: 'warn' });
    return;
  }

  // Check if user is logged in or browsing as a guest
  if (!currentUser || currentUser.isGuest) {
    showNotice('Please register or login to create a flyer.', { type: 'warn' });
    return;
  }

  // Construct new flyer data record object
  const flyer = {
    id: generateId(), // Unique ID string
    title,
    location,
    perPerson,
    totalPrice,
    roomType,
    gender,
    preferences,
    contact,
    hostelImg,
    profileImg,
    user: currentUser.name,
    userPhone: currentUser.phone,
    isActive: true, // Flyer is initially active/visible
    CreatedAt: Date.now(), // Creation epoch timestamp
    code: Math.random().toString(36).substring(2, 8).toUpperCase(), // Random 6-char verification code
    roommatesNeeded,
    roommatesFound
  };

  // Add new flyer to global flyers array
  flyers.push(flyer);

  // Persist updated flyers list to localStorage
  saveToStorage("flyers", flyers);

  // Re-render feed items UI and display main feed section
  renderFeed();
  
  // Show confirmation notice
  showNotice("Flyer created successfully!", { type: 'success' });
}

/**
 * Renders all active flyer cards into the feed container DOM element.
 */
export function renderFeed() {
  if (!feedList) return;
  feedList.innerHTML = ""; // Clear existing feed list container

  // Render only active flyers (visible in the public feed)
  const activeFlyers = flyers.filter(f => f.isActive);

  // If no active flyers exist, show friendly empty-state message
  if (activeFlyers.length === 0) {
    feedList.innerHTML = '<p class="empty-state">No roommate flyers yet — be the first to create one!</p>';
    return;
  }

  // Loop through each active flyer item in array
  activeFlyers.forEach(f => {
    // Skip rendering hidden/pulled down flyers (safety)
    if (!f.isActive) return;

    // Calculate remaining available roommate slots
    const slotsLeft = Math.max(0, f.roommatesNeeded - f.roommatesFound);

    // Create wrapper div for flyer card UI element
    const flyerEl = document.createElement("div");
    flyerEl.className = "flyer"; // Apply flyer CSS card styling class
    flyerEl.innerHTML = `
      <img src="${f.hostelImg}" class="flyer-hostel-img" alt="Hostel" />
      <div class="flyer-content">
        <h4>${f.title.toUpperCase()}</h4>
        <p>Room Type: ${f.roomType}</p>
        <p>Location: ${f.location}</p>
        <p>Per Person: ₦${f.perPerson}</p>
        <p>Total Price: ₦${f.totalPrice}</p>
        <p>Contact: ${f.contact}</p>
        <p><b>Slots Left:</b> ${slotsLeft}</p>
        <div>
          <img src="${f.profileImg}" class="flyer-profile-img" alt="User" />
          <span>By ${f.user}</span>
        </div>
        <div class="flyer-actions">
          <a href="https://wa.me/${f.contact}" target="_blank">
            <button class="success">Chat on WhatsApp</button>
          </a>
        </div>
      </div>
    `;

    const actionsdiv = flyerEl.querySelector(".flyer-actions");

    // Render JOIN / Request button for users viewing flyers posted by others
    if (currentUser && currentUser.phone !== f.userPhone) {
      const requests = JSON.parse(localStorage.getItem("requests") || "[]");
      const myRequest = requests.find(r => r.flyerId === f.id && r.phone === currentUser.phone);

      const paymentBtn = document.createElement("button");

      if (myRequest?.status === "approved") {
        paymentBtn.textContent = "APPROVED";
        paymentBtn.disabled = true;
        paymentBtn.style.background = "#16a34a"; // Green background for approved status
      } else if (myRequest?.status === "pending") {
        paymentBtn.textContent = "PENDING";
        paymentBtn.disabled = true;
        paymentBtn.style.background = "#f97316"; // Orange background for pending status
      } else {
        paymentBtn.textContent = "JOIN";
        paymentBtn.onclick = () => requestPayment(f.id); // Attach payment join request handler
      }

      flyerEl.appendChild(paymentBtn);
    }

    // Render owner control buttons ("Pull Down" and "Delete") if logged-in user is flyer creator
    if (currentUser && f.userPhone === currentUser.phone) {
      const btnContainer = document.createElement("div");
      btnContainer.style.marginTop = "8px";
      btnContainer.style.display = "flex";
      btnContainer.style.gap = "8px";

      // Create "Pull Down" button to hide flyer from public feed
      const pullDownBtn = document.createElement("button");
      pullDownBtn.textContent = "Pull Down";
      pullDownBtn.style.background = "#eab308"; // Yellow warning color
      pullDownBtn.style.color = "white";
      pullDownBtn.style.border = "none";
      pullDownBtn.style.padding = "6px 10px";
      pullDownBtn.style.borderRadius = "6px";
      pullDownBtn.style.cursor = "pointer";
      pullDownBtn.onclick = () => pullDownFlyer(f.id);

      // Create "Delete Permanently" button to remove flyer record completely
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete Permanently";
      deleteBtn.style.background = "#b91c1c"; // Red alert color
      deleteBtn.style.color = "white";
      deleteBtn.style.border = "none";
      deleteBtn.style.padding = "6px 10px";
      deleteBtn.style.borderRadius = "6px";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.onclick = () => deleteFlyer(f.id);

      btnContainer.appendChild(pullDownBtn);
      btnContainer.appendChild(deleteBtn);
      if (actionsdiv) actionsdiv.appendChild(btnContainer);
    }

    // Append completed flyer element into feed list container
    // Add Chat button to actions (fallback to flyer element if actions div missing)
    const chatBtn = document.createElement('button');
    chatBtn.textContent = 'Chat';
    chatBtn.className = 'primary';
    chatBtn.setAttribute('data-chat', f.id);
    chatBtn.onclick = () => openChat(f.id, f.userPhone, f.user);
    if (actionsdiv) {
      actionsdiv.appendChild(chatBtn);
    } else {
      flyerEl.appendChild(chatBtn);
    }

    feedList.appendChild(flyerEl);
  });
}

/**
 * Hides a flyer from the public feed by setting its isActive property to false.
 * 
 * @param {string} id - Flyer ID string
 */
export async function pullDownFlyer(id) {
  const flyer = flyers.find(fl => fl.id === id);
  if (!flyer) {
    showNotice("Flyer not found.", { type: 'error' });
    return;
  }

  // Ask for user confirmation via modal dialog
  const ok = await showConfirm("Do you want to pull down this flyer?");
  if (!ok) return; // User cancelled operation

  flyer.isActive = false; // Mark flyer as inactive/hidden
  saveToStorage("flyers", flyers); // Persist updated status
  renderFeed(); // Re-render public feed
}

/**
 * Permanently deletes a flyer from storage array.
 * 
 * @param {string} id - Flyer ID string
 */
export async function deleteFlyer(id) {
  // Request user confirmation via modal
  const ok = await showConfirm("Are you sure you want to delete this flyer permanently?");
  if (!ok) return;

  const index = flyers.findIndex(fl => fl.id === id);
  if (index === -1) {
    showNotice("Flyer not found.", { type: 'error' });
    return;
  }

  flyers.splice(index, 1); // Remove flyer from array at index
  saveToStorage("flyers", flyers); // Save updated array
  renderFeed(); // Re-render feed
}

/**
 * Restores a pulled-down flyer back to active status in the public feed.
 * 
 * @param {string} id - Flyer ID string
 */
export function restoreFlyer(id) {
  const flyer = flyers.find(fl => fl.id === id);
  if (!flyer) {
    showNotice("Flyer not found.", { type: 'error' });
    return;
  }

  flyer.isActive = true; // Mark flyer active
  saveToStorage("flyers", flyers); // Save updated status
  renderHiddenFlyers(); // Re-render hidden flyers panel list
  renderFeed(); // Re-render main feed list
}

/**
 * Renders hidden/pulled down flyers owned by current logged-in user in hidden flyers section.
 */
export function renderHiddenFlyers() {
  if (!hiddenFlyersList) return;
  hiddenFlyersList.innerHTML = ""; // Clear existing hidden list container

  // Filter inactive flyers belonging to current user's phone number
  const myHiddenFlyers = flyers.filter(
    f => !f.isActive && f.userPhone === currentUser?.phone
  );

  // If user has no hidden flyers, display notice message
  if (myHiddenFlyers.length === 0) {
    hiddenFlyersList.innerHTML = "<p>You have no pulled down flyers.</p>";
    return;
  }

  // Loop through and render hidden flyer cards
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

    // Create restore button
    const restoreBtn = document.createElement("button");
    restoreBtn.textContent = "Restore Flyer";
    restoreBtn.style.background = "#16a34a"; // Green background
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

/**
 * Creates a join payment request for a specific flyer and stores it for admin approval.
 * 
 * @param {string} flyerId - ID of flyer to request joining
 */
export function requestPayment(flyerId) {
  showLoader(); // Show loading spinner

  setTimeout(() => {
    // Load existing payment requests from localStorage
    let req = JSON.parse(localStorage.getItem("requests") || "[]");

    // Prevent submitting duplicate requests for the same flyer
    const existingReq = req.some(r => r.flyerId === flyerId && r.phone === currentUser.phone);

    if (existingReq) {
      hideLoader();
      showNotice("REQUEST ALREADY EXIST", { type: "warn" });
      return;
    }

    // Add new payment join request item
    req.push({
      id: generateId(),
      flyerId,
      user: currentUser.name,
      phone: currentUser.phone,
      time: Date.now()
    });

    // Save requests array to localStorage
    localStorage.setItem("requests", JSON.stringify(req));

    hideLoader(); // Conceal loading spinner
    showNotice("YOU'VE SUCCESSFULLY SENT YOUR REQUEST", { type: "success" });
  }, 1000);
}
