// ==========================================
// 🏠 HOSTEL MANAGEMENT MODULE (js/hostels.js)
// Handles hostel registration, rendering hostel feed cards, rating hostels,
// posting hostel reviews/comments, and displaying detailed review modals.
// ==========================================

import { loadFromStorage, saveToStorage } from './storage.js';
import { showNotice, generateId, formatTime, safeOn } from './utils.js';
import { currentUser } from './auth.js';
import { showFeed } from './navigation.js';

// Load stored array of hostels from localStorage; default to empty array if missing
export let hostels = loadFromStorage("hostels", []);

// Tracks which hostel cards are expanded to show all reviews
const expandedHostels = new Set();

// Current filter criteria for hostels
let currentHostelFilters = {
  hostelName: ''
};

// Current hostel being edited, or null if adding a new hostel
let editingHostelId = null;

const hostelImageFields = [
  { inputId: 'h-image-front', previewId: 'h-image-preview-front' },
  { inputId: 'h-image-compound', previewId: 'h-image-preview-compound' },
  { inputId: 'h-image-room', previewId: 'h-image-preview-room' }
];

function getFormValue(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function updateFormText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function getHostelFormImages() {
  return hostelImageFields
    .map(field => document.getElementById(field.previewId)?.src || '')
    .filter(src => src);
}

function clearHostelFormImages() {
  hostelImageFields.forEach(field => {
    const preview = document.getElementById(field.previewId);
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
    const input = document.getElementById(field.inputId);
    if (input) input.value = '';
  });
}

function setHostelFormImages(images = []) {
  hostelImageFields.forEach((field, index) => {
    const preview = document.getElementById(field.previewId);
    if (preview) {
      if (images[index]) {
        preview.src = images[index];
        preview.classList.remove('hidden');
      } else {
        preview.src = '';
        preview.classList.add('hidden');
      }
    }
  });
}

function getHostelImages(hostel) {
  if (hostel.images && hostel.images.length) return hostel.images;
  if (hostel.image) return [hostel.image];
  return [];
}

export function resetHostelForm() {
  editingHostelId = null;
  updateFormText('hostel-form-title', 'Add New Hostel');
  updateFormText('btn-submit-hostel', 'Add Hostel');

  ['h-name', 'h-location', 'h-landmark', 'h-light', 'h-water', 'h-security', 'h-directions'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  clearHostelFormImages();
}

function buildHostelData() {
  return {
    name: getFormValue('h-name'),
    location: getFormValue('h-location'),
    landmark: getFormValue('h-landmark'),
    light: getFormValue('h-light'),
    water: getFormValue('h-water'),
    security: getFormValue('h-security'),
    directions: getFormValue('h-directions'),
    images: getHostelFormImages(),
    verified: false
  };
}

function createHostel(hostelData) {
  const hostel = {
    id: generateId(),
    ...hostelData,
    addedBy: currentUser?.phone || 'guest',
    createdAt: Date.now(),
    ratings: [],
    reviews: []
  };

  hostels.push(hostel);
  saveToStorage('hostels', hostels);
  showNotice('Hostel added successfully!', { type: 'success' });
  renderHostels();
  resetHostelForm();
  setTimeout(() => showFeed(), 800);
}

function updateHostel(hostelId, hostelData) {
  const hostel = hostels.find(h => String(h.id) === String(hostelId));
  if (!hostel) {
    showNotice('Hostel not found for edit.', { type: 'error' });
    return;
  }

  Object.assign(hostel, {
    ...hostelData,
    verified: hostel.verified || false,
    addedBy: hostel.addedBy || currentUser?.phone || 'guest',
    createdAt: hostel.createdAt || Date.now(),
    ratings: hostel.ratings || [],
    reviews: hostel.reviews || []
  });

  saveToStorage('hostels', hostels);
  showNotice('Hostel updated successfully!', { type: 'success' });
  renderHostels();
  resetHostelForm();
  setTimeout(() => showFeed(), 500);
}

export function openEditHostel(hostelId) {
  const hostel = hostels.find(h => String(h.id) === String(hostelId));
  if (!hostel) return;
  if (!currentUser || currentUser.phone !== hostel.addedBy) {
    showNotice('Only the original uploader can edit this hostel.', { type: 'warn' });
    return;
  }

  editingHostelId = hostelId;
  updateFormText('hostel-form-title', 'Edit Hostel');
  updateFormText('btn-submit-hostel', 'Save Changes');

  const fieldValues = {
    'h-name': hostel.name,
    'h-location': hostel.location,
    'h-landmark': hostel.landmark,
    'h-light': hostel.light,
    'h-water': hostel.water,
    'h-security': hostel.security,
    'h-directions': hostel.directions
  };

  Object.entries(fieldValues).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  });

  setHostelFormImages(getHostelImages(hostel));

  ['feed-section', 'search-section', 'flyer-section', 'hostel-feed'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const hostelSection = document.getElementById('hostel-section');
  if (hostelSection) hostelSection.classList.remove('hidden');
  const returnBtn = document.getElementById('btn-hostel-return');
  if (returnBtn) returnBtn.classList.remove('hidden');
}

export function handleHostelSubmit() {
  const hostelData = buildHostelData();
  if (!hostelData.name || !hostelData.location || !hostelData.light || !hostelData.water || !hostelData.security) {
    showNotice('Please fill all required fields', { type: 'warn' });
    return;
  }

  if (editingHostelId) {
    updateHostel(editingHostelId, hostelData);
    editingHostelId = null;
  } else {
    createHostel(hostelData);
  }
}

export function reportHostel(hostelId) {
  const hostel = hostels.find(h => String(h.id) === String(hostelId));
  if (!hostel) return;

  const reason = window.prompt('Report reason (Fake hostel, Wrong location, Wrong picture, Other):');
  if (!reason || !reason.trim()) return;

  const reports = loadFromStorage('hostelReports', []);
  reports.push({
    id: generateId(),
    hostelId: hostel.id,
    hostelName: hostel.name,
    reporterPhone: currentUser?.phone || 'guest',
    reporterName: currentUser?.name || 'Guest',
    reason: reason.trim(),
    status: 'pending',
    time: Date.now()
  });
  saveToStorage('hostelReports', reports);
  showNotice('Report received — admin review pending.', { type: 'success' });
}

/**
 * Opens the hostel profile modal to show full details and summary reviews.
 */
export function initHostelFilters() {
  const locationInput = document.getElementById("h-search-location");

  if (locationInput) {
    locationInput.addEventListener("input", runHostelSearch);
  }
}

/**
 * Runs hostel filtering based on the current filter input values.
 */
export function runHostelSearch() {
  const hostelName = (document.getElementById("h-search-location")?.value || "").toLowerCase().trim();

  currentHostelFilters = { hostelName };

  const filtered = hostels.filter(h => {
    const matchesName = !hostelName || h.name.toLowerCase().includes(hostelName);
    return matchesName;
  });

  renderHostels(filtered);
}

/**
 * Opens the hostel profile modal to show full details and summary reviews.
 */
export function openHostelProfile(hostelId) {
  const hostel = hostels.find(h => String(h.id) === String(hostelId));
  const container = document.getElementById("hostel-profile-content");
  const modal = document.getElementById("hostel-profile-modal");
  if (!hostel || !container || !modal) return;

  const avgRating = hostel.ratings && hostel.ratings.length
    ? (hostel.ratings.reduce((sum, val) => sum + val, 0) / hostel.ratings.length).toFixed(1)
    : "No rating";

  const imageGallery = getHostelImages(hostel).map(src => `
      <img src="${src}" alt="${hostel.name}" style="width:100%;border-radius:12px;object-fit:cover;margin-bottom:14px;max-height:220px;" />
    `).join("");

  const reviewsHtml = (hostel.reviews || []).map(review => {
    const reviewer = review.user || "Guest";
    const timeDisplay = review.time ? formatTime(review.time) : "";
    const replyHtml = (review.replies || []).map(reply => `
          <div class="reply-item" style="margin-left:18px;margin-top:8px;padding:8px 10px;background:#eef2ff;border-radius:10px;">
            <strong>${reply.user || 'Guest'}</strong>
            <p style="margin:6px 0 0;">${reply.text}</p>
          </div>
        `).join("");

    return `
      <div class="review-item" style="flex-direction:column;align-items:flex-start;">
        <div style="display:flex;justify-content:space-between;width:100%;gap:10px;">
          <span><strong>${reviewer}</strong></span>
          <span class="review-time">${timeDisplay}</span>
        </div>
        <p style="margin:8px 0 0;">${review.text}</p>
        ${replyHtml}
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="card" style="padding:18px;">
      ${imageGallery || '<p class="empty-state">No hostel images available.</p>'}
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
        <h2 style="margin:0;">${hostel.name}</h2>
        ${hostel.verified ? '<span style="padding:4px 8px;background:#0b3d91;color:white;border-radius:999px;font-size:12px;">Verified</span>' : ''}
      </div>
      <p><strong>Location:</strong> ${hostel.location}</p>
      <p><strong>Landmark:</strong> ${hostel.landmark}</p>
      <p><strong>Water:</strong> ${hostel.water}</p>
      <p><strong>Light:</strong> ${hostel.light}</p>
      <p><strong>Security:</strong> ${hostel.security}</p>
      <p><strong>Directions:</strong> ${hostel.directions}</p>
      <p><strong>Average rating:</strong> ${avgRating} ⭐</p>
      <div style="margin-top:18px;">
        <h3>Recent reviews</h3>
        ${reviewsHtml || '<p class="empty-state">No reviews yet for this hostel.</p>'}
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}


/**
 * Renders all hostel records into the hostel list feed DOM container element.
 */
export function renderHostels(hostelsToRender = hostels) {
  const list = document.getElementById("hostel-list");
  if (!list) return;
  list.innerHTML = ""; // Clear existing hostel list container

  // If no hostels exist in the selected list, display friendly empty-state message
  if (!hostelsToRender || hostelsToRender.length === 0) {
    list.innerHTML = '<p class="empty-state">No hostels match your filters — try relaxing the criteria.</p>';
    return;
  }

  // Iterate through each hostel item in array
  hostelsToRender.forEach(h => {
    // Calculate average star rating score
    const avgRating = h.ratings && h.ratings.length
      ? (h.ratings.reduce((a, b) => a + b, 0) / h.ratings.length).toFixed(1)
      : "No rating";

    // Create wrapper element for hostel card
    const div = document.createElement("div");
    div.className = "flyer"; // Reuse card layout styling

    // Determine whether this card is expanded to show all reviews
    const expanded = expandedHostels.has(String(h.id));

    // Build reviews HTML (either the latest 3 or all reviews when expanded)
    const reviewsToShow = (h.reviews || []).slice(0, expanded ? (h.reviews || []).length : 3);
    const reviewsHtml = reviewsToShow.map(r => {
      const isOldReview = typeof r === 'string'; // Support legacy string reviews
      const reviewId = isOldReview ? null : (r.id || null);
        const user = isOldReview ? "Guest" : (r.user || "Guest");
        const text = isOldReview ? r : r.text;
        const initial = user.charAt(0).toUpperCase();
        const timeDisplay = isOldReview ? "" : formatTime(r.time);

        // Build nested replies HTML (if any)
        const repliesHtml = (!isOldReview && r.replies && r.replies.length)
          ? r.replies.map(rep => {
              const ru = rep.user || 'Guest';
              const rt = rep.text || rep;
              return `<div class="reply-item" style="margin-left:42px;margin-top:6px;padding:6px 10px;background:#ffffff;border-radius:8px;border:1px solid #e6eef8;font-size:13px;">` +
                     `<div style="font-weight:600;color:#0b3d91;margin-bottom:4px;">${ru}</div>` +
                     `<div>${rt}</div>` +
                     `</div>`;
            }).join('')
          : '';

        return `
              <div class="review-item" style="display:flex;gap:10px;align-items:flex-start;background:#f1f5f9;padding:8px 12px;border-radius:12px;max-width:95%;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div class="review-avatar" style="width:32px;height:32px;border-radius:50%;background:#0b3d91;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">${initial}</div>
                <div class="review-content" style="flex:1;">
                  <div class="review-header" style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                    <span class="review-user">${user}</span>
                    <span class="review-time">${timeDisplay}</span>
                  </div>
                    <p class="review-text" style="margin:0;font-size:14px;">${text}</p>
                    ${repliesHtml}
                    ${isOldReview ? '' : `<div style="margin-top:6px;"><button class="reply-btn-inline" data-hostel="${h.id}" data-review="${reviewId}" style="font-size:12px;padding:6px 8px;border-radius:6px;background:transparent;border:1px solid #cfe0ff;color:#0b3d91;">Reply</button></div>${reviewId ? `<div id="reply-container-${h.id}-${reviewId}"></div>` : `<div id="reply-container-${h.id}"></div>`}`}
                </div>
              </div>
            `;
    }).join("");

    const imageArray = getHostelImages(h);
    const imageHtml = imageArray.length
      ? `<img src="${imageArray[0]}" class="flyer-hostel-img" alt="${h.name}" />`
      : '';
    const verifiedBadge = h.verified ? '<span style="padding:4px 8px;background:#0b3d91;color:white;border-radius:999px;font-size:12px;">Verified</span>' : '';
    div.innerHTML = `
      ${imageHtml}
      <div class="flyer-content">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <h3 style="margin:0;">${h.name}</h3>
          ${verifiedBadge}
        </div>
        <p><b>Location:</b> ${h.location}</p>
        <p><b>Landmark:</b> ${h.landmark}</p>
        <p><b>Light:</b> ${h.light}</p>
        <p><b>Water:</b> ${h.water}</p>
        <p><b>Security:</b> ${h.security}</p>
        <p><b>Directions:</b> ${h.directions}</p>
        <p><b>Rating:</b> ${avgRating} ⭐</p>

        <div class="rating-box" style="margin-bottom:10px;">
          <span>Rate:</span>
          <button data-rate="1">1⭐</button>
          <button data-rate="2">2⭐</button>
          <button data-rate="3">3⭐</button>
          <button data-rate="4">4⭐</button>
          <button data-rate="5">5⭐</button>
        </div>
        <div class="review-box" style="margin-bottom:12px;">
          <input id="review-input-${h.id}" placeholder="Write a comment..." class="review-input" style="flex:1;min-width:0;" />
          <button data-id="${h.id}" class="btn-add-review">Post</button>
        </div>

        <div class="reviews" style="margin-top:8px;display:flex;flex-direction:column;gap:10px;">
          ${reviewsHtml}
        </div>
      </div>
    `;

    // Append card to document before attaching handlers so getElementById() works
    const actionContainer = document.createElement('div');
    actionContainer.className = 'flyer-actions';

    const detailsButton = document.createElement('button');
    detailsButton.className = 'success';
    detailsButton.textContent = 'View Details';
    detailsButton.onclick = () => openHostelProfile(h.id);
    actionContainer.appendChild(detailsButton);

    const reportButton = document.createElement('button');
    reportButton.textContent = 'Report';
    reportButton.style.background = '#f97316';
    reportButton.style.color = 'white';
    reportButton.style.border = 'none';
    reportButton.style.borderRadius = '6px';
    reportButton.style.padding = '8px 12px';
    reportButton.onclick = () => reportHostel(h.id);
    actionContainer.appendChild(reportButton);

    if (currentUser && currentUser.phone === h.addedBy) {
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.style.background = '#2563eb';
      editButton.style.color = 'white';
      editButton.style.border = 'none';
      editButton.style.borderRadius = '6px';
      editButton.style.padding = '8px 12px';
      editButton.onclick = () => openEditHostel(h.id);
      actionContainer.appendChild(editButton);
    }

    const showMoreBtn = document.createElement('button');
    showMoreBtn.className = 'show-more-btn';
    showMoreBtn.textContent = expanded ? 'Show Less' : `Show More (${h.reviews?.length || 0})`;
    showMoreBtn.dataset.hostelId = h.id;
    showMoreBtn.style.marginTop = '0';
    showMoreBtn.onclick = () => {
      const key = String(h.id);
      if (expandedHostels.has(key)) {
        expandedHostels.delete(key);
      } else {
        expandedHostels.add(key);
      }
      renderHostels();
    };
    actionContainer.appendChild(showMoreBtn);

    const flyerContent = div.querySelector('.flyer-content');
    if (flyerContent) flyerContent.appendChild(actionContainer);
    list.appendChild(div);

    // Attach click handler for review submission button inside hostel card
    const addReviewBtn = div.querySelector(".btn-add-review");
    if (addReviewBtn) {
      addReviewBtn.addEventListener("click", () => {
        const input = div.querySelector(".review-input");
        const text = input ? input.value : "";
        addReview(h.id, text);
        if (input) input.value = "";
      });
    }

    // Attach click handlers for rating star buttons
    div.querySelectorAll("[data-rate]").forEach(rateBtn => {
      rateBtn.onclick = () => {
        const rating = Number(rateBtn.dataset.rate);
        addRating(h.id, rating);
      };
    });

    // Attach inline reply button handlers (for per-review replies)
    div.querySelectorAll(".reply-btn-inline").forEach(btn => {
      btn.onclick = () => {
        const reviewId = btn.dataset.review;
        const rid = reviewId || null;
        showReplyBox(h.id, rid);
      };
    });
  });
}

/**
 * Displays all reviews for a hostel inside a modal dialog window.
 * 
 * @param {string} hostelId - Target hostel ID string
 */
export function showAllReviews(hostelId) {
  // Search hostels array for matching hostel record ID
  const hostel = hostels.find(h => String(h.id) === String(hostelId));
  if (!hostel) return;

  const container = document.getElementById("all-reviews-container");
  if (!container) return;

  container.innerHTML = ""; // Clear existing modal reviews content
  // If no reviews exist, show friendly empty-state message
  if (!hostel.reviews || hostel.reviews.length === 0) {
    container.innerHTML = '<p class="empty-state">No reviews yet — be the first to share your experience</p>';
    const modal = document.getElementById("review-modal");
    if (modal) modal.classList.remove("hidden");
    return;
  }

  // Iterate over all reviews of this hostel
  (hostel.reviews || []).forEach(review => {
    const reviewId = review.id || null;
    const user = review.user || "Guest";
    const text = review.text || review;

    const div = document.createElement("div");
    div.className = "review-item";

    div.innerHTML = `
      <div class="review-avatar">
        ${user.charAt(0).toUpperCase()}
      </div>
      <div class="review-content">
        <b>${user}</b>
        <p>${text}</p>
        ${reviewId ? `<button class="reply-btn" data-review-id="${reviewId}" data-reply-hostel="${hostelId}">Reply</button><div id="reply-container-${hostelId}-${reviewId}"></div>` : `<div id="reply-container-${hostelId}"></div>`}
      </div>
    `;

    const replyBtn = div.querySelector(".reply-btn");
    if (replyBtn) {
      const rid = replyBtn.dataset.reviewId || null;
      replyBtn.onclick = () => showReplyBox(hostelId, rid);
    }

    container.appendChild(div);
  });

  // Reveal review modal overlay element
  const modal = document.getElementById("review-modal");
  if (modal) modal.classList.remove("hidden");
}

/**
 * Creates an inline reply input box for hostel review items.
 * 
 * @param {string} hostelId - Target hostel ID string
 */
export function showReplyBox(hostelId, reviewId) {
  const containerId = reviewId ? `reply-container-${hostelId}-${reviewId}` : `reply-container-${hostelId}`;
  const container = document.getElementById(containerId);
  if (!container) return;

  // Toggle reply box view
  if (container.innerHTML !== "") {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div style="display:flex;gap:6px;margin-top:6px;">
      <input id="reply-input-${hostelId}-${reviewId || 'root'}" placeholder="Write a reply..." style="flex:1;padding:4px 8px;font-size:12px;border:1px solid #ccc;border-radius:4px;" />
      <button id="reply-submit-${hostelId}-${reviewId || 'root'}" style="padding:4px 8px;font-size:12px;background:#0b3d91;color:white;border:none;border-radius:4px;cursor:pointer;">Send</button>
    </div>
  `;

  const sendBtn = document.getElementById(`reply-submit-${hostelId}-${reviewId || 'root'}`);
  if (sendBtn) {
    sendBtn.onclick = () => {
      const input = document.getElementById(`reply-input-${hostelId}-${reviewId || 'root'}`);
      if (input && input.value.trim()) {
        addReview(hostelId, input.value.trim(), reviewId);
        container.innerHTML = "";
      }
    };
  }
}

/**
 * Adds a new review comment to a hostel record and updates storage and UI.
 * 
 * @param {string} hostelId - Target hostel ID
 * @param {string} text - Review comment text
 */
export function addReview(hostelId, text, parentReviewId) {
  if (!text || !text.trim()) return;

  const hostel = hostels.find(h => String(h.id) === String(hostelId));
  if (!hostel) return;

  // Create review data item (top-level or reply)
  const review = {
    id: generateId(),
    user: currentUser?.name || "Guest",
    text: text.trim(),
    time: Date.now(),
    replies: []
  };

  if (parentReviewId) {
    // Find parent review and append as a reply
    const parent = hostel.reviews.find(r => r.id === parentReviewId);
    if (parent) {
      parent.replies = parent.replies || [];
      parent.replies.push(review);
    } else {
      // Parent not found, fallback to top-level
      hostel.reviews.push(review);
    }
  } else {
    hostel.reviews.push(review);
  }

  saveToStorage("hostels", hostels); // Persist updated array to storage

  renderHostels(); // Re-render hostel listing
  showNotice("Review added 💬", { type: "success" });
}

/**
 * Submits a review entered in a specific hostel review input box.
 * 
 * @param {string} hostelId - Target hostel ID
 */
export function submitReview(hostelId) {
  const input = document.getElementById(`review-input-${hostelId}`);
  if (!input) return;

  const text = input.value;
  addReview(hostelId, text);
  input.value = ""; // Clear input text field
}

/**
 * Adds a star rating score to a hostel record and saves to storage.
 * 
 * @param {string} hostelId - Target hostel ID
 * @param {number} rating - Numeric star rating score (1-5)
 */
export function addRating(hostelId, rating) {
  const hostel = hostels.find(h => String(h.id) === String(hostelId));
  if (!hostel) return;

  hostel.ratings.push(rating); // Push rating score to ratings array
  saveToStorage("hostels", hostels); // Save to storage

  renderHostels(); // Re-render hostels feed
  showNotice("Rating added ⭐", { type: "success" });
}
