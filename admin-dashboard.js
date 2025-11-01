// Admin Dashboard Functionality

// Admin Queue Management
const AdminQueueManager = {
    // Get queue statistics
    getQueueStats: () => {
        const queue = QueueManager.getQueue();
        return {
            total: queue.length,
            pending: queue.filter(r => r.status === 'pending').length,
            notified: queue.filter(r => r.status === 'notified').length,
            completed: queue.filter(r => r.status === 'completed').length
        };
    },
    
    // Get pending requests ordered by token number
    getPendingRequests: () => {
        const queue = QueueManager.getQueue();
        return queue.filter(r => r.status === 'pending').sort((a, b) => a.tokenNumber - b.tokenNumber);
    },
    
    // Get notified requests
    getNotifiedRequests: () => {
        const queue = QueueManager.getQueue();
        return queue.filter(r => r.status === 'notified').sort((a, b) => a.tokenNumber - b.tokenNumber);
    },
    
    // Get all active requests (pending + notified)
    getActiveRequests: () => {
        const queue = QueueManager.getQueue();
        return queue.filter(r => r.status !== 'completed').sort((a, b) => a.tokenNumber - b.tokenNumber);
    },
    
    // Notify user (change status to notified)
    notifyUser: (requestId) => {
        return QueueManager.updateRequestStatus(requestId, 'notified');
    },
    
    // Complete request (mark as completed)
    completeRequest: (requestId) => {
        return QueueManager.updateRequestStatus(requestId, 'completed');
    },
    
    // Delete request completely
    deleteRequest: (requestId) => {
        QueueManager.deleteRequest(requestId);
    },
    
    // Clear all completed requests
    clearCompleted: () => {
        const queue = QueueManager.getQueue();
        const activeQueue = queue.filter(r => r.status !== 'completed');
        QueueManager.saveQueue(activeQueue);
    },
    
    // Auto-notify next user in queue
    autoNotifyNext: () => {
        const pendingRequests = AdminQueueManager.getPendingRequests();
        if (pendingRequests.length > 0) {
            const nextRequest = pendingRequests[0];
            return AdminQueueManager.notifyUser(nextRequest.id);
        }
        return null;
    }
};

// Admin UI Management
const AdminUI = {
    updateStats: () => {
        const stats = AdminQueueManager.getQueueStats();
        
        document.getElementById('totalRequests').textContent = stats.total;
        document.getElementById('pendingRequests').textContent = stats.pending;
        document.getElementById('completedRequests').textContent = stats.completed;
        
        // Enable/disable next notify button
        const notifyNextBtn = document.getElementById('notifyNextBtn');
        if (notifyNextBtn) {
            notifyNextBtn.disabled = stats.pending === 0;
        }
    },
    
    renderQueue: () => {
        const queueList = document.getElementById('queueList');
        const emptyQueue = document.getElementById('emptyQueue');
        const activeRequests = AdminQueueManager.getActiveRequests();
        
        // Clear existing content
        queueList.innerHTML = '';
        
        if (activeRequests.length === 0) {
            emptyQueue.classList.remove('hidden');
            queueList.classList.add('hidden');
        } else {
            emptyQueue.classList.add('hidden');
            queueList.classList.remove('hidden');
            
            activeRequests.forEach(request => {
                const queueItem = AdminUI.createQueueItem(request);
                queueList.appendChild(queueItem);
            });
        }
    },
    
    createQueueItem: (request) => {
        const item = document.createElement('div');
        item.className = `queue-item ${request.status === 'notified' ? 'notified' : ''} fade-in`;
        
        // Get queue position information
        const queueInfo = QueueManager.getUserQueueInfo(request.tokenNumber);
        const positionText = queueInfo ? `Position: ${queueInfo.position}` : 'Position: -';
        
        const statusText = request.status === 'pending' ? 'Waiting' : 
                          request.status === 'notified' ? 'Notified' : 'Completed';
        const timeText = request.status === 'notified' ? 
            `Notified: ${AdminUI.formatTime(request.notifiedAt)}` : 
            `Requested: ${AdminUI.formatTime(request.requestedAt)}`;
        
        const priorityIndicator = queueInfo && queueInfo.isNext ? 
            '<span style="color: #f39c12; font-weight: bold;">🔔 NEXT</span>' : '';
        
        item.innerHTML = `
            <div class="queue-item-info">
                <h4>${request.userName} (Token #${request.tokenNumber}) ${priorityIndicator}</h4>
                <p>Roll: ${request.rollNumber} | Email: ${request.userEmail}</p>
                <p>Status: ${statusText} | ${positionText} | ${timeText}</p>
            </div>
            <div class="queue-actions">
                ${request.status === 'pending' ? 
                    `<button class="btn btn-primary" onclick="AdminActions.notifyUser(${request.id})">Call</button>` :
                    `<button class="btn btn-secondary" disabled>Called</button>`
                }
                <button class="btn btn-admin" onclick="AdminActions.completeRequest(${request.id})">Complete</button>
                <button class="btn btn-danger" onclick="AdminActions.deleteRequest(${request.id})">Delete</button>
            </div>
        `;
        
        return item;
    },
    
    formatTime: (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },
    
    refresh: () => {
        AdminUI.updateStats();
        AdminUI.renderQueue();
    }
};

