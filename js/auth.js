// ==========================================
// 🧍 AUTHENTICATION MODULE (js/auth.js)
// Handles user registration, login authentication, user session persistence,
// user upgrade logic, and form state autosave/restore functionality.
// ==========================================

import { loadFromStorage, saveToStorage } from './storage.js';
import { showNotice, generateId } from './utils.js';
import { studentCb, regStudentp } from './dom.js';
import { showLogin, showFeed, showAuth, showAdminDashboard } from './navigation.js';

// Load stored array of user accounts from localStorage; default to empty array if none exists
export let users = loadFromStorage("users", []);

// Check if default administrator account exists in users array; if missing, create it
if (!users.some(u => u.role === "admin")) {
  users.push({
    id: "admin-1",         // Unique identifier for admin user account
    name: "Administrator", // Display name for administrator
    phone: "0000",         // Default phone number login credential
    password: "admin123",  // Default password credential
    role: "admin"          // Administrative role level
  });
  // Save updated users list containing default admin to localStorage
  saveToStorage("users", users);
}

// Load currently authenticated user session object from localStorage (null if not logged in)
export let currentUser = loadFromStorage("currentUser", null);

/**
 * Updates the active currentUser state variable and persists it into localStorage.
 * 
 * @param {Object|null} user - User object to set as active session, or null to clear session
 */
export function setCurrentUser(user) {
  currentUser = user; // Update local exported currentUser state reference
  if (user) {
    saveToStorage("currentUser", user); // Persist user object to localStorage
  } else {
    localStorage.removeItem("currentUser"); // Remove session key from localStorage on logout
  }
}

/**
 * Registers a new user account using input values submitted in the registration form.
 */
export function registerUser() {
  // Read and sanitize input values from registration form fields
  const name = document.getElementById("reg-name").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const isStudent = studentCb.checked; // Boolean indicating student status checkbox state
  const studentDoc = document.getElementById("student-doc-preview").src || ""; // Uploaded document preview base64/URL

  // Validate that all required registration input fields are filled out
  if (!name || !phone || !password) {
    showNotice("Please fill all required fields", { type: 'warn' });
    return;
  }

  // Prevent duplicate user registrations with the same phone number
  if (users.some(u => u.phone === phone)) {
    showNotice("User with this phone already exists", { type: 'error' });
    return;
  }

  // Construct new user account data object
  const newUser = { 
    id: generateId(), // Generate unique ID string
    name, 
    phone, 
    password, 
    isStudent, 
    studentDoc, 
    role: "user" // Standard user role
  };

  // Add newly created user into global users array
  users.push(newUser);

  // Persist updated users list into localStorage
  saveToStorage("users", users);

  // Display success toast notification to user
  showNotice("Registration successful! You can now log in.", { type: 'success' });

  // Switch display view to the login form
  showLogin();
}

/**
 * Authenticates user credentials entered in the login form and establishes a session.
 */
export function loginUser() {
  // Read and sanitize phone and password values entered in login form
  const phone = document.getElementById("login-phone").value.trim();
  const password = document.getElementById("login-password").value.trim();

  // Search users list for account matching provided phone and password combination
  const user = users.find(u => u.phone === phone && u.password === password);

  // If no matching account is found, display error notice and abort login
  if (!user) {
    showNotice("Invalid phone or password", { type: "error" });
    return;
  }

  // Set authenticated user as current active session user
  setCurrentUser(user);

  // Perform role-based navigation routing: redirect admins to admin dashboard, users to feed
  if (user.role === "admin") {
    showAdminDashboard();
  } else {
    showFeed();
  }

  // Display success notification notice
  showNotice("Login successful", { type: "success" });
}

/**
 * Logs out the active user session and resets application state back to auth view.
 */
export function logoutUser() {
  // Clear active current user session
  setCurrentUser(null);

  // Switch view to public authentication screen
  showAuth();

  // Ensure admin section view is hidden
  const adminSection = document.getElementById("admin-section");
  if (adminSection) adminSection.classList.add("hidden");
}

/**
 * Simulates a payment upgrade process to unlock premium unlimited flyer postings.
 */
export function upgradeUser() {
  // Check if user is logged in
  if (!currentUser) {
    showNotice("Please log in to upgrade account", { type: "warn" });
    return;
  }

  // Display informational toast message indicating redirection
  showNotice("Redirecting to payment...", { type: "info" });

  // Simulate payment processing delay of 2 seconds
  setTimeout(() => {
    const now = Date.now(); // Current millisecond epoch timestamp
    const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    // Create subscription object valid for 30 days
    const subscription = {
      phone: currentUser.phone,
      expires: now + oneMonth
    };

    // Save subscription data object to localStorage
    saveToStorage("subscription", subscription);

    // Display success toast message notifying user of premium activation
    showNotice("Payment successful! Premium unlocked 🚀", { type: "success" });
  }, 2000);
}

/**
 * Attaches real-time 'input' event listeners to form input fields to save their values automatically to localStorage.
 */
export function autoSaveForms() {
  // Iterate over all input elements present on the page
  document.querySelectorAll("input").forEach(input => {
    // Attach listener triggered whenever input value changes
    input.addEventListener("input", () => {
      const id = input.id; // Input element ID attribute
      if (!id) return; // Skip inputs without ID
      // Retrieve value: use boolean for checkboxes, string for text/number inputs
      const val = input.type === "checkbox" ? input.checked : input.value;
      // Persist input value into storage under element ID key
      saveToStorage(id, val);
    });
  });
}

/**
 * Restores previously auto-saved form input data from localStorage back into the page inputs.
 */
export function restoreFormData() {
  // Iterate through all input elements in DOM
  document.querySelectorAll("input").forEach(input => {
    const id = input.id;
    if (!id) return;
    // Skip file inputs as security restrictions prevent programmatic assignment
    if (input.type === "file") return;

    // Load saved value from localStorage for this element ID
    const saved = loadFromStorage(id, null);
    if (saved !== null) {
      // Restore checked state for checkboxes, or string value for text/number inputs
      if (input.type === "checkbox") input.checked = saved;
      else input.value = saved;
    }
  });
}

// Attach listener to student status checkbox to toggle visibility of document upload field
if (studentCb && regStudentp) {
  studentCb.addEventListener("change", () => {
    if (studentCb.checked) {
      regStudentp.classList.remove("hidden"); // Show upload field when checked
    } else {
      regStudentp.classList.add("hidden"); // Hide upload field when unchecked
    }
  });
}
