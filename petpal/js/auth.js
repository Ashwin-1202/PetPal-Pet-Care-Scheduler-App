// Authentication functionality for PetPal

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and update UI accordingly
    updateAuthUI();
    
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Update authentication UI based on login status
function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;
    
    if (isLoggedIn()) {
        const currentUser = getCurrentUser();
        authLink.innerHTML = `<a href="#" id="logout-btn">Logout (${currentUser.name})</a>`;
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        authLink.innerHTML = '<a href="login.html">Login</a>';
    }
}

// Handle user login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user with matching credentials
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        showNotification('Login successful!', 'success');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

// Handle user registration
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showNotification('User with this email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Also log the user in
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showNotification('Registration successful!', 'success');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Handle user logout
function handleLogout(e) {
    e.preventDefault();
    
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'info');
    
    // Update UI and redirect to home
    updateAuthUI();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}