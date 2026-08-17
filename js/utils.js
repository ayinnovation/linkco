// ==========================================
// 🛠️ UTILITY & HELPER MODULE (js/utils.js)
// Contains general utility functions used throughout the application,
// including loader overlays, notifications, modal confirmations, ID generation,
// time formatting, and safe event registration.
// ==========================================

// Global variable tracking the auto-hide timer for network status banner messages
let networkTimeout = null;

/**
 * Removes the 'hidden' CSS class from the loader element to display the spinner overlay.
 */
export function showLoader() {
  // Locate the DOM element with ID 'loader' and reveal it by removing the 'hidden' class
  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");
}

/**
 * Adds the 'hidden' CSS class to the loader element to hide the spinner overlay.
 */
export function hideLoader() {
  // Locate the DOM element with ID 'loader' and conceal it by adding the 'hidden' class
  const loader = document.getElementById("loader");
  if (loader) loader.classList.add("hidden");
}

/**
 * Helper function that displays the loading spinner, runs a callback function after a brief delay,
 * and then conceals the spinner when complete.
 * 
 * @param {Function} fn - The callback function to execute while loader is shown
 */
export function withLoader(fn) {
  // Show spinner overlay immediately
  showLoader();
  // Set a timeout delay of 1.2 seconds to simulate asynchronous work/processing
  setTimeout(() => {
    // Execute the passed function
    fn();
    // Hide spinner overlay when execution finishes
    hideLoader();
  }, 1200);
}

/**
 * Displays a non-blocking toast notice banner at the top center of the page.
 * 
 * @param {string} message - Text notification message to display
 * @param {Object} options - Config object containing type ('info', 'success', 'error', 'warn') and duration (ms)
 */
export function showNotice(message, { type = 'info', duration = 3000 } = {}) {
  // Define unique ID for the notice element in the DOM
  const id = 'notice-message';

  // Search DOM for existing notice element
  let el = document.getElementById(id);

  // If notice element does not exist in DOM yet, dynamically create and configure it
  if (!el) {
    el = document.createElement('div'); // Create new div HTML element
    el.id = id; // Set unique ID attribute
    el.style.position = 'fixed'; // Fix position relative to screen viewport
    el.style.top = '80px'; // Position 80px from top of screen
    el.style.left = '50%'; // Center horizontally
    el.style.transform = 'translateX(-50%)'; // Shift left by half width to align exact center
    el.style.padding = '10px 16px'; // Internal spacing around text content
    el.style.borderRadius = '8px'; // Rounded corners styling
    el.style.zIndex = '9999'; // High z-index to appear on top of all other elements
    el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)'; // Soft shadow effect
    el.style.display = 'none'; // Initially hidden
    document.body.appendChild(el); // Append element into document body
  }

  // Object mapping notice type strings to background color hex codes
  const colors = { 
    info: '#0b3d91',    // Deep blue for informational messages
    success: '#16a34a', // Emerald green for success messages
    error: '#dc2626',   // Bright red for error messages
    warn: '#f97316'     // Vivid orange for warning messages
  };

  // Set element background color based on message type (defaults to info color if type unknown)
  el.style.background = colors[type] || colors.info;
  el.style.color = 'white'; // White text color for clear legibility
  el.textContent = message; // Insert text message content
  el.style.display = 'block'; // Display banner on screen

  // Clear any existing hide timeout running on the notice element
  clearTimeout(el._hideTimeout);

  // Set timeout to hide notice banner automatically after specified duration
  el._hideTimeout = setTimeout(() => { 
    el.style.display = 'none'; // Hide banner when time expires
  }, duration);
}

/**
 * Creates and displays an interactive modal confirmation box on screen.
 * Returns a Promise resolving to true if user clicks Confirm, or false if user clicks Cancel.
 * 
 * @param {string} message - Confirmation question text shown to user
 * @returns {Promise<boolean>}
 */
