// User Authentication System - Registration and Login

// Utility functions for localStorage management
const StorageManager = {
    // Get all registered users
    getUsers: () => {
        const users = localStorage.getItem('feePaymentUsers');
        return users ? JSON.parse(users) : [];
    },
    
    // Save users array to localStorage
    saveUsers: (users) => {
        localStorage.setItem('feePaymentUsers', JSON.stringify(users));
    },
    
    // Get current session
    getCurrentUser: () => {
        const session = localStorage.getItem('currentUserSession');
        return session ? JSON.parse(session) : null;
    },
    
    // Save current session
    setCurrentUser: (user) => {
        localStorage.setItem('currentUserSession', JSON.stringify(user));
    },
    
    // Clear session
    clearSession: () => {
        localStorage.removeItem('currentUserSession');
    }
};

// Form validation functions
const Validator = {
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidPassword: (password) => {
        return password.length >= 6;
    },
    
    isValidName: (name) => {
        return name.trim().length >= 2;
    },
    
    isValidRollNumber: (rollNumber) => {
        return rollNumber.trim().length >= 3;
    }
};

// Notification system
const NotificationManager = {
    show: (message, type = 'info', duration = 5000) => {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type} fade-in`;
        notification.textContent = message;
        
        // Add to notification area or create one
        let notificationArea = document.querySelector('.notification-area');
        if (!notificationArea) {
            notificationArea = document.createElement('div');
            notificationArea.className = 'notification-area';
            document.querySelector('.form-container, .dashboard-content').appendChild(notificationArea);
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

// Registration functionality
if (document.getElementById('registrationForm')) {
    document.getElementById('registrationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('name').trim(),
            rollNumber: formData.get('rollNumber').trim(),
            email: formData.get('email').toLowerCase().trim(),
            password: formData.get('password')
        };
        const confirmPassword = formData.get('confirmPassword');
        
        // Validation
        if (!Validator.isValidName(userData.name)) {
            NotificationManager.show('Please enter a valid name (at least 2 characters)', 'warning');
            return;
        }
        
        if (!Validator.isValidRollNumber(userData.rollNumber)) {
            NotificationManager.show('Please enter a valid roll number (at least 3 characters)', 'warning');
            return;
        }
        
        if (!Validator.isValidEmail(userData.email)) {
            NotificationManager.show('Please enter a valid email address', 'warning');
            return;
        }
        
        if (!Validator.isValidPassword(userData.password)) {
            NotificationManager.show('Password must be at least 6 characters long', 'warning');
            return;
        }
        
        if (userData.password !== confirmPassword) {
            NotificationManager.show('Passwords do not match', 'warning');
            return;
        }
        
        // Check if user already exists
        const existingUsers = StorageManager.getUsers();
        const emailExists = existingUsers.some(user => user.email === userData.email);
        const rollExists = existingUsers.some(user => user.rollNumber === userData.rollNumber);
        
        if (emailExists) {
            NotificationManager.show('An account with this email already exists', 'warning');
            return;
        }
        
        if (rollExists) {
            NotificationManager.show('An account with this roll number already exists', 'warning');
            return;
        }
        
        // Add user to storage
        userData.id = Date.now(); // Simple ID generation
        userData.registeredAt = new Date().toISOString();
        existingUsers.push(userData);
        StorageManager.saveUsers(existingUsers);
        
        NotificationManager.show('Registration successful! Redirecting to login...', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
                    window.open('admin-dashboard.html', '_blank');
                }, 2000);
    });
}

// Login functionality
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email').toLowerCase().trim(),
            password: formData.get('password')
        };
        
        // Validation
        if (!Validator.isValidEmail(loginData.email)) {
            NotificationManager.show('Please enter a valid email address', 'warning');
            return;
        }
        
        if (!loginData.password) {
            NotificationManager.show('Please enter your password', 'warning');
            return;
        }
        
        // Check credentials
        const users = StorageManager.getUsers();
        const user = users.find(u => u.email === loginData.email && u.password === loginData.password);
        
        if (!user) {
            NotificationManager.show('Invalid email or password', 'warning');
            return;
        }
        
        // Set session
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email,
            rollNumber: user.rollNumber,
            loginAt: new Date().toISOString()
        };
        StorageManager.setCurrentUser(sessionData);
        
        NotificationManager.show('Login successful! Opening dashboard...', 'success');
        
        // Open dashboard in new window/tab
        setTimeout(() => {
            window.open('user-dashboard.html', '_blank');
        }, 1500);
    });
}

// Check authentication on protected pages
const checkAuthentication = () => {
    const currentUser = StorageManager.getCurrentUser();
    const protectedPages = ['user-dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !currentUser) {
        window.location.href = 'user-login.html';
        return false;
    }
    
    return currentUser;
};

// Auto-check authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});

// Export for use in other files
window.StorageManager = StorageManager;
window.NotificationManager = NotificationManager;
window.Validator = Validator;
window.checkAuthentication = checkAuthentication;