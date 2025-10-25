// Utility functions for PetPal app

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Get color class for activity type
function getActivityColor(type) {
    const colors = {
        'feeding': 'linear-gradient(90deg, #FF9A9E, #FAD0C4)',
        'walk': 'linear-gradient(90deg, #A1C4FD, #C2E9FB)',
        'medication': 'linear-gradient(90deg, #FFECD2, #FCB69F)',
        'vet': 'linear-gradient(90deg, #84FAB0, #8FD3F4)',
        'grooming': 'linear-gradient(90deg, #D4FC79, #96E6A1)',
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
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: 600;
                z-index: 3000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 500px;
                animation: slideIn 0.3s ease;
            }
            .notification.success {
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
            }
            .notification.error {
                background: linear-gradient(90deg, #F44336, #E91E63);
            }
            .notification.info {
                background: linear-gradient(90deg, #2196F3, #03A9F4);
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                margin-left: 10px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
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