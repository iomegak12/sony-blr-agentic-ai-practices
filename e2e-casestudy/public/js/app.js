// App Configuration
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
    health: '/health',
    generate: '/generate'
};

// DOM Elements
let elements = {};

// Application State
let currentTheme = 'light';
let isLoading = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    initializeTheme();
    initializeNavigation();
    
    // Load health status on startup
    if (getCurrentSection() === 'health') {
        checkHealthStatus();
    }
});

// Initialize DOM element references
function initializeElements() {
    elements = {
        // Navigation
        navLinks: document.querySelectorAll('.nav-link'),
        sections: document.querySelectorAll('.section'),
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.querySelector('.theme-icon'),
        hamburger: document.querySelector('.hamburger'),
        navMenu: document.querySelector('.nav-menu'),
        
        // Chat
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        urlInput: document.getElementById('urlInput'),
        sendButton: document.getElementById('sendButton'),
        sendText: document.querySelector('.send-text'),
        loadingSpinner: document.querySelector('.loading-spinner'),
        
        // Health
        healthStatus: document.getElementById('healthStatus'),
        healthDetails: document.getElementById('healthDetails'),
        refreshHealth: document.getElementById('refreshHealth')
    };
}

// Initialize event listeners
function initializeEventListeners() {
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    elements.hamburger.addEventListener('click', toggleMobileMenu);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Chat functionality
    elements.sendButton.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keydown', handleMessageInputKeydown);
    elements.messageInput.addEventListener('input', autoResizeTextarea);
    elements.urlInput.addEventListener('input', autoResizeTextarea);
    
    // Health check
    elements.refreshHealth.addEventListener('click', checkHealthStatus);
    
    // Window resize handler
    window.addEventListener('resize', handleWindowResize);
}

// Navigation Functions
function handleNavigation(event) {
    event.preventDefault();
    const targetSection = event.target.getAttribute('data-section');
    if (targetSection) {
        navigateToSection(targetSection);
        closeMobileMenu();
    }
}

function navigateToSection(sectionName) {
    // Update active nav link
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
    
    // Show target section
    elements.sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionName) {
            section.classList.add('active');
        }
    });
    
    // Load section-specific data
    if (sectionName === 'health') {
        checkHealthStatus();
    }
    
    // Update URL hash
    window.location.hash = sectionName;
}

function initializeNavigation() {
    // Check URL hash on load
    const hash = window.location.hash.substring(1);
    if (hash && ['home', 'chat', 'health'].includes(hash)) {
        navigateToSection(hash);
    } else {
        navigateToSection('home');
    }
}

function getCurrentSection() {
    const activeSection = document.querySelector('.section.active');
    return activeSection ? activeSection.id : 'home';
}

function toggleMobileMenu() {
    elements.navMenu.classList.toggle('active');
    elements.hamburger.classList.toggle('active');
}

function closeMobileMenu() {
    elements.navMenu.classList.remove('active');
    elements.hamburger.classList.remove('active');
}

function handleWindowResize() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
}

// Theme Functions
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme icon
    elements.themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Chat Functions
function handleMessageInputKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResizeTextarea(event) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

async function sendMessage() {
    const message = elements.messageInput.value.trim();
    const urls = elements.urlInput.value.trim().split('\n').filter(url => url.trim() !== '');
    
    if (!message || isLoading) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const response = await sendToAPI(message, urls.length > 0 ? urls : null);
        addMessageToChat(response.answer, 'assistant', response.execution_time);
    } catch (error) {
        console.error('Error sending message:', error);
        addMessageToChat('Sorry, I encountered an error processing your request. Please try again.', 'assistant');
        showErrorMessage('Failed to send message: ' + error.message);
    } finally {
        setLoadingState(false);
    }
}

async function sendToAPI(question, urls = null) {
    const requestBody = { question };
    if (urls && urls.length > 0) {
        requestBody.urls = urls;
    }
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.generate}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
}

function addMessageToChat(content, sender, executionTime = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textP = document.createElement('p');
    textP.textContent = content;
    contentDiv.appendChild(textP);
    
    const metaDiv = document.createElement('div');
    metaDiv.className = 'message-meta';
    
    const timestamp = new Date().toLocaleTimeString();
    let metaText = timestamp;
    
    if (sender === 'assistant' && executionTime !== null) {
        metaText += ` • ${executionTime.toFixed(2)}s`;
    }
    
    metaDiv.textContent = metaText;
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(metaDiv);
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function setLoadingState(loading) {
    isLoading = loading;
    elements.sendButton.disabled = loading;
    elements.sendText.style.display = loading ? 'none' : 'inline';
    elements.loadingSpinner.style.display = loading ? 'inline' : 'none';
    
    if (loading) {
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message assistant-message loading-message';
        loadingMessage.innerHTML = `
            <div class="message-content">
                <p>Thinking...</p>
            </div>
        `;
        elements.chatMessages.appendChild(loadingMessage);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    } else {
        // Remove loading message
        const loadingMessage = elements.chatMessages.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }
}

// Health Check Functions
async function checkHealthStatus() {
    showHealthLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.health}`);
        
        if (response.ok) {
            const healthData = await response.json();
            showHealthStatus(true, healthData);
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Health check failed:', error);
        showHealthStatus(false, { error: error.message });
    }
}

function showHealthLoading() {
    elements.healthStatus.innerHTML = `
        <div class="status-card loading">
            <div class="status-indicator">
                <div class="spinner"></div>
            </div>
            <div class="status-info">
                <h3>Checking API Status...</h3>
                <p>Please wait while we verify the connection</p>
            </div>
        </div>
    `;
    elements.healthDetails.innerHTML = '';
}

function showHealthStatus(isHealthy, data) {
    const statusClass = isHealthy ? 'healthy' : 'unhealthy';
    const statusIcon = isHealthy ? '✅' : '❌';
    const statusText = isHealthy ? 'API is running smoothly' : 'API is experiencing issues';
    const statusTitle = isHealthy ? 'System Healthy' : 'System Error';
    
    elements.healthStatus.innerHTML = `
        <div class="status-card ${statusClass}">
            <div class="status-indicator ${statusClass}">
                ${statusIcon}
            </div>
            <div class="status-info">
                <h3>${statusTitle}</h3>
                <p>${statusText}</p>
            </div>
        </div>
    `;
    
    if (isHealthy) {
        showHealthDetails(data);
    } else {
        showErrorDetails(data);
    }
}

function showHealthDetails(data) {
    const timestamp = new Date(data.timestamp * 1000).toLocaleString();
    
    elements.healthDetails.innerHTML = `
        <div class="detail-card">
            <h4>Status</h4>
            <p>${data.status}</p>
        </div>
        <div class="detail-card">
            <h4>Version</h4>
            <p>${data.version}</p>
        </div>
        <div class="detail-card">
            <h4>Last Check</h4>
            <p>${timestamp}</p>
        </div>
        <div class="detail-card">
            <h4>Response Time</h4>
            <p>< 100ms</p>
        </div>
    `;
}

function showErrorDetails(data) {
    elements.healthDetails.innerHTML = `
        <div class="detail-card">
            <h4>Error</h4>
            <p>${data.error}</p>
        </div>
        <div class="detail-card">
            <h4>Troubleshooting</h4>
            <p>Check if the API server is running on port 8000</p>
        </div>
    `;
}

// Utility Functions
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.section.active .container');
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const container = document.querySelector('.section.active .container');
    if (container) {
        container.insertBefore(successDiv, container.firstChild);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Global functions for button onclick handlers
window.navigateToSection = navigateToSection;

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        navigateToSection,
        checkHealthStatus,
        setTheme
    };
}
