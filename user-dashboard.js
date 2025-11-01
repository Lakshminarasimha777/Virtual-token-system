// User Dashboard Functionality

// Dashboard UI Manager
const DashboardUI = {
    updateWelcomeMessage: (userName) => {
        const welcomeElement = document.getElementById('welcomeMessage');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${userName}!`;
        }
    },
    
    showNoTokenSection: () => {
        document.getElementById('noTokenSection').classList.remove('hidden');
        document.getElementById('tokenSection').classList.add('hidden');
    },
    
    showTokenSection: (request) => {
        document.getElementById('noTokenSection').classList.add('hidden');
        document.getElementById('tokenSection').classList.remove('hidden');
        
        // Get updated queue information
        const queueInfo = QueueManager.getUserQueueInfo(request.tokenNumber);
        
        // Update token information
        document.getElementById('tokenNumber').textContent = `#${request.tokenNumber}`;
        
        // Update status
        const statusElement = document.getElementById('tokenStatus');
        statusElement.textContent = request.status.charAt(0).toUpperCase() + request.status.slice(1);
        statusElement.className = `status-badge status-${request.status}`;
        
        // Update queue position with detailed information
        const queuePositionElement = document.getElementById('queuePosition');
        
        if (request.status === 'pending' && queueInfo) {
            if (queueInfo.isNext) {
                queuePositionElement.innerHTML = `
                    <strong style="color: #f39c12;">🔔 You're NEXT in line!</strong><br>
                    <small>Position: ${queueInfo.position} of ${queueInfo.totalPending} people waiting</small>
                `;
            } else {
                queuePositionElement.innerHTML = `
                    📍 Position in queue: <strong>${queueInfo.position}</strong> of ${queueInfo.totalPending}<br>
                    <small>${queueInfo.peopleAhead} people ahead of you</small>
                `;
            }
            queuePositionElement.style.color = '#2c3e50';
            queuePositionElement.style.fontWeight = 'normal';
        } else if (request.status === 'notified') {
            queuePositionElement.innerHTML = "🎉 <strong>It's your turn!</strong> Please proceed to the cashier.";
            queuePositionElement.style.color = '#27ae60';
            queuePositionElement.style.fontWeight = 'bold';
        } else if (request.status === 'completed') {
            queuePositionElement.innerHTML = "✅ Payment completed. Thank you!";
            queuePositionElement.style.color = '#95a5a6';
            queuePositionElement.style.fontWeight = 'normal';
        } else {
            queuePositionElement.innerHTML = "📝 You are currently in the queue";
            queuePositionElement.style.color = '#7f8c8d';
            queuePositionElement.style.fontWeight = 'normal';
        }
    },
    
    showNotification: (message, type = 'info') => {
        const notificationArea = document.getElementById('notificationSection');
        
        // Clear existing notifications
        notificationArea.innerHTML = '';
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type} fade-in`;
        notification.textContent = message;
        
        notificationArea.appendChild(notification);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
};

// Notification Polling System
const NotificationPoller = {
    intervalId: null,
    lastKnownStatus: null,
    lastKnownPosition: null,
    wasNext: false,
    
    start: (userId) => {
        // Poll every 3 seconds for status and position updates
        NotificationPoller.intervalId = setInterval(() => {
            const request = QueueManager.getUserRequest(userId);
            
            if (request) {
                // Check for status changes
                if (request.status !== NotificationPoller.lastKnownStatus) {
                    if (request.status === 'notified' && NotificationPoller.lastKnownStatus === 'pending') {
                        // Show browser notification if supported
                        if (Notification.permission === 'granted') {
                            new Notification('Fee Payment Queue', {
                                body: "It's your turn! Please proceed to the cashier.",
                                icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMmMtNS41MiAwLTEwIDQuNDgtMTAgMTBzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwLTQuNDgtMTAtMTAtMTB6bTEgMTVoLTJ2LTZoMnY2em0wLThoLTJ2LTJoMnYyeiI+PC9wYXRoPjwvc3ZnPg=='
                            });
                        }
                        
                        // Show in-page notification
                        DashboardUI.showNotification("🎉 It's your turn! Please proceed to the cashier for fee payment.", 'success');
                    }
                    
                    NotificationPoller.lastKnownStatus = request.status;
                }
                
                // Check for position changes (when people ahead complete)
                const queueInfo = QueueManager.getUserQueueInfo(request.tokenNumber);
                if (queueInfo && NotificationPoller.lastKnownPosition !== queueInfo.position) {
                    if (NotificationPoller.lastKnownPosition && queueInfo.position < NotificationPoller.lastKnownPosition) {
                        // Position improved (moved forward in queue)
                        DashboardUI.showNotification(`📈 You moved forward! Now position ${queueInfo.position} in queue.`, 'info');
                    }
                    
                    if (queueInfo.isNext && !NotificationPoller.wasNext) {
                        // User is now next in line
                        DashboardUI.showNotification("🔔 You're next in line! Get ready.", 'warning');
                    }
                    
                    NotificationPoller.lastKnownPosition = queueInfo.position;
                    NotificationPoller.wasNext = queueInfo.isNext;
                }
                
                // Always update the display to show current position
                DashboardUI.showTokenSection(request);
            }
        }, 3000);
    },
    
    stop: () => {
        if (NotificationPoller.intervalId) {
            clearInterval(NotificationPoller.intervalId);
            NotificationPoller.intervalId = null;
        }
    }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    let currentUser;
    try {
        currentUser = checkAuthentication();
    } catch (error) {
        console.error('Authentication check error:', error);
        // Try alternative method
        const session = localStorage.getItem('currentUserSession');
        currentUser = session ? JSON.parse(session) : null;
    }
    
    if (!currentUser) {
        window.location.href = 'user-login.html';
        return;
    }
    
    // Update UI with user info
    DashboardUI.updateWelcomeMessage(currentUser.name);
    
    // Check if user has existing request
    const existingRequest = QueueManager.getUserRequest(currentUser.id);
    
    if (existingRequest) {
        DashboardUI.showTokenSection(existingRequest);
        NotificationPoller.lastKnownStatus = existingRequest.status;
        
        // Initialize position tracking
        const queueInfo = QueueManager.getUserQueueInfo(existingRequest.tokenNumber);
        if (queueInfo) {
            NotificationPoller.lastKnownPosition = queueInfo.position;
            NotificationPoller.wasNext = queueInfo.isNext;
        }
    } else {
        DashboardUI.showNoTokenSection();
    }
    
    // Start notification polling
    NotificationPoller.start(currentUser.id);
    
    // Request browser notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Request token button
    const requestTokenBtn = document.getElementById('requestTokenBtn');
    if (requestTokenBtn) {
        requestTokenBtn.addEventListener('click', () => {
            const currentUser = StorageManager.getCurrentUser();
            if (!currentUser) return;
            
            // Check if user already has a pending request
            const existingRequest = QueueManager.getUserRequest(currentUser.id);
            if (existingRequest) {
                DashboardUI.showNotification('You already have a pending fee payment request.', 'warning');
                return;
            }
            
            // Create new request
            const newRequest = QueueManager.addToQueue({
                userId: currentUser.id,
                userName: currentUser.name,
                userEmail: currentUser.email,
                rollNumber: currentUser.rollNumber
            });
            
            // Update UI
            DashboardUI.showTokenSection(newRequest);
            NotificationPoller.lastKnownStatus = newRequest.status;
            
            DashboardUI.showNotification(`Token #${newRequest.tokenNumber} generated successfully! Please wait for your turn.`, 'success');
        });
    }
    
    // Cancel token button
    const cancelTokenBtn = document.getElementById('cancelTokenBtn');
    if (cancelTokenBtn) {
        cancelTokenBtn.addEventListener('click', () => {
            const currentUser = StorageManager.getCurrentUser();
            if (!currentUser) return;
            
            if (confirm('Are you sure you want to cancel your fee payment request?')) {
                QueueManager.cancelRequest(currentUser.id);
                DashboardUI.showNoTokenSection();
                NotificationPoller.lastKnownStatus = null;
                
                DashboardUI.showNotification('Your fee payment request has been cancelled.', 'info');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                NotificationPoller.stop();
                if (typeof StorageManager !== 'undefined') {
                    StorageManager.clearSession();
                }
                // Alternative way to clear session
                localStorage.removeItem('currentUserSession');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                // Force redirect anyway
                localStorage.removeItem('currentUserSession');
                window.location.href = 'index.html';
            }
        });
    }
});

// Cleanup when page is unloaded
window.addEventListener('beforeunload', () => {
    NotificationPoller.stop();
});

// Export for use in other files
window.QueueManager = QueueManager;