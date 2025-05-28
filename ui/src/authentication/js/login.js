import { appwriteService } from '../services/appwrite-service.js';

// Check if user is already logged in and redirect if true
(async () => {
    const user = await appwriteService.getCurrentUser();
    if (user) {
        console.log('User already logged in:', user);
        window.location.href = '../image_upload/image_upload.html';
    }
})();

// Check for registration success message
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('registration') === 'success') {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Account created successfully! Please log in.';
    document.querySelector('.login-container').insertBefore(
        successMessage,
        document.querySelector('.login-form')
    );
}

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

document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
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

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Remove any existing error messages
        createErrorMessage(emailInput, "");
        createErrorMessage(passwordInput, "");

        try {
            await appwriteService.login(email, password);
            // Redirect to image upload page on success
            window.location.href = '../image_upload/image_upload.html';
        } catch (error) {
            console.error("Login failed:", error);
            createErrorMessage(emailInput, "Email or password is incorrect");
        }
    });
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