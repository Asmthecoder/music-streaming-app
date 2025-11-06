// Login page functionality
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const loginBtn = document.getElementById('login-btn');

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// Show error message
function showError(message) {
    errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorMessage.style.display = 'flex';
    successMessage.style.display = 'none';
}

// Show success message
function showSuccess(message) {
    successMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    successMessage.style.display = 'flex';
    errorMessage.style.display = 'none';
}

// Hide messages
function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const username_or_email = document.getElementById('username_or_email').value.trim();
    const password = document.getElementById('password').value;

    // Basic validation
    if (!username_or_email || !password) {
        showError('Please fill in all fields');
        return;
    }

    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username_or_email,
                password
            })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showError(data.message || 'Login failed. Please try again.');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
});

// Clear errors on input
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', hideMessages);
});

// Demo login function
async function demoLogin() {
    hideMessages();
    
    const loginBtn = document.querySelector('.demo-login button');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in as Demo User...';

    try {
        const response = await fetch('/api/auth/demo-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Demo login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showError(data.message || 'Demo login failed. Please try again.');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-rocket"></i> Demo Login (No Account Needed)';
        }
    } catch (error) {
        console.error('Demo login error:', error);
        showError('An error occurred. Please try again.');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-rocket"></i> Demo Login (No Account Needed)';
    }
}
