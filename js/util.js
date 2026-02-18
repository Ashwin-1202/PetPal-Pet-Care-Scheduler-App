
function isLoggedIn() {
    const user = localStorage.getItem('currentUser');
    console.log('isLoggedIn check:', user ? 'User exists' : 'No user');
    return user !== null && user !== 'null' && user !== 'undefined';
}


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


function getUserPets() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const pets = JSON.parse(localStorage.getItem('pets') || '[]');
    return pets.filter(pet => pet.userId === currentUser.id);
}


function savePets(pets) {
    localStorage.setItem('pets', JSON.stringify(pets));
}


function getUserSchedules() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    return schedules.filter(schedule => schedule.userId === currentUser.id);
}


function saveSchedules(schedules) {
    localStorage.setItem('schedules', JSON.stringify(schedules));
}


function getUserHealthRecords() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const healthRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    return healthRecords.filter(record => record.userId === currentUser.id);
}


function saveHealthRecords(healthRecords) {
    localStorage.setItem('healthRecords', JSON.stringify(healthRecords));
}


function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}


function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}


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


function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });

    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    
    document.body.appendChild(notification);
    
    
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
    
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}


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


document.addEventListener('DOMContentLoaded', function() {
    console.log('Utils initialized');
    updateAuthUI();
});

