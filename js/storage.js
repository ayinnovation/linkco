// ==========================================
// 📦 STORAGE HELPER MODULE (js/storage.js)
// Provides functions to read and write data to browser localStorage safely.
// ==========================================

/**
 * Saves a JavaScript data object or array into localStorage under a specific key.
 * Converts the JavaScript value into a JSON string format before saving.
 * 
 * @param {string} key - The unique storage key name (e.g., 'users', 'flyers')
 * @param {any} value - The JavaScript data to store (object, array, string, number, etc.)
 */
export function saveToStorage(key, value) {
  // Convert the JavaScript value to a JSON-formatted string and write it into localStorage
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Loads and parses data from localStorage for a given key.
 * If no data exists under the key, returns the provided fallback default value.
 * 
 * @param {string} key - The unique storage key name to retrieve
 * @param {any} fallback - Default value to return if the key does not exist in storage
 * @returns {any} The parsed JavaScript value or fallback default
 */
export function loadFromStorage(key, fallback) {
  // Retrieve the stored raw JSON string from localStorage using the key name
  const data = localStorage.getItem(key);

  // If stored data exists, parse JSON string into JavaScript data; otherwise return fallback
  return data ? JSON.parse(data) : fallback;
}
