import { appwriteService } from "../services/appwrite-service.js";

// Form elements
const registerForm = document.querySelector(".login-form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

// Check if user is already logged in and redirect if true
(async () => {
  try {
    const user = await appwriteService.getCurrentUser();
    if (user) {
      // If there's an active session, log out first
      await appwriteService.logout();
    }
  } catch (error) {
    console.error("Error checking session:", error);
  }
})();

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
const validateUsername = (username) => {
  if (!username) {
    return "Username is required";
  }
  if (username.length < 3) {
    return "Username must be at least 3 characters long";
  }
  return "";
};

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

const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return "";
};

// Register user in local database
const registerInLocalDb = async (awId) => {
    try {
        const response = await fetch("http://localhost:3000/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ awId })
        });

        console.log("Response status:", response.status); // Debug log

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server error:", errorData); // Debug log
            throw new Error(errorData.message || "Failed to register in local database");
        }

        const result = await response.json();
        console.log("Registration successful:", result); // Debug log
        return result;
    } catch (error) {
        console.error("Error registering in local database:", error);
        throw error;
    }
};

// Form submission handler
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate all fields
  const usernameError = validateUsername(username);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const confirmPasswordError = validateConfirmPassword(
    password,
    confirmPassword,
  );

  // Show error messages if any
  createErrorMessage(usernameInput, usernameError);
  createErrorMessage(emailInput, emailError);
  createErrorMessage(passwordInput, passwordError);
  createErrorMessage(confirmPasswordInput, confirmPasswordError);

  // If there are no errors, attempt registration
  if (
    !usernameError &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError
  ) {
    try {
      // Create account in Appwrite
      const appwriteUser = await appwriteService.createAccount(
        email,
        password,
        username,
      );

      // Register in local database using Appwrite user ID
      await registerInLocalDb(appwriteUser.$id);

      // Redirect to login page with success message
      window.location.href = "./login.html?registration=success";
    } catch (error) {
      console.error("Registration error:", error);
      if (error.message.includes("unique")) {
        createErrorMessage(
          emailInput,
          "This email is already registered. Please try logging in instead.",
        );
      } else {
        createErrorMessage(
          emailInput,
          error.message || "Registration failed. Please try again.",
        );
      }
    }
  }
});

// Login button handler
document
  .querySelector(".control-button:not(.primary):not(.guest)")
  .addEventListener("click", () => {
    window.location.href = "./login.html";
  });

// Guest button handler
document
  .querySelector(".control-button.guest")
  .addEventListener("click", () => {
    window.location.href = "../image_upload/image_upload.html";
  });

