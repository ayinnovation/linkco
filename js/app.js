// ==========================================
// 🚀 LINKCO APPLICATION MAIN ENTRY POINT (app.js)
// Connects all specialized sub-modules (DOM, Storage, Utils, Auth, Navigation,
// ImagePreview, Flyers, Hostels, Search, Admin), binds DOM event listeners,
// exposes window-scoped functions for inline HTML event handlers, and initializes app.
// ==========================================

// --- MODULE IMPORTS ---
// Import DOM element references
import {
  adminSection, authSection, btnAddHostelNav, btnCancelCreate, btnContinueGuest,
  btnCreateFlyer, btnExitAdmin, btnHostelReturn, btnLogin, btnLogout, btnPayCreate,
  btnRegister, btnReturnHome, btnSearch, btnShowLogin, btnShowRegister,
  feedSection, hostelFeed, hostelSection, navGuest, navUser,
  searchSection, sBtnReturnHome, showHiddenFlyersBtn, tabFlyers, tabHostels, upgradeBtn,
  hSearchLocation,
  hostelProfileModal, hostelProfileContent, closeHostelProfileModal
} from './js/dom.js';

// Import authentication and session functions
import { currentUser, registerUser, loginUser, upgradeUser, autoSaveForms, restoreFormData, setCurrentUser, logoutUser } from './js/auth.js';

// Import navigation view functions
import { showAuth, showRegister, showLogin, showFeed, showCreateFlyer, showSearch, showAdminDashboard } from './js/navigation.js';

// Import utility functions
import { showLoader, hideLoader, withLoader, safeOn, showNetworkStatus, showNotice } from './js/utils.js';

// Import image preview handler
import { handleImagePreview } from './js/imagePreview.js';

// Import flyer management functions
import { createFlyer, renderFeed, pullDownFlyer, deleteFlyer, restoreFlyer, renderHiddenFlyers, requestPayment } from './js/flyers.js';

// Import hostel management functions
import { resetHostelForm, handleHostelSubmit, renderHostels, showAllReviews, addReview, submitReview, addRating, showReplyBox, initHostelFilters, runHostelSearch } from './js/hostels.js';

// Import search functions and slider initializer
import { initSearchSliders, runSearchLive } from './js/search.js';
// Import admin dashboard functions
import { renderAdminRequests, renderAdminAnalytics, approveRequest, rejectRequest, renderNotifications, clearNotification } from './js/admin.js';

// ==========================================
// 🌐 GLOBAL WINDOW BINDINGS
// Attach functions to the global `window` object so inline HTML `onclick="..."` event handlers resolve properly.
// ==========================================
window.showFeed = showFeed; // Exposed for <button onclick="showFeed()">
window.showAllReviews = showAllReviews; // Exposed for inline show all reviews buttons
window.showReplyBox = showReplyBox; // Exposed for inline review reply buttons
window.pullDownFlyer = pullDownFlyer; // Exposed for inline pull down buttons
window.deleteFlyer = deleteFlyer; // Exposed for inline delete buttons
window.restoreFlyer = restoreFlyer; // Exposed for inline restore buttons
window.requestPayment = requestPayment; // Exposed for inline join/payment buttons

// ==========================================
// 📸 INITIALIZE IMAGE PREVIEW LISTENERS
// Wire up file input fields with corresponding <img> preview thumbnails.
// ==========================================
handleImagePreview("reg-student-doc", "student-doc-preview"); // Student verification doc preview
handleImagePreview("f-hostel-image", "hostel-image-preview");  // Hostel flyer image preview
handleImagePreview("f-profile-image", "profile-image-preview"); // User profile image preview
handleImagePreview("h-image-front", "h-image-preview-front");   // Add hostel front image preview
handleImagePreview("h-image-compound", "h-image-preview-compound"); // Add hostel compound image preview
handleImagePreview("h-image-room", "h-image-preview-room");      // Add hostel room image preview

// ==========================================
// 🔌 REGISTER UI EVENT LISTENERS
// ==========================================

// Switch view tabs: Roommates Feed tab
safeOn(tabFlyers, "click", () => {
  tabFlyers.classList.add("active");
  tabHostels.classList.remove("active");
  feedSection.classList.remove("hidden");
  hostelFeed.classList.add("hidden");
});

// Switch view tabs: Hostels Feed tab
safeOn(tabHostels, "click", () => {
  tabHostels.classList.add("active");
  tabFlyers.classList.remove("active");
  feedSection.classList.add("hidden");
  hostelFeed.classList.remove("hidden");
  renderHostels();
});

// Navigation button to open "Add Hostel" form
safeOn(btnAddHostelNav, "click", () => {
  feedSection.classList.add("hidden");
  searchSection.classList.add("hidden");
  flyerSection.classList.add("hidden");
  hostelFeed.classList.add("hidden");
  resetHostelForm();
  hostelSection.classList.remove("hidden");
  if (btnHostelReturn) btnHostelReturn.classList.remove("hidden");
});

