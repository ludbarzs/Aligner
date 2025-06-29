import { appwriteService } from "../../authentication/services/appwrite-service.js";

/**
 * Authentication Controller
 * Manages authentication state and UI updates across the application
 */
export class AuthController {
  constructor() {
    this.currentUser = null;
    this.authButtons = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the auth controller
   * @param {HTMLElement} container - Container element with auth buttons
   */
  async init(container = document) {
    try {
      // Find auth buttons container
      this.authButtons = container.querySelector(".auth-buttons");
      if (!this.authButtons) {
        console.warn("Auth buttons container not found");
        return;
      }

      // Check current authentication status
      await this.checkAuthStatus();

      // Set up event listeners
      this.setupEventListeners();

      // Update UI based on auth status
      this.updateAuthUI();

      this.isInitialized = true;
      console.log("AuthController initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AuthController:", error);
    }
  }

  /**
   * Check current authentication status
   */
  async checkAuthStatus() {
    try {
      this.currentUser = await appwriteService.getCurrentUser();
      return this.currentUser !== null;
    } catch (error) {
      console.error("Failed to check auth status:", error);
      this.currentUser = null;
      return false;
    }
  }

  /**
   * Update authentication UI based on current state
   */
  updateAuthUI() {
    if (!this.authButtons) return;

    if (this.currentUser) {
        // User is logged in - hide auth buttons and show user icon
        this.authButtons.style.display = 'none';
        this.renderLoggedInUI();
    } else {
        // User is not logged in - show auth buttons and remove user icon
        this.authButtons.style.display = 'flex';
        this.renderLoggedOutUI();
    }
  }

  /**
   * Render UI for logged-in users
   */
  renderLoggedInUI() {
    // Create user icon container with hover menu
    const userIconContainer = document.createElement("div");
    userIconContainer.className = "user-icon-container";

    // Create user icon button
    const userIconButton = document.createElement("button");
    userIconButton.className = "user-icon-button";
    userIconButton.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
    `;

    // Create hover menu
    const hoverMenu = document.createElement("div");
    hoverMenu.className = "hover-menu";

    // Create View Profile button
    const viewProfileButton = document.createElement("button");
    viewProfileButton.className = "hover-menu-button";
    viewProfileButton.textContent = "View Profile";
    viewProfileButton.addEventListener("click", () => {
        window.location.href = "../user_profile/user_profile.html";
    });

    // Create Logout button in hover menu
    const hoverMenuLogoutButton = document.createElement("button");
    hoverMenuLogoutButton.className = "hover-menu-button logout";
    hoverMenuLogoutButton.textContent = "Logout";
    hoverMenuLogoutButton.addEventListener("click", async () => {
        await this.handleLogout();
        window.location.href = "../image_upload/image_upload.html";
    });

    // Assemble the hover menu
    hoverMenu.appendChild(viewProfileButton);
    hoverMenu.appendChild(hoverMenuLogoutButton);

    // Assemble the user icon container
    userIconContainer.appendChild(userIconButton);
    userIconContainer.appendChild(hoverMenu);

    // Add user icon container to the document body since it's positioned absolutely
    document.body.appendChild(userIconContainer);
  }

  /**
   * Render UI for logged-out users
   */
  renderLoggedOutUI() {
    // Remove user icon container if it exists
    const existingUserIcon = document.querySelector('.user-icon-container');
    if (existingUserIcon) {
        existingUserIcon.remove();
    }

    // Clear existing buttons
    this.authButtons.innerHTML = "";

    const loginButton = document.createElement("button");
    loginButton.className = "auth-button login-button";
    loginButton.textContent = "Login";
    loginButton.addEventListener("click", () => this.handleLogin());

    const signupButton = document.createElement("button");
    signupButton.className = "auth-button signup-button";
    signupButton.textContent = "Sign Up";
    signupButton.addEventListener("click", () => this.handleSignup());

    this.authButtons.appendChild(loginButton);
    this.authButtons.appendChild(signupButton);
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Listen for auth state changes from other parts of the app
    window.addEventListener("authStateChanged", (event) => {
      this.currentUser = event.detail.user;
      this.updateAuthUI();
    });

    // Listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener("storage", async (event) => {
      if (event.key === "authStateChanged") {
        await this.checkAuthStatus();
        this.updateAuthUI();
      }
    });
  }

  /**
   * Handle login button click
   */
  handleLogin() {
    window.location.href = "../authentication/login.html";
  }

  /**
   * Handle signup button click
   */
  handleSignup() {
    window.location.href = "../authentication/register.html";
  }

  /**
   * Handle logout button click
   */
  async handleLogout() {
    try {
      // Show loading state if logout button exists
      const logoutButton = this.authButtons?.querySelector(".logout-button");
      if (logoutButton) {
        logoutButton.textContent = "Logging out...";
        logoutButton.disabled = true;
      }

      await appwriteService.logout();
      this.currentUser = null;

      // Notify other parts of the app about auth state change
      this.dispatchAuthStateChange(null);

      // Update UI
      this.updateAuthUI();

      // Optional: Show success message
      this.showMessage("Logged out successfully", "success");
    } catch (error) {
      console.error("Logout failed:", error);
      this.showMessage("Logout failed. Please try again.", "error");

      // Reset button state if button exists
      const logoutButton = this.authButtons?.querySelector(".logout-button");
      if (logoutButton) {
        logoutButton.textContent = "Logout";
        logoutButton.disabled = false;
      }
    }
  }

  /**
   * Dispatch auth state change event
   * @param {Object|null} user - Current user object or null
   */
  dispatchAuthStateChange(user) {
    const event = new CustomEvent("authStateChanged", {
      detail: { user },
    });
    window.dispatchEvent(event);

    // Also update localStorage to notify other tabs
    localStorage.setItem("authStateChanged", Date.now().toString());
  }

  /**
   * Show temporary message to user
   * @param {string} message - Message to show
   * @param {string} type - Message type ('success', 'error', 'info')
   */
  showMessage(message, type = "info") {
    // Remove existing message
    const existingMessage = document.querySelector(".auth-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.textContent = message;

    // Insert message
    if (this.authButtons && this.authButtons.parentNode) {
      this.authButtons.parentNode.insertBefore(messageDiv, this.authButtons);
    }

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }

  /**
   * Get current user
   * @returns {Object|null} Current user object or null
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Refresh auth state
   */
  async refresh() {
    await this.checkAuthStatus();
    this.updateAuthUI();
  }
}

// Create and export a singleton instance
export const authController = new AuthController();
