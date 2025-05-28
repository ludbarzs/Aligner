import { appwriteService } from '../../authentication/services/appwrite-service.js';

export class AuthController {
    constructor() {
        this.initializeUI();
        this.checkAuthState();
    }

    initializeUI() {
        // Get auth buttons container
        this.authButtonsContainer = document.querySelector('.auth-buttons');
        if (!this.authButtonsContainer) return;
        
        // Setup logout button
        const logoutButton = document.createElement('button');
        logoutButton.className = 'auth-button';
        logoutButton.textContent = 'Logout';
        logoutButton.style.display = 'none';
        logoutButton.addEventListener('click', () => this.handleLogout());
        this.authButtonsContainer.appendChild(logoutButton);
        this.logoutButton = logoutButton;
    }

    async checkAuthState() {
        const isLoggedIn = await appwriteService.isLoggedIn();
        this.updateUIForAuthState(isLoggedIn);
    }

    updateUIForAuthState(isLoggedIn) {
        const loginButton = document.querySelector('a[href*="login.html"]');
        const registerButton = document.querySelector('a[href*="register.html"]');
        
        if (isLoggedIn) {
            if (loginButton) loginButton.style.display = 'none';
            if (registerButton) registerButton.style.display = 'none';
            if (this.logoutButton) this.logoutButton.style.display = 'flex';
        } else {
            if (loginButton) loginButton.style.display = 'flex';
            if (registerButton) registerButton.style.display = 'flex';
            if (this.logoutButton) this.logoutButton.style.display = 'none';
        }
    }

    async handleLogout() {
        try {
            await appwriteService.logout();
            this.updateUIForAuthState(false);
            window.location.href = '../image_upload/image_upload.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
} 