// Submit button in Hostel creation form
const btnSubmitHostel = document.getElementById("btn-submit-hostel");
safeOn(btnSubmitHostel, "click", handleHostelSubmit);

// Return button inside Hostel form
safeOn(btnHostelReturn, "click", () => {
  showFeed();
});

// Exit button in Admin dashboard
safeOn(btnExitAdmin, "click", () => {
  if (adminSection) adminSection.classList.add("hidden");
  if (authSection) authSection.classList.remove("hidden");
});

// Navigation buttons with simulated loading spinners
safeOn(btnShowLogin, "click", () => {
  showLoader();
  setTimeout(() => {
    showLogin();
    hideLoader();
  }, 1200);
});

safeOn(btnShowRegister, "click", () => {
  showLoader();
  setTimeout(() => {
    showRegister();
    hideLoader();
  }, 1200);
});

safeOn(btnLogout, "click", () => {
  showLoader();
  setTimeout(() => {
    logoutUser();
    hideLoader();
  }, 1200);
});

safeOn(btnLogin, "click", () => {
  showLoader();
  setTimeout(() => {
    loginUser();
    hideLoader();
  }, 1200);
});

safeOn(upgradeBtn, "click", () => {
  showLoader();
  setTimeout(() => {
    upgradeUser();
    hideLoader();
  }, 1200);
});

safeOn(btnRegister, "click", () => {
  showLoader();
  setTimeout(() => {
    registerUser();
    hideLoader();
  }, 1200);
});

// Navigation button to open Create Flyer view
safeOn(btnCreateFlyer, "click", () => {
  withLoader(showCreateFlyer);
});

// Navigation button to open Search view
safeOn(btnSearch, "click", () => {
  showLoader();
  setTimeout(() => {
    showSearch();
    hideLoader();
  }, 1200);
});

// Return Home buttons
safeOn(btnReturnHome, "click", () => {
  showLoader();
  setTimeout(() => {
    showFeed();
    hideLoader();
  }, 1200);
});

safeOn(sBtnReturnHome, "click", () => {
  showLoader();
  setTimeout(() => {
    showFeed();
    hideLoader();
  }, 1200);
});

// Cancel Flyer Creation button
if (btnCancelCreate) {
  btnCancelCreate.addEventListener("click", () => {
    showLoader();
    setTimeout(() => {
      showFeed();
      hideLoader();
    }, 1200);
  });
}

// Show Hidden Flyers button
safeOn(showHiddenFlyersBtn, "click", () => {
  showLoader();
  setTimeout(() => {
    renderHiddenFlyers();
    if (feedSection) feedSection.classList.add("hidden");
    const hiddenFlyersSection = document.getElementById("hidden-flyers-section");
    if (hiddenFlyersSection) hiddenFlyersSection.style.display = "block";
    hideLoader();
  }, 1200);
});

// Close Review Modal button listener
const closeReviewModalBtn = document.getElementById("close-review-modal");
if (closeReviewModalBtn) {
  closeReviewModalBtn.addEventListener("click", () => {
    const modal = document.getElementById("review-modal");
    if (modal) modal.classList.add("hidden");
  });
}

// Close Hostel Profile Modal button listener
if (closeHostelProfileModal) {
  closeHostelProfileModal.addEventListener("click", () => {
    if (hostelProfileModal) hostelProfileModal.classList.add("hidden");
  });
}

// Guest mode continuation handler
if (btnContinueGuest) {
  safeOn(btnContinueGuest, 'click', () => {
    // Establish temporary guest session state
    setCurrentUser({ id: 'guest', name: 'Guest', phone: '', isGuest: true });

    showNotice('Browsing as guest — some actions are disabled.', { type: 'info' });
    showFeed();
  });
}

// Offline and Online network connection status listeners
window.addEventListener("offline", () => {
  showNetworkStatus("⚠️ You are offline. Some features may not work.", false);
});

window.addEventListener("online", () => {
  showNetworkStatus("✅ You are back online.", true);
});

// Pay & Create Flyer submit button listener attached on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  safeOn(btnPayCreate, "click", () => {
    withLoader(createFlyer);
  });
});

// ==========================================
// 🔄 APPLICATION INITIALIZATION
// Initialize form memory state, search range sliders, and active view state.
// ==========================================

// Attach automatic form input saving listeners
autoSaveForms();

// Restore saved form values from localStorage
restoreFormData();

// Initialize range slider sync and search listeners
initSearchSliders();

// Initialize hostel filter listeners and render the current hostel list
initHostelFilters();
runHostelSearch();

// Check initial session state to direct user to Feed or Auth view
if (currentUser) {
  renderHostels();
  showFeed();
} else {
  showAuth();
}