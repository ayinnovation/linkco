// ==========================================
// 👑 ADMIN DASHBOARD MODULE (js/admin.js)
// Handles administrative dashboard analytics calculation, revenue reporting,
// user payment request approvals/rejections, and notification updates.
// ==========================================

import { adminRequestsDiv } from './dom.js';
import { generateId } from './utils.js';
import { currentUser } from './auth.js';
import { renderFeed } from './flyers.js';
import { showFeed } from './navigation.js';

/**
 * Calculates metrics and populates administrative statistical cards (users, revenue, active flyers, pending requests, fulfillment rate).
 */
export function renderAdminAnalytics() {
  // Load data arrays from localStorage
  const flyers = JSON.parse(localStorage.getItem("flyers") || "[]");
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");

  // Filter count of standard users excluding admin account
  const totalUsers = users.filter(u => u.role !== "admin").length;
  // Total flyer count posted on platform
  const totalFlyers = flyers.length;
  // Active flyer count currently visible on feed
  const activeFlyers = flyers.filter(f => f.isActive).length;
  // Pending payment join requests count
  const pendingRequests = requests.filter(r => r.status === "pending").length;
  // Approved join requests count
  const approvedRequests = requests.filter(r => r.status === "approved").length;

  // Calculate platform revenue breakdown (₦300 per flyer, ₦900 per approved search request)
  const revenueFromFlyers = totalFlyers * 300;
  const revenueFromSearch = approvedRequests * 900;
  const totalRevenue = revenueFromFlyers + revenueFromSearch;

  // Calculate room fulfillment success percentage rate
  const fulfillmentRate = flyers.length > 0
    ? Math.round(
        (flyers.filter(f => f.roommatesFound >= f.roommatesNeeded).length / flyers.length) * 100
      )
    : 0;

  const analyticsDiv = document.getElementById("admin-analytics");
  if (!analyticsDiv) return;

  // Inject metric cards HTML structure into analytics dashboard container
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

/**
 * Renders user payment/join requests in admin dashboard with Approve and Reject action buttons.
 */
export function renderAdminRequests() {
  if (!adminRequestsDiv) return;

  // Load requests and flyers arrays from localStorage
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");
  const flyers = JSON.parse(localStorage.getItem("flyers") || "[]");

  // Show feed view context
  showFeed();

  adminRequestsDiv.innerHTML = ""; // Clear existing request list DOM

  // Display empty notice if no payment requests exist
  if (requests.length === 0) {
    adminRequestsDiv.innerHTML = "<p>No payment requests yet.</p>";
    return;
  }

  // Iterate over each request item
  requests.forEach(req => {
    // Find associated flyer record for this request
    const flyer = flyers.find(f => f.id === req.flyerId);
    if (!flyer) return; // Skip if target flyer no longer exists

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

    // If request status is pending, render Approve and Reject action buttons
    if (!req.status || req.status === "pending") {
      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = () => approveRequest(req); // Attach approve action callback

      const rejectBtn = document.createElement("button");
      rejectBtn.textContent = "Reject";
      rejectBtn.onclick = () => rejectRequest(req); // Attach reject action callback

      div.appendChild(approveBtn);
      div.appendChild(rejectBtn);
    }

    adminRequestsDiv.appendChild(div); // Append request card element into admin panel
  });
}

/**
 * Approves a payment join request, increments roommates found count on flyer, and sends notification to user.
 * 
 * @param {Object} request - Target request object record
 */
export function approveRequest(request) {
  let requests = JSON.parse(localStorage.getItem("requests") || "[]");
  let flyers = JSON.parse(localStorage.getItem("flyers") || "[]");

  const reqIndex = requests.findIndex(r => r.time === request.time);
  const flyer = flyers.find(f => f.id === request.flyerId);

  if (!flyer || reqIndex === -1) return;

  // 1️⃣ Mark request status as approved
  requests[reqIndex].status = "approved";

  // 2️⃣ Increment roommatesFound counter on flyer
  flyer.roommatesFound++;

  // 3️⃣ Auto-deactivate flyer if roommate quota is filled
  if (flyer.roommatesFound >= flyer.roommatesNeeded) {
    flyer.isActive = false;
  }

  // 4️⃣ Create notification item for requester
  let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  notifications.push({
    id: generateId(),
    phone: request.phone,
    message: "🎉 Your request has been approved!",
    time: Date.now(),
    read: false
  });

  // Save updated data arrays back into localStorage
  localStorage.setItem("notifications", JSON.stringify(notifications));
  localStorage.setItem("requests", JSON.stringify(requests));
  localStorage.setItem("flyers", JSON.stringify(flyers));

  // Re-render admin requests list and public feed
  renderAdminRequests();
  renderFeed();
}

/**
 * Rejects a payment join request and updates status in localStorage.
 * 
 * @param {Object} request - Target request object record
 */
export function rejectRequest(request) {
  let requests = JSON.parse(localStorage.getItem("requests") || "[]");

  const reqIndex = requests.findIndex(r => r.time === request.time);
  if (reqIndex === -1) return;

  requests[reqIndex].status = "rejected"; // Set status to rejected

  // Save updated requests array into localStorage
  localStorage.setItem("requests", JSON.stringify(requests));

  // Re-render admin request list
  renderAdminRequests();
}

/**
 * Renders notification messages panel for the currently logged-in user.
 */
export function renderNotifications() {
  const panel = document.getElementById("notification-panel");
  if (!panel || !currentUser) return;

  let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");

  // Filter unread notifications belonging to current logged-in user's phone number
  const myNotes = notifications.filter(n => 
    n.phone === currentUser.phone && !n.read
  );

  // Hide notification panel if no unread messages exist
  if (myNotes.length === 0) {
    panel.classList.add("hidden");
    return;
  }

  panel.classList.remove("hidden"); // Reveal notification panel box
  panel.innerHTML = "<h4>Notifications</h4>";

  // Render individual notification items
  myNotes.forEach(note => {
    const div = document.createElement("div");
    div.style.borderBottom = "1px solid #ddd";
    div.style.padding = "6px 0";

    div.innerHTML = `
      <p>${note.message}</p>
      <button data-id="${note.id}">Clear</button>
    `;

    const clearBtn = div.querySelector("button");
    if (clearBtn) {
      clearBtn.onclick = () => {
        clearNotification(note.id);
      };
    }

    panel.appendChild(div);
  });
}

/**
 * Clears/deletes a notification message by ID from storage and updates panel UI.
 * 
 * @param {string} id - Notification ID string
 */
export function clearNotification(id) {
  let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");

  // Filter out notification matching specified ID
  notifications = notifications.filter(n => n.id !== id);

  // Save updated notifications array into localStorage
  localStorage.setItem("notifications", JSON.stringify(notifications));

  // Re-render notification panel
  renderNotifications();
}
