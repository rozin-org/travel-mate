// =========================================================
// RADIO BUTTON IMAGE SELECTOR
// =========================================================

// Get all radio-controlled image elements that are part of the main group.
// Using querySelectorAll for flexibility and to avoid hardcoding individual IDs.
const allImages = document.querySelectorAll(
    '#northImage, #centerImage, #southImage'
);

/**
 * Hides all main images and then shows the one corresponding to the selected radio button.
 * @param {string} imageIdToShow - The ID of the image element to display (e.g., 'northImage').
 */
function showImage(imageIdToShow) {
    // Step 1: Hide all images by setting display to 'none'.
    allImages.forEach(img => {
        img.style.display = 'none';
    });

    // Step 2: Get the specific image element to show.
    const selectedImage = document.getElementById(imageIdToShow);

    // Step 3: Check if the element exists and show it (set display to 'block').
    if (selectedImage) {
        selectedImage.style.display = 'block';
    }
}


// =========================================================
// CHECKBOX OPACITY TOGGLE
// =========================================================

/**
 * Toggles the opacity of a specified image element based on checkbox state.
 * @param {string} imageId - The ID of the image element (e.g., 'alphaImg1').
 * @param {boolean} isChecked - True if the checkbox is checked, false otherwise.
 */
function toggleOpacity(imageId, isChecked) {
    const imageElement = document.getElementById(imageId);
    if (!imageElement) return;

    // Set the opacity based on the checkbox state
    imageElement.style.opacity = isChecked ? '1.0' : '0.4';
}


// =========================================================
// BUTTON ENABLING LOGIC
// =========================================================

/**
 * Checks the state of all radio buttons and checkboxes to enable/disable the submit button.
 */
function checkButtonState() {
    // 1. Get the button element
    const submitButton = document.getElementById('submitButton');
    if (!submitButton) return;

    // 2. Check Radio Buttons (name="imageSelector")
    // Checks if any element with this name is currently checked.
    const radioSelected = document.querySelector('input[name="imageSelector"]:checked') !== null;

    // 3. Check Checkboxes (name="alphaChecker")
    // Checks if at least one element with this name is currently checked.
    const checkboxSelected = document.querySelector('input[name="alphaChecker"]:checked') !== null;
    
    // 4. Determine if the button should be enabled
    // Both conditions must be true: (Radio is selected) AND (At least one Checkbox is selected)
    const enableButton = radioSelected && checkboxSelected;

    // 5. Update the button's disabled state
    submitButton.disabled = !enableButton;
}

// Ensure the button state is checked when the page first loads
document.addEventListener('DOMContentLoaded', checkButtonState);