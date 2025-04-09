// =============================================
// TODO LIST - FILE UPLOAD FUNCTIONALITY
// =============================================
// [ ] Display selected file preview
//     - Show thumbnail of selected image
//     - Display filename and size
//     - Handle preview removal on reupload
//
// [ ] Implement drag and drop
//     - Add dragover/dragleave visual feedback
//     - Handle drop event for file processing
//     - Validate dropped files (type/size)
//
// [ ] Reupload functionality
//     - Clear current selection
//     - Reset preview
//     - Re-enable file selection
//
// [ ] Image rotation
//     - Add rotation buttons (90° CW/CCW)
//     - Store rotation state
//     - Apply rotation before processing
//
// [ ] Enhancements
//     - File size validation
//     - Progress indicators
//     - Error handling
// =============================================

// DOM elements
const upload_box = document.querySelector(".upload-box");
const select_file_btn = document.querySelector(".select-file-btn");
const continue_btn = document.querySelector(".continue-btn");
const upload_p = document.querySelector(".upload-box p");
const upload_icon = document.querySelector(".upload-icon");
const upload_h3 = document.querySelector(".upload-h3");

function display_selected_file(file) {
  const imageURL = URL.createObjectURL(file);

  upload_box.style.border = "2px solid var(--cyan)";
  upload_box.innerHTML =
    `<img src=${imageURL} alt="Selected Image" class="display_image">`;
}

function handle_file_selection(file) {
  if (!file) return;

  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    alert("Only JPG and PNG files are supported!");
    return;
  }

  selected_file = file;
  display_selected_file(file);

  // Enable Continue button:
  continue_btn.disabled = false;
  continue_btn.style.opacity = "1";
  continue_btn.style.cursor = "pointer";

  // Remove unused elements when image gets loded
  upload_icon.style.display = "none";
  upload_h3.style.display = "none";
  select_file_btn.style.display = "none";
  select_file_btn.style.display = "none";
}

// On 'Select file' click
select_file_btn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg, image/png";

  input.onchange = (e) => {
    const file = e.target.files[0];
    handle_file_selection(file);
  };

  input.click();
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
  // Continue Button not clickable
  continue_btn.disabled = true;
  continue_btn.style.opacity = "0.5";
  continue_btn.style.cursor = "not-allowed";
});
