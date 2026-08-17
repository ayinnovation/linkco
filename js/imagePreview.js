// ==========================================
// 📸 IMAGE PREVIEW MODULE (js/imagePreview.js)
// Attaches event listeners to file input elements to read selected images
// via FileReader and display Base64 data preview thumbnails instantly.
// ==========================================

/**
 * Attaches a change event listener to a file input element.
 * Reads selected image file using FileReader and assigns base64 string to img preview src.
 * 
 * @param {string} inputId - DOM ID attribute of the file input element
 * @param {string} previewId - DOM ID attribute of the target image preview element
 */
export function handleImagePreview(inputId, previewId) {
  // Locate file input element in the DOM
  const input = document.getElementById(inputId);
  // Locate target preview <img> element in the DOM
  const preview = document.getElementById(previewId);

  // If input element is missing, abort function to avoid errors
  if (!input || !preview) return;

  // Listen for 'change' event when user selects a file
  input.addEventListener("change", () => {
    // Extract first file object from selected FileList array
    const file = input.files[0];
    if (!file) return; // Exit if no file selected

    // Create a new FileReader browser API instance
    const reader = new FileReader();

    // Define onload event callback fired when file reading finishes
    reader.onload = e => {
      // Set image element src attribute to base64 Data URL result
      preview.src = e.target.result;
      // Remove 'hidden' CSS class to display preview thumbnail
      preview.classList.remove("hidden");
    };

    // Read selected file contents as base64 Data URL
    reader.readAsDataURL(file);
  });
}
