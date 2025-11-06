// Registration page functionality
const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const passwordMatchMessage = document.getElementById('password-match-message');
const registerBtn = document.getElementById('register-btn');

const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm_password');

// Toggle password visibility
function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    const iconId = fieldId === 'password' ? 'eye-icon-password' : 'eye-icon-confirm';
    const icon = document.getElementById(iconId);
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Check if passwords match
function checkPasswordsMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            passwordMatchMessage.innerHTML = '<i class="fas fa-check-circle"></i> Passwords match!';
            passwordMatchMessage.style.display = 'block';
            passwordMatchMessage.className = 'success-message';
            return true;
        } else {
            passwordMatchMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Passwords do not match';
            passwordMatchMessage.style.display = 'block';
            passwordMatchMessage.className = 'error-message';
            return false;
        }
    } else {
        passwordMatchMessage.style.display = 'none';
        return false;
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

// Event listeners for password matching
passwordInput.addEventListener('input', checkPasswordsMatch);
confirmPasswordInput.addEventListener('input', checkPasswordsMatch);

// Handle registration form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const full_name = document.getElementById('full_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value;
    const confirm_password = confirmPasswordInput.value;

    // Validation
    if (!full_name || !email || !username || !password || !confirm_password) {
        showError('Please fill in all fields');
        return;
    }

    if (username.length < 3) {
        showError('Username must be at least 3 characters long');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    if (password !== confirm_password) {
        showError('Passwords do not match');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }

    // Disable button and show loading
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name,
                email,
                username,
                password,
                confirm_password
            })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Registration successful! Redirecting to dashboard...');
            registerForm.reset();
            passwordMatchMessage.style.display = 'none';
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            // Handle validation errors
            if (data.errors && data.errors.length > 0) {
                const errorMessages = data.errors.map(err => err.msg).join(', ');
                showError(errorMessages);
            } else {
                showError(data.message || 'Registration failed. Please try again.');
            }
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('An error occurred. Please try again.');
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
});

// Clear errors on input
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', hideMessages);
});