export function showConfirm(message) {
  // Return new Promise to handle user decision asynchronously
  return new Promise(resolve => {
    const id = 'confirm-overlay'; // Unique ID for confirmation modal backdrop
    let overlay = document.getElementById(id); // Look for existing overlay in DOM

    // Build modal overlay structure dynamically if it doesn't already exist
    if (!overlay) {
      overlay = document.createElement('div'); // Create overlay container
      overlay.id = id; // Set element ID
      overlay.style.position = 'fixed'; // Position fixed across full screen
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%'; // Cover full width
      overlay.style.height = '100%'; // Cover full height
      overlay.style.background = 'rgba(0,0,0,0.5)'; // Semi-transparent dark background overlay
      overlay.style.display = 'flex'; // Use flexbox layout
      overlay.style.alignItems = 'center'; // Center box vertically
      overlay.style.justifyContent = 'center'; // Center box horizontally
      overlay.style.zIndex = '10000'; // Higher than all other UI layers

      const box = document.createElement('div'); // Create white modal dialog box
      box.style.background = 'white';
      box.style.padding = '20px';
      box.style.borderRadius = '8px';
      box.style.maxWidth = '90%';
      box.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';

      const msg = document.createElement('p'); // Paragraph element for message text
      msg.id = id + '-msg';
      msg.style.marginBottom = '12px';

      const btns = document.createElement('div'); // Container div for confirm/cancel buttons
      btns.style.display = 'flex';
      btns.style.gap = '8px';

      const yes = document.createElement('button'); // Create Confirm button
      yes.textContent = 'Confirm';
      yes.style.background = '#16a34a'; // Green background for confirmation
      yes.style.color = 'white';

      const no = document.createElement('button'); // Create Cancel button
      no.textContent = 'Cancel';
      no.style.background = '#dc2626'; // Red background for cancellation
      no.style.color = 'white';

      btns.appendChild(yes); // Append Confirm button into buttons row
      btns.appendChild(no); // Append Cancel button into buttons row
      box.appendChild(msg); // Append message text into dialog box
      box.appendChild(btns); // Append buttons row into dialog box
      overlay.appendChild(box); // Append dialog box into dark overlay
      document.body.appendChild(overlay); // Append modal overlay into document body
    }

    // Retrieve message element inside confirmation box and update message text
    const msgEl = document.getElementById(id + '-msg');
    msgEl.textContent = message;

    // Show modal overlay using flexbox centering
    overlay.style.display = 'flex';

    // Target Confirm and Cancel buttons within the modal overlay
    const yesBtn = overlay.querySelector('button:first-of-type');
    const noBtn = overlay.querySelector('button:last-of-type');

    // Internal helper function to hide modal overlay and resolve promise
    function cleanup(val) {
      overlay.style.display = 'none'; // Hide overlay box
      resolve(val); // Resolve promise with true/false result
    }

    // Attach click handler for Confirm button
    yesBtn.onclick = () => cleanup(true);
    // Attach click handler for Cancel button
    noBtn.onclick = () => cleanup(false);
  });
}

/**
 * Generates a unique alphanumeric ID string based on current timestamp.
 * 
 * @returns {string} Unique ID string
 */
export function generateId() {
  // Convert current millisecond timestamp to base-36 string representation
  return Date.now().toString(36);
}

/**
 * Safely registers an event listener on a DOM element, checking for null references.
 * 
 * @param {HTMLElement|null} el - Target DOM element
 * @param {string} event - Event name string (e.g. 'click', 'input')
 * @param {Function} handler - Event listener callback function
 */
export function safeOn(el, event, handler) {
  // If element reference is null or undefined, issue a console warning and prevent error
  if (!el) return console.warn('Attempted to attach listener to null element');

  // Attach event listener safely
  el.addEventListener(event, handler);
}

/**
 * Converts a millisecond timestamp into a human-readable relative time string (e.g. "Just now", "5m ago", "2h ago").
 * 
 * @param {number} timestamp - Epoch timestamp in milliseconds
 * @returns {string} Formatted relative time string
 */
export function formatTime(timestamp) {
  // Calculate difference between current time and given timestamp in milliseconds
  const diff = Date.now() - timestamp;
  // Convert millisecond difference into total elapsed minutes
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Just now"; // Less than 1 minute ago
  if (mins < 60) return mins + "m ago"; // Minutes elapsed

  // Convert minutes into total elapsed hours
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago"; // Hours elapsed

  // Convert hours into total elapsed days
  const days = Math.floor(hours / 24);
  return days + "d ago"; // Days elapsed
}

/**
 * Displays or hides network connection status banner on user's screen.
 * 
 * @param {string} message - Message text explaining network state
 * @param {boolean} isOnline - True if device is online, false if offline
 */
export function showNetworkStatus(message, isOnline) {
  // Select network status DOM container element
  const networkStatus = document.getElementById("network-status");
  if (!networkStatus) return;

  networkStatus.textContent = message; // Update banner text content
  networkStatus.classList.remove("hidden"); // Reveal network status banner

  // Apply styling class depending on whether device is online or offline
  if (isOnline) {
    networkStatus.classList.add("online");
  } else {
    networkStatus.classList.remove("online");
  }

  // Clear previous hide timer if active
  clearTimeout(networkTimeout);

  // Set banner to automatically hide after 4 seconds
  networkTimeout = setTimeout(() => {
    networkStatus.classList.add("hidden");
  }, 4000);
}
