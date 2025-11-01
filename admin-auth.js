// Admin Authentication System

// Admin credentials (in a real system, this would be more secure)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Admin Session Management
const AdminSession = {
    setSession: () => {
        const sessionData = {
            isAdmin: true,
            loginAt: new Date().toISOString()
        };
        localStorage.setItem('adminSession', JSON.stringify(sessionData));
    },
    
    getSession: () => {
        const session = localStorage.getItem('adminSession');
        return session ? JSON.parse(session) : null;
    },
    
    clearSession: () => {
        localStorage.removeItem('adminSession');
    },
    
    isAuthenticated: () => {
        return AdminSession.getSession() !== null;
    }
};

// Admin login form handling
document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const loginData = {
                username: formData.get('username').trim(),
                password: formData.get('password')
            };
            
            // Validate credentials
            if (loginData.username === ADMIN_CREDENTIALS.username && 
                loginData.password === ADMIN_CREDENTIALS.password) {
                
                // Set admin session
                AdminSession.setSession();
                
                // Show success message
                showNotification('Admin login successful! Opening admin dashboard...', 'success');
                
                // Open admin dashboard in new window/tab
                setTimeout(() => {
                    window.open('admin-dashboard.html', '_blank');
                }, 1500);
                
            } else {
                showNotification('Invalid admin credentials!', 'warning');
            }
        });
    }
});

// Check admin authentication on protected pages
const checkAdminAuthentication = () => {
    const adminPages = ['admin-dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (adminPages.includes(currentPage) && !AdminSession.isAuthenticated()) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    return true;
};

// Notification function for admin pages
const showNotification = (message, type = 'info', duration = 4000) => {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.textContent = message;
    
    // Add to form container or create notification area
    let container = document.querySelector('.form-container');
    if (!container) {
        container = document.querySelector('.admin-content');
    }
    
    if (container) {
        // Create notification area if it doesn't exist
        let notificationArea = container.querySelector('.notification-area');
        if (!notificationArea) {
            notificationArea = document.createElement('div');
            notificationArea.className = 'notification-area';
            container.insertBefore(notificationArea, container.firstChild);
        }
        
        notificationArea.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
};

// Auto-check admin authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuthentication();
});

// Export for use in other files
window.AdminSession = AdminSession;
window.checkAdminAuthentication = checkAdminAuthentication;
window.showNotification = showNotification;