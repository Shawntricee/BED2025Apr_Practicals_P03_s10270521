// Global utilities for the Library API frontend

// API Base URL
const API_BASE_URL = window.location.origin;

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Helper function to check if user is authenticated
function isAuthenticated() {
    return !!(getAuthToken() && getCurrentUser());
}

// Helper function to check if user is librarian
function isLibrarian() {
    const user = getCurrentUser();
    return user && user.role === 'librarian';
}

// Helper function to make authenticated API requests
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
        const data = await response.json();
        
        return {
            ok: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            data: { message: error.message }
        };
    }
}

// Helper function to show messages
function showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const typeClasses = {
        success: 'message success',
        error: 'message error',
        info: 'message info',
        warning: 'message warning'
    };

    element.innerHTML = `<div class="${typeClasses[type] || typeClasses.info}">${message}</div>`;
}

// Helper function to clear authentication and redirect to login
function requireLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Common logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Initialize page authentication check
function initAuth(requiredRole = null) {
    const token = getAuthToken();
    const user = getCurrentUser();

    if (!token || !user) {
        return false;
    }

    if (requiredRole && user.role !== requiredRole) {
        return false;
    }

    return true;
}

// Export for use in other scripts
window.LibraryAPI = {
    getAuthToken,
    getCurrentUser,
    isAuthenticated,
    isLibrarian,
    apiRequest,
    showMessage,
    requireLogin,
    logout,
    initAuth
};