// Admin Actions
const AdminActions = {
    notifyUser: (requestId) => {
        const request = AdminQueueManager.notifyUser(requestId);
        if (request) {
            // Show browser notification to simulate alert to user
            if (Notification.permission === 'granted') {
                new Notification('Fee Payment Queue - Admin Action', {
                    body: `${request.userName} has been called. Token #${request.tokenNumber}`,
                    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMmMtNS41MiAwLTEwIDQuNDgtMTAgMTBzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwLTQuNDgtMTAtMTAtMTB6bTEgMTVoLTJ2LTZoMnY2em0wLThoLTJ2LTJoMnYyeiI+PC9wYXRoPjwvc3ZnPg=='
                });
            }
            
            // Show admin notification
            showNotification(`${request.userName} (Token #${request.tokenNumber}) has been called!`, 'success');
            
            // Simulate user notification with alert
            setTimeout(() => {
                alert(`NOTIFICATION TO USER:\n\nHi ${request.userName}!\n\nIt's your turn for fee payment.\nToken Number: #${request.tokenNumber}\n\nPlease proceed to the cashier counter immediately.`);
            }, 500);
            
            AdminUI.refresh();
        }
    },
    
    completeRequest: (requestId) => {
        const queue = QueueManager.getQueue();
        const request = queue.find(r => r.id === requestId);
        
        if (request && confirm(`Mark ${request.userName}'s payment as completed?`)) {
            AdminQueueManager.completeRequest(requestId);
            showNotification(`${request.userName}'s fee payment has been completed.`, 'success');
            
            // Auto-notify next user after 2 seconds
            setTimeout(() => {
                const nextNotified = AdminQueueManager.autoNotifyNext();
                if (nextNotified) {
                    showNotification(`Next user ${nextNotified.userName} (Token #${nextNotified.tokenNumber}) has been automatically called!`, 'info');
                    
                    // Show notification for next user
                    setTimeout(() => {
                        alert(`AUTOMATIC NOTIFICATION:\n\nHi ${nextNotified.userName}!\n\nIt's your turn for fee payment.\nToken Number: #${nextNotified.tokenNumber}\n\nPlease proceed to the cashier counter.`);
                    }, 1000);
                }
                AdminUI.refresh();
            }, 2000);
            
            AdminUI.refresh();
        }
    },
    
    deleteRequest: (requestId) => {
        const queue = QueueManager.getQueue();
        const request = queue.find(r => r.id === requestId);
        
        if (request && confirm(`Delete ${request.userName}'s request permanently?`)) {
            AdminQueueManager.deleteRequest(requestId);
            showNotification(`${request.userName}'s request has been deleted.`, 'info');
            AdminUI.refresh();
        }
    },
    
    notifyNext: () => {
        const nextNotified = AdminQueueManager.autoNotifyNext();
        if (nextNotified) {
            showNotification(`${nextNotified.userName} (Token #${nextNotified.tokenNumber}) has been called!`, 'success');
            
            // Show notification alert
            setTimeout(() => {
                alert(`NOTIFICATION TO USER:\n\nHi ${nextNotified.userName}!\n\nIt's your turn for fee payment.\nToken Number: #${nextNotified.tokenNumber}\n\nPlease proceed to the cashier counter immediately.`);
            }, 500);
            
            AdminUI.refresh();
        } else {
            showNotification('No pending requests to notify.', 'warning');
        }
    },
    
    clearCompleted: () => {
        if (confirm('Clear all completed requests from the system?')) {
            AdminQueueManager.clearCompleted();
            showNotification('All completed requests have been cleared.', 'info');
            AdminUI.refresh();
        }
    },
    
    refresh: () => {
        AdminUI.refresh();
        showNotification('Queue refreshed.', 'info');
    }
};

// Auto-refresh functionality
let autoRefreshInterval;

const startAutoRefresh = () => {
    // Refresh every 10 seconds
    autoRefreshInterval = setInterval(() => {
        AdminUI.refresh();
    }, 10000);
};

const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check admin authentication
    let isAuthenticated;
    try {
        isAuthenticated = checkAdminAuthentication();
    } catch (error) {
        console.error('Admin authentication check error:', error);
        // Try alternative method
        const session = localStorage.getItem('adminSession');
        isAuthenticated = session !== null;
    }
    
    if (!isAuthenticated) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Initial render
    AdminUI.refresh();
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Request notification permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Event listeners
    const refreshBtn = document.getElementById('refreshQueue');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', AdminActions.refresh);
    }
    
    const notifyNextBtn = document.getElementById('notifyNextBtn');
    if (notifyNextBtn) {
        notifyNextBtn.addEventListener('click', AdminActions.notifyNext);
    }
    
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', AdminActions.clearCompleted);
    }
    
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                stopAutoRefresh();
                if (typeof AdminSession !== 'undefined') {
                    AdminSession.clearSession();
                }
                // Alternative way to clear admin session
                localStorage.removeItem('adminSession');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Admin logout error:', error);
                // Force redirect anyway
                localStorage.removeItem('adminSession');
                window.location.href = 'index.html';
            }
        });
    }
});

// Cleanup when page is unloaded
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// Make AdminActions available globally for onclick handlers
window.AdminActions = AdminActions;