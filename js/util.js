// Utility functions for PetPal app

// Check if user is logged in
function isLoggedIn() {
    const user = localStorage.getItem('currentUser');
    console.log('isLoggedIn check:', user ? 'User exists' : 'No user');
    return user !== null && user !== 'null' && user !== 'undefined';
}

// Get current user
function getCurrentUser() {
    try {
        const user = localStorage.getItem('currentUser');
        console.log('getCurrentUser raw:', user);
        if (!user || user === 'null' || user === 'undefined') {
            return null;
        }
        return JSON.parse(user);
    } catch (error) {
        console.error('Error parsing currentUser:', error);
        return null;
    }
}

// Get user's pets
function getUserPets() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    return pets.filter(pet => pet.userId === currentUser.id);
}

// Save pets to localStorage
function savePets(pets) {
    localStorage.setItem('pets', JSON.stringify(pets));
}

// Get user's schedules
function getUserSchedules() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    return schedules.filter(schedule => schedule.userId === currentUser.id);
}

// Save schedules to localStorage
function saveSchedules(schedules) {
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

// Get user's health records
function getUserHealthRecords() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const healthRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    return healthRecords.filter(record => record.userId === currentUser.id);
}

// Save health records to localStorage
function saveHealthRecords(healthRecords) {
    localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time for display
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Get color for activity type
function getActivityColor(type) {
    const colors = {
        'feeding': 'linear-gradient(90deg, #FF9A9E, #FAD0C4)',
        'walk': 'linear-gradient(90deg, #A1C4FD, #C2E9FB)',
        'medication': 'linear-gradient(90deg, #FFECD2, #FCB69F)',
        'vet': 'linear-gradient(90deg, #84FAB0, #8FD3F4)',
        'grooming': 'linear-gradient(90deg, #D4FC79, #96E6A1)',
        'vaccination': 'linear-gradient(90deg, #FF9A9E, #FAD0C4)',
        'condition': 'linear-gradient(90deg, #A1C4FD, #C2E9FB)',
        'other': 'linear-gradient(90deg, #A3BFFA, #7FDBDA)'
    };
    return colors[type] || colors['other'];
}

// Get icon for activity type
function getActivityIcon(type) {
    const icons = {
        'feeding': 'fa-utensils',
        'walk': 'fa-walking',
        'medication': 'fa-pills',
        'vet': 'fa-stethoscope',
        'grooming': 'fa-cut',
        'other': 'fa-calendar-check'
    };
    return icons[type] || icons['other'];
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

// Update authentication UI based on login status
function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    console.log('updateAuthUI called, authLink found:', !!authLink);
    
    if (!authLink) {
        console.log('No auth-link element found on this page');
        return;
    }
    
    const loggedIn = isLoggedIn();
    console.log('User logged in:', loggedIn);
    
    if (loggedIn) {
        const currentUser = getCurrentUser();
        console.log('Current user:', currentUser);
        if (currentUser && currentUser.name) {
            authLink.innerHTML = `<a href="#" id="logout-btn">Logout (${currentUser.name})</a>`;
            
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        } else {
            authLink.innerHTML = '<a href="login.html">Login</a>';
        }
    } else {
        authLink.innerHTML = '<a href="login.html">Login</a>';
    }
}

// Handle user logout
function handleLogout(e) {
    if (e) e.preventDefault();
    
    console.log('Logging out user');
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'info');
    
    // Update UI immediately
    updateAuthUI();
    
    // Redirect to home page after a short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// Make functions globally available
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.getUserPets = getUserPets;
window.savePets = savePets;
window.getUserSchedules = getUserSchedules;
window.saveSchedules = saveSchedules;
window.getUserHealthRecords = getUserHealthRecords;
window.saveHealthRecords = saveHealthRecords;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.getActivityColor = getActivityColor;
window.getActivityIcon = getActivityIcon;
window.showNotification = showNotification;
window.updateAuthUI = updateAuthUI;
window.handleLogout = handleLogout;

// Add slideOut animation if not already defined
if (!document.querySelector('#notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize auth when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Utils initialized');
    updateAuthUI();
});
