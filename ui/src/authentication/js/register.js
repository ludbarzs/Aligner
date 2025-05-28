// Form elements
const registerForm = document.querySelector('.login-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');

// Validation messages container creation
const createErrorMessage = (inputElement, message) => {
    // Remove any existing error message
    const existingError = inputElement.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and insert new error message if there is one
    if (message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        inputElement.parentElement.insertBefore(errorDiv, inputElement);
    }
};

// Validation functions
const validateUsername = (username) => {
    if (!username) {
        return 'Username is required';
    }
    if (username.length < 3) {
        return 'Username must be at least 3 characters long';
    }
    return '';
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        return 'Email is required';
    }
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return '';
};

const validatePassword = (password) => {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!/\d/.test(password)) {
        return 'Password must contain at least one number';
    }
    return '';
};

const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
        return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return '';
};

// Real-time validation
usernameInput.addEventListener('input', () => {
    const errorMessage = validateUsername(usernameInput.value);
    createErrorMessage(usernameInput, errorMessage);
});

emailInput.addEventListener('input', () => {
    const errorMessage = validateEmail(emailInput.value);
    createErrorMessage(emailInput, errorMessage);
});

passwordInput.addEventListener('input', () => {
    const errorMessage = validatePassword(passwordInput.value);
    createErrorMessage(passwordInput, errorMessage);
    // Revalidate confirm password when password changes
    if (confirmPasswordInput.value) {
        const confirmError = validateConfirmPassword(passwordInput.value, confirmPasswordInput.value);
        createErrorMessage(confirmPasswordInput, confirmError);
    }
});

confirmPasswordInput.addEventListener('input', () => {
    const errorMessage = validateConfirmPassword(passwordInput.value, confirmPasswordInput.value);
    createErrorMessage(confirmPasswordInput, errorMessage);
});

// Form submission handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate all fields
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    // Show error messages if any
    createErrorMessage(usernameInput, usernameError);
    createErrorMessage(emailInput, emailError);
    createErrorMessage(passwordInput, passwordError);
    createErrorMessage(confirmPasswordInput, confirmPasswordError);

    // If there are no errors, prepare for backend submission
    if (!usernameError && !emailError && !passwordError && !confirmPasswordError) {
        try {
            // This function will be implemented when backend is ready
            await handleRegister(username, email, password);
        } catch (error) {
            console.error('Registration failed:', error);
            // Show generic error message
            createErrorMessage(emailInput, 'Registration failed. Please try again.');
        }
    }
});

// Login button handler
document.querySelector('.control-button:not(.primary):not(.guest)').addEventListener('click', () => {
    window.location.href = './login.html';
});

// Guest button handler
document.querySelector('.control-button.guest').addEventListener('click', () => {
    window.location.href = '../image_upload/image_upload.html';
});

// Backend integration function (to be implemented)
async function handleRegister(username, email, password) {
    // This is a placeholder function that will be implemented when the backend is ready
    // Example implementation:
    /*
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }

    const data = await response.json();
    // Handle successful registration (e.g., store token, redirect)
    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard';
    */
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
    const backToLoginButton = form.querySelector('button:not([type="submit"]):not(.guest)');
    const guestButton = form.querySelector('.guest');

    // Handle back to login button
    backToLoginButton.addEventListener('click', () => {
        window.location.href = './login.html';
    });

    // Handle continue as guest button
    guestButton.addEventListener('click', () => {
        window.location.href = '../image_upload/image_upload.html';
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // TODO: Add actual registration logic here
        // For now, just redirect to login page
        window.location.href = './login.html';
    });
}); 