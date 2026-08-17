// ==========================================
// 📌 DOM ELEMENTS MODULE (js/dom.js)
// This file gathers and exports references to all HTML DOM elements
// used throughout the LinkCo application for clean interaction.
// ==========================================

// --- ADMIN SECTION ELEMENTS ---
// Main container section for the admin dashboard
export const adminSection = document.getElementById("admin-section");

// Container div where payment requests from users are rendered for the admin
export const adminRequestsDiv = document.getElementById("admin-req");

// Button used by non-admin users to upgrade their account subscription
export const upgradeBtn = document.getElementById("btn-upgrade");

// --- NAVIGATION BAR ELEMENTS ---
// Navigation bar visible to unauthenticated / guest users
export const navGuest = document.getElementById("nav-guest");

// Navigation bar visible when a user is logged in
export const navUser = document.getElementById("nav-user");

// Text element displaying welcome message for the logged-in user
export const welcomeUser = document.getElementById("welcome-user");

// --- AUTHENTICATION & FORM ELEMENTS ---
// Checkbox in registration form to specify if user is a student
export const studentCb = document.getElementById("reg-is-student");

// Wrapper container form for registering a new user account
export const registerForm = document.getElementById("register-form");

// Wrapper container form for logging into an existing account
export const loginForm = document.getElementById("login-form");

// Welcome card displayed to guest users before registering or logging in
export const guestWelcome = document.getElementById("guest-welcome");

// Outer section holding all authentication-related forms and cards
export const authSection = document.getElementById("auth-section");

// Section displaying flyers that have been pulled down/hidden by the owner
export const hiddenFlyersSection = document.getElementById("hidden-flyers-section");

// List container where hidden/pulled down flyers are rendered
export const hiddenFlyersList = document.getElementById("hidden-flyers-list");

// Button in navigation to view user's hidden flyers
export const showHiddenFlyersBtn = document.getElementById("show-hidden-flyers-btn");

// Button inside admin dashboard to exit admin view back to login/auth view
export const btnExitAdmin = document.getElementById("btn-exit-admin");

// Navigation button to open the "Add Hostel" form section
export const btnAddHostelNav = document.getElementById("btn-add-hostel");

// Section containing the form to add a new hostel
export const hostelSection = document.getElementById("hostel-section");

// Container section for viewing the hostel feed listing
export const hostelFeed = document.getElementById("hostel-feed");

// Container section for viewing public roommate flyers feed
export const feedSection = document.getElementById("feed-section");

// Container section containing the form to create a new flyer
export const flyerSection = document.getElementById("flyer-section");

// Container section containing the roommate search interface and filters
export const searchSection = document.getElementById("search-section");

// Container wrapper for student document upload input (shown if student checkbox is checked)
export const regStudentp = document.getElementById("reg-student-doc-wrapper");

// Button to switch view to the login form
export const btnShowLogin = document.getElementById("btn-show-login");

// Button to switch view to the registration form
export const btnShowRegister = document.getElementById("btn-show-register");

// Button allowing visitors to browse the app as a guest without logging in
export const btnContinueGuest = document.getElementById("btn-continue-guest");

// Button to log out the current user session
export const btnLogout = document.getElementById("btn-logout");

// Submit button on the login form
export const btnLogin = document.getElementById("btn-login");

// Submit button on the registration form
export const btnRegister = document.getElementById("btn-register");

// Navigation button to open the Create Flyer section
export const btnCreateFlyer = document.getElementById("btn-create-flyer");

// Navigation button to open the Search section
export const btnSearch = document.getElementById("btn-search");

// Mobile menu toggle button in the logged-in nav
export const btnUserMenu = document.getElementById("btn-user-menu");

// Mobile menu dropdown content
export const userMenuDropdown = document.getElementById("user-menu-dropdown");

// Hamburger menu item buttons
export const btnMenuAddHostel = document.getElementById("btn-menu-add-hostel");
export const btnMenuUpgrade = document.getElementById("btn-menu-upgrade");
export const btnMenuHiddenFlyers = document.getElementById("btn-menu-hidden-flyers");
export const btnMenuLogout = document.getElementById("btn-menu-logout");

// Return home button inside the flyer creation form
export const btnReturnHome = document.getElementById("btn-return-home");

// Return home button inside the search section
export const sBtnReturnHome = document.getElementById("s-btn-return-home");

// Button inside hostel form to return home
export const btnHostelReturn = document.getElementById("btn-hostel-return");

// Submit button to pay/create a new flyer
export const btnPayCreate = document.getElementById("btn-create-flyer-s");

// Cancel button inside flyer creation section
export const btnCancelCreate = document.getElementById("btn-cancel-create");

// Container element where public flyers feed items are appended
export const feedList = document.getElementById("feed-list");

// Network status banner element showing online/offline notices
export const networkStatus = document.getElementById("network-status");

// Tab button for switching feed view to Roommates (flyers)
export const tabFlyers = document.getElementById("tab-flyers");

// Tab button for switching feed view to Hostels
export const tabHostels = document.getElementById("tab-hostels");

// Search budget max slider input element
export const budgetSlider = document.getElementById("s-max-fund");

// Search budget numeric text input element
export const budgetInput = document.getElementById("budget-input");

// Search room size / people slider input element
export const peopleSlider = document.getElementById("s-people");

// Search room size / people numeric text input element
export const peopleInput = document.getElementById("people-input");

// Hostel filter inputs
export const hSearchLocation = document.getElementById("h-search-location");

// Hostel profile modal elements
export const hostelProfileModal = document.getElementById("hostel-profile-modal");
export const hostelProfileContent = document.getElementById("hostel-profile-content");
export const closeHostelProfileModal = document.getElementById("close-hostel-profile-modal");

// --- CHAT UI ELEMENTS ---
export const chatSection = document.getElementById("chat-section");
export const chatList = document.getElementById("chat-list");
export const chatInput = document.getElementById("chat-input");
export const chatSend = document.getElementById("chat-send");
export const chatClose = document.getElementById("chat-close");
export const chatFlyerTitle = document.getElementById("chat-flyer-title");
