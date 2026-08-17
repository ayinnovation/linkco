// ==========================================
// 🧭 NAVIGATION & SECTION CONTROL MODULE (js/navigation.js)
// Controls visibility state of main layout sections (Auth, Feed, Flyer Creation,
// Search, Hostels, Admin Dashboard) and user header elements.
// ==========================================

import { 
  authSection, registerForm, loginForm, guestWelcome, feedSection, 
  flyerSection, searchSection, hostelSection, hostelFeed, navGuest, 
  navUser, welcomeUser, btnCreateFlyer, hiddenFlyersSection, adminSection, 
  btnReturnHome, sBtnReturnHome 
} from './dom.js';
import { currentUser } from './auth.js';
import { renderFeed } from './flyers.js';
import { renderHostels } from './hostels.js';
import { renderAdminAnalytics, renderAdminRequests } from './admin.js';
import { runSearchLive } from './search.js';
import { showNotice } from './utils.js';

/**
 * Displays authentication section and guest welcome card; hides all internal application feeds.
 */
export function showAuth() {
  if (authSection) authSection.classList.remove("hidden"); // Reveal auth card section
  if (registerForm) registerForm.classList.add("hidden"); // Hide registration form
  if (loginForm) loginForm.classList.add("hidden"); // Hide login form
  if (guestWelcome) guestWelcome.classList.remove("hidden"); // Reveal guest welcome card

  if (feedSection) feedSection.classList.add("hidden"); // Hide public flyers feed
  if (flyerSection) flyerSection.classList.add("hidden"); // Hide flyer creation section
  if (searchSection) searchSection.classList.add("hidden"); // Hide roommate search section
  if (hostelFeed) hostelFeed.classList.add("hidden"); // Hide hostel listing feed
  if (navGuest) navGuest.classList.remove("hidden"); // Show guest header navigation links
  if (navUser) navUser.classList.add("hidden"); // Hide logged-in user navigation bar
  if (adminSection) adminSection.classList.add("hidden"); // Hide admin dashboard section
}

/**
 * Displays the user registration form and hides guest welcome card and login form.
 */
export function showRegister() {
  if (guestWelcome) guestWelcome.classList.add("hidden"); // Hide guest welcome card
  if (registerForm) registerForm.classList.remove("hidden"); // Reveal registration form
  if (loginForm) loginForm.classList.add("hidden"); // Hide login form
}

/**
 * Displays the user login form and hides guest welcome card and registration form.
 */
export function showLogin() {
  if (guestWelcome) guestWelcome.classList.add("hidden"); // Hide guest welcome card
  if (registerForm) registerForm.classList.add("hidden"); // Hide registration form
  if (loginForm) loginForm.classList.remove("hidden"); // Reveal login form
}

/**
 * Main function to switch view to the public feed section showing active roommate flyers.
 */
export function showFeed() {
  if (hiddenFlyersSection) hiddenFlyersSection.classList.add("hidden"); // Hide pulled-down flyers list
  if (authSection) authSection.classList.add("hidden"); // Hide auth section card
  if (feedSection) feedSection.classList.remove("hidden"); // Reveal main feed section
  if (flyerSection) flyerSection.classList.add("hidden"); // Hide flyer creation section
  if (searchSection) searchSection.classList.add("hidden"); // Hide search section
  if (hostelSection) hostelSection.classList.add("hidden"); // Hide hostel form section

  if (navGuest) navGuest.classList.add("hidden"); // Hide guest navigation header
  if (navUser) navUser.classList.remove("hidden"); // Reveal user header navigation bar

  // Display user welcome greeting text depending on active session state
  if (welcomeUser) {
    if (currentUser && currentUser.isGuest) {
      welcomeUser.textContent = 'Welcome, Guest!';
    } else if (currentUser) {
      welcomeUser.textContent = `Welcome, ${currentUser.name}!`;
    } else {
      welcomeUser.textContent = '';
    }
  }

  // Hide or display Create Flyer button based on guest status
  if (currentUser && currentUser.isGuest) {
    if (btnCreateFlyer) btnCreateFlyer.style.display = 'none'; // Hide for guest
  } else {
    if (btnCreateFlyer) btnCreateFlyer.style.display = ''; // Show for logged-in user
  }

  // Re-render feed elements with latest data
  renderFeed();
}

/**
 * Switches UI view to the flyer creation form section.
 */
export function showCreateFlyer() {
  // Prevent guest users from accessing the create flyer form view
  if (currentUser && currentUser.isGuest) {
    showNotice('Please register or login to create a flyer.', { type: 'warn' });
    return;
  }

  if (hostelSection) hostelSection.classList.add("hidden"); // Hide hostel form section
  if (hostelFeed) hostelFeed.classList.add("hidden"); // Hide hostel feed section
  if (feedSection) feedSection.classList.add("hidden"); // Hide main feed section
  if (flyerSection) flyerSection.classList.remove("hidden"); // Reveal flyer creation section
  if (btnReturnHome) btnReturnHome.classList.remove("hidden"); // Show return home button
  if (sBtnReturnHome) sBtnReturnHome.classList.add("hidden"); // Hide search return home button
  if (searchSection) searchSection.classList.add("hidden"); // Hide search section
}

/**
 * Switches UI view to the roommate search interface and triggers live search execution.
 */
export function showSearch() {
  if (hostelSection) hostelSection.classList.add("hidden"); // Hide hostel form section
  if (hostelFeed) hostelFeed.classList.add("hidden"); // Hide hostel feed section
  if (feedSection) feedSection.classList.remove("hidden"); // Reveal main feed section
  if (searchSection) searchSection.classList.remove("hidden"); // Reveal search filter panel
  if (sBtnReturnHome) sBtnReturnHome.classList.remove("hidden"); // Show filter close button
  if (btnReturnHome) btnReturnHome.classList.add("hidden"); // Hide main return home button
  if (flyerSection) flyerSection.classList.add("hidden"); // Hide flyer creation section

  // Trigger live search computation to refresh the feed based on filters
  runSearchLive();
}

/**
 * Displays the administrator dashboard view for authorized admin accounts.
 */
export function showAdminDashboard() {
  // Check if current logged-in user possesses administrative privileges
  if (!currentUser || currentUser.role !== "admin") {
    showNotice("Unauthorized access", { type: "error" });
    return;
  }

  if (authSection) authSection.classList.add("hidden"); // Hide auth section
  if (feedSection) feedSection.classList.add("hidden"); // Hide feed section
  if (flyerSection) flyerSection.classList.add("hidden"); // Hide flyer creation section
  if (searchSection) searchSection.classList.add("hidden"); // Hide search section
  if (navGuest) navGuest.classList.add("hidden"); // Hide guest navigation header
  if (hostelFeed) hostelFeed.classList.add("hidden"); // Hide hostel feed section
  if (hostelSection) hostelSection.classList.remove("hidden"); // Show hostel section if needed

  // Render hostel feed elements
  renderHostels();

  // Reveal administrator dashboard container section
  if (adminSection) adminSection.classList.remove("hidden");

  // Render admin analytics statistics cards and payment requests table
  renderAdminAnalytics();
  renderAdminRequests();
}
