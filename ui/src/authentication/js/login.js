// Form elements
const loginForm = document.querySelector(".login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Validation messages container creation
const createErrorMessage = (inputElement, message) => {
  // Remove any existing error message
  const existingError =
    inputElement.parentElement.querySelector(".error-message");
  if (existingError) {
    existingError.remove();
  }

  // Create and insert new error message if there is one
  if (message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    inputElement.parentElement.insertBefore(errorDiv, inputElement);
  }
};

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email is required";
  }
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return "";
};

const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  return "";
};

// Real-time validation
emailInput.addEventListener("input", () => {
  const errorMessage = validateEmail(emailInput.value);
  createErrorMessage(emailInput, errorMessage);
});

passwordInput.addEventListener("input", () => {
  const errorMessage = validatePassword(passwordInput.value);
  createErrorMessage(passwordInput, errorMessage);
});

// Form submission handler
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  // Validate both fields
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  // Show error messages if any
  createErrorMessage(emailInput, emailError);
  createErrorMessage(passwordInput, passwordError);

  // If there are no errors, prepare for backend submission
  if (!emailError && !passwordError) {
    try {
      // This function will be implemented when backend is ready
      await handleLogin(email, password);
    } catch (error) {
      console.error("Login failed:", error);
      // Show generic error message
      createErrorMessage(emailInput, "Login failed. Please try again.");
    }
  }
});

// Register button handler
document
  .querySelector(".control-button:not(.primary):not(.guest)")
  .addEventListener("click", () => {
    window.location.href = "./register.html";
  });

// Guest button handler
document
  .querySelector(".control-button.guest")
  .addEventListener("click", () => {
    window.location.href = "../image_upload/image_upload.html";
  });

// Backend integration function (to be implemented)
async function handleLogin(email, password) {
  // This is a placeholder function that will be implemented when the backend is ready
  // Example implementation:
  /*
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    // Handle successful login (e.g., store token, redirect)
    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard';
    */
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
    const registerButton = form.querySelector('button:not([type="submit"]):not(.guest)');
    const guestButton = form.querySelector('.guest');

    // Handle register button
    registerButton.addEventListener('click', () => {
        window.location.href = './register.html';
    });

    // Handle continue as guest button
    guestButton.addEventListener('click', () => {
        window.location.href = '../image_upload/image_upload.html';
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // TODO: Add actual login logic here
        // For now, just redirect to image upload page
        window.location.href = '../image_upload/image_upload.html';
    });
}); 