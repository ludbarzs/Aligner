import { appwriteService } from '../services/appwrite-service.js';

export class AuthController {
    constructor() {
        this.initializeUI();
        this.checkAuthState();
    }

    initializeUI() {
        // Get auth buttons container
        this.authButtonsContainer = document.querySelector('.auth-buttons');
        
        // Add event listeners to auth buttons if they exist
        const loginButton = document.querySelector('a[href*="login.html"]');
        const registerButton = document.querySelector('a[href*="register.html"]');
        const logoutButton = document.createElement('button');
        
        if (loginButton) {
            loginButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        if (registerButton) {
            registerButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }

        // Create and setup logout button
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

    async handleLogin(email, password) {
        try {
            await appwriteService.login(email, password);
            this.updateUIForAuthState(true);
            this.hideAuthForms();
            // You might want to refresh the page or update the UI here
        } catch (error) {
            console.error('Login failed:', error);
            // Show error message to user
            this.showError(error.message);
        }
    }

    async handleRegister(email, password, name) {
        try {
            await appwriteService.createAccount(email, password, name);
            this.updateUIForAuthState(true);
            this.hideAuthForms();
            // You might want to refresh the page or update the UI here
        } catch (error) {
            console.error('Registration failed:', error);
            // Show error message to user
            this.showError(error.message);
        }
    }

    async handleLogout() {
        try {
            await appwriteService.logout();
            this.updateUIForAuthState(false);
            // You might want to refresh the page or update the UI here
        } catch (error) {
            console.error('Logout failed:', error);
            this.showError(error.message);
        }
    }

    showLoginForm() {
        const formHtml = `
            <div class="auth-form-overlay">
                <div class="auth-form">
                    <h2>Login</h2>
                    <form id="login-form">
                        <input type="email" placeholder="Email" required />
                        <input type="password" placeholder="Password" required />
                        <button type="submit">Login</button>
                        <button type="button" class="close-form">Cancel</button>
                    </form>
                    <div class="error-message"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', formHtml);
        
        const form = document.getElementById('login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            const password = form.querySelector('input[type="password"]').value;
            this.handleLogin(email, password);
        });

        this.setupFormClosing();
    }

    showRegisterForm() {
        const formHtml = `
            <div class="auth-form-overlay">
                <div class="auth-form">
                    <h2>Register</h2>
                    <form id="register-form">
                        <input type="text" placeholder="Name" required />
                        <input type="email" placeholder="Email" required />
                        <input type="password" placeholder="Password" required />
                        <button type="submit">Register</button>
                        <button type="button" class="close-form">Cancel</button>
                    </form>
                    <div class="error-message"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', formHtml);
        
        const form = document.getElementById('register-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.querySelector('input[type="text"]').value;
            const email = form.querySelector('input[type="email"]').value;
            const password = form.querySelector('input[type="password"]').value;
            this.handleRegister(email, password, name);
        });

        this.setupFormClosing();
    }

    setupFormClosing() {
        const overlay = document.querySelector('.auth-form-overlay');
        const closeButton = document.querySelector('.close-form');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hideAuthForms());
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideAuthForms();
                }
            });
        }
    }

    hideAuthForms() {
        const overlay = document.querySelector('.auth-form-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showError(message) {
        const errorDiv = document.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
} 