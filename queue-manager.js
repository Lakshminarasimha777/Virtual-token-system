// Shared Queue Management System for both User and Admin

// Queue Management System - Shared between user and admin
const QueueManager = {
    // Get all queue requests
    getQueue: () => {
        const queue = localStorage.getItem('feePaymentQueue');
        return queue ? JSON.parse(queue) : [];
    },
    
    // Save queue to localStorage
    saveQueue: (queue) => {
        localStorage.setItem('feePaymentQueue', JSON.stringify(queue));
    },
    
    // Add new request to queue
    addToQueue: (userRequest) => {
        const queue = QueueManager.getQueue();
        const newToken = QueueManager.generateToken();
        
        const request = {
            id: Date.now(),
            userId: userRequest.userId,
            userName: userRequest.userName,
            userEmail: userRequest.userEmail,
            rollNumber: userRequest.rollNumber,
            tokenNumber: newToken,
            status: 'pending', // pending, notified, completed
            requestedAt: new Date().toISOString(),
            notifiedAt: null,
            completedAt: null
        };
        
        queue.push(request);
        QueueManager.saveQueue(queue);
        return request;
    },
    
    // Generate token number
    generateToken: () => {
        const queue = QueueManager.getQueue();
        const maxToken = queue.length > 0 ? Math.max(...queue.map(r => r.tokenNumber)) : 0;
        return maxToken + 1;
    },
    
    // Get user's current request
    getUserRequest: (userId) => {
        const queue = QueueManager.getQueue();
        return queue.find(request => request.userId === userId && request.status !== 'completed');
    },
    
    // Cancel user request
    cancelRequest: (userId) => {
        const queue = QueueManager.getQueue();
        const updatedQueue = queue.filter(request => !(request.userId === userId && request.status !== 'completed'));
        QueueManager.saveQueue(updatedQueue);
    },
    
    // Get queue position (position in line, not token number)
    getQueuePosition: (tokenNumber) => {
        const queue = QueueManager.getQueue();
        const pendingRequests = queue.filter(r => r.status === 'pending').sort((a, b) => a.tokenNumber - b.tokenNumber);
        const position = pendingRequests.findIndex(r => r.tokenNumber === tokenNumber);
        return position === -1 ? null : position + 1;
    },
    
    // Get total pending count ahead of a specific token
    getPendingCountAhead: (tokenNumber) => {
        const queue = QueueManager.getQueue();
        const pendingRequests = queue.filter(r => r.status === 'pending' && r.tokenNumber < tokenNumber);
        return pendingRequests.length;
    },
    
    // Get queue statistics for a specific user
    getUserQueueInfo: (tokenNumber) => {
        const queue = QueueManager.getQueue();
        const userRequest = queue.find(r => r.tokenNumber === tokenNumber);
        
        if (!userRequest) return null;
        
        const totalPending = queue.filter(r => r.status === 'pending').length;
        const position = QueueManager.getQueuePosition(tokenNumber);
        const ahead = QueueManager.getPendingCountAhead(tokenNumber);
        
        return {
            tokenNumber: tokenNumber,
            status: userRequest.status,
            position: position,
            totalPending: totalPending,
            peopleAhead: ahead,
            isNext: position === 1
        };
    },
    
    // Update request status
    updateRequestStatus: (requestId, status) => {
        const queue = QueueManager.getQueue();
        const requestIndex = queue.findIndex(r => r.id === requestId);
        
        if (requestIndex !== -1) {
            queue[requestIndex].status = status;
            if (status === 'notified') {
                queue[requestIndex].notifiedAt = new Date().toISOString();
            } else if (status === 'completed') {
                queue[requestIndex].completedAt = new Date().toISOString();
            }
            QueueManager.saveQueue(queue);
            return queue[requestIndex];
        }
        return null;
    },
    
    // Delete request completely
    deleteRequest: (requestId) => {
        const queue = QueueManager.getQueue();
        const updatedQueue = queue.filter(r => r.id !== requestId);
        QueueManager.saveQueue(updatedQueue);
    }
};

// Make QueueManager globally available
window.QueueManager = QueueManager;