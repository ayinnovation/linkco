// ==========================================
// 🔍 SEARCH SYSTEM MODULE (js/search.js)
// Implements real-time filtering, weighted match scoring (budget, roommates, location, preferences),
// synchronized range sliders, and animated search result cards.
// ==========================================

import { budgetSlider, budgetInput, peopleSlider, peopleInput, feedList } from './dom.js';
import { flyers } from './flyers.js';

/**
 * Initializes two-way input synchronization between range sliders and numeric input fields.
 */
export function initSearchSliders() {
  if (budgetSlider && budgetInput) {
    // Sync slider movement to update text input value and re-run search
    budgetSlider.addEventListener("input", () => {
      budgetInput.value = budgetSlider.value;
      runSearchLive();
    });

    // Sync numeric text input value to update slider position and re-run search
    budgetInput.addEventListener("input", () => {
      budgetSlider.value = budgetInput.value || 0;
      runSearchLive();
    });
  }

  if (peopleSlider && peopleInput) {
    // Sync people slider movement to update numeric input value and re-run search
    peopleSlider.addEventListener("input", () => {
      peopleInput.value = peopleSlider.value;
      runSearchLive();
    });

    // Sync people numeric input to update slider position and re-run search
    peopleInput.addEventListener("input", () => {
      peopleSlider.value = peopleInput.value || 0;
      runSearchLive();
    });
  }

  // Attach live input listeners to text filters for instant search updates
  ["s-max-fund", "s-people", "s-location", "s-preferences"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", runSearchLive);
    }
  });
}

/**
 * Filters and calculates weighted compatibility scores for active flyers based on user criteria.
 */
export function runSearchLive() {
  // Read filter values from DOM input elements
  const maxFund = Number(document.getElementById("budget-input")?.value) || 0;
  const people = Number(document.getElementById("people-input")?.value) || 0;
  const location = (document.getElementById("s-location")?.value || "").toLowerCase();
  const preferences = (document.getElementById("s-preferences")?.value || "").toLowerCase();

  // Split comma-separated search preferences into clean lowercase tag array
  const prefArray = preferences.split(",").map(p => p.trim()).filter(Boolean);

  // Map and score all active flyers
  const scoredResults = flyers
    .filter(f => f.isActive) // Process active flyers only
    .map(f => {
      let score = 0; // Initialize base compatibility score

      // 💰 Budget Match Scoring
      if (!maxFund) {
        score += 1; // Default score when no budget specified
      } else if (Number(f.perPerson) <= maxFund) {
        score += 3; // Perfect budget fit
      } else if (Number(f.perPerson) <= maxFund + 20000) {
        score += 1; // Close budget fit within 20,000 threshold
      }

      // 👥 Roommates Needed Match Scoring
      if (!people) {
        score += 1; // Default score when no slot filter specified
      } else if (Number(f.roommatesNeeded) === people) {
        score += 3; // Exact match
      } else if (Math.abs(Number(f.roommatesNeeded) - people) === 1) {
        score += 1; // Close match within 1 person difference
      }

      // 📍 Location Substring Match Scoring
      if (!location) {
        score += 1; // Default score when no location specified
      } else if (f.location.toLowerCase().includes(location)) {
        score += 3; // Location substring match
      }

      // 🎯 Preference Keyword Match Scoring
      const flyerPrefs = String(f.preferences || "").toLowerCase();
      if (!prefArray.length) {
        score += 1;
      } else {
        let matchCount = 0;
        prefArray.forEach(p => {
          if (flyerPrefs.includes(p)) matchCount++; // Increment count for each matching tag
        });
        score += matchCount * 2; // Each tag match adds +2 points to score
      }

      return { ...f, score }; // Return expanded flyer object containing computed score
    })
    .filter(f => f.score > 0) // Exclude total zero-score mismatches
    .sort((a, b) => b.score - a.score); // Sort descending (highest match score first)

  if (feedList) feedList.style.opacity = "0.3"; // Briefly dim feed while filtering

  // Render processed search results cards into feed container
  renderSearchResults(scoredResults);

  // Restore opacity after rendering delay
  setTimeout(() => {
    if (feedList) feedList.style.opacity = "1";
  }, 100);
}

/**
 * Renders calculated search results cards into feed container DOM element.
 * 
 * @param {Array} results - Array of flyer objects containing match scores
 */
export function renderSearchResults(results) {
  if (!feedList) return;
  feedList.innerHTML = ""; // Clear existing feed list container

  // Display empty message if no matches pass criteria
  if (results.length === 0) {
    feedList.innerHTML = '<p class="empty-state">No matches — try adjusting your filters</p>';
    return;
  }

  // Iterate over each scored search result
  results.forEach((f, index) => {
    const div = document.createElement("div");
    div.className = "flyer animate-card"; // Apply card layout and entry animation CSS classes
    div.style.animationDelay = `${index * 0.08}s`; // Stagger animation delay per card

    const maxScore = 12; // Maximum expected total score benchmark
    const percent = Math.round((f.score / maxScore) * 100); // Calculate match percentage ratio
    const slotsLeft = Math.max(0, f.roommatesNeeded - (f.roommatesFound || 0));

    // Determine badge color class based on calculated match percentage
    let scoreClass = "";
    if (percent >= 75) scoreClass = "match-high";      // Green badge for high compatibility
    else if (percent >= 40) scoreClass = "match-mid";  // Orange badge for medium compatibility
    else scoreClass = "match-low";                      // Red/gray badge for lower match score

    // Format preferences into badge HTML tags
    const tags = (f.preferences || "")
      .split(",")
      .map(p => `<span class="tag">${p.trim()}</span>`)
      .join("");

    div.innerHTML = `
      <img src="${f.hostelImg}" class="flyer-hostel-img" alt="${f.title}" />
      <h4>${f.title}</h4>
      <div class="match-score ${scoreClass}">
        ${percent}% Match
      </div>
      <p><b>Location:</b> ${f.location}</p>
      <p><b>₦${f.perPerson}</b> per person</p>
      <p><b>Slots Left:</b> ${slotsLeft}</p>
      <div class="tag-container">${tags}</div>
      <a href="https://wa.me/${f.contact}" target="_blank">
        <button class="success">Chat on WhatsApp</button>
      </a>
    `;

    feedList.appendChild(div); // Append card into feed container
  });
}
