// Popup JavaScript - User interface interactions
class PopupUI {
  constructor() {
    this.elements = {};
    this.initialize();
  }

  /**
   * Initializes the popup UI
   */
  async initialize() {
    try {
      this.cacheElements();
      this.setupEventListeners();
      await this.loadStatus();
      this.startStatusPolling();
    } catch (error) {
      console.error('Popup initialization failed:', error);
      this.showError('Failed to initialize popup');
    }
  }

  /**
   * Caches DOM elements
   */
  cacheElements() {
    this.elements = {
      // Status elements
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      emrDetected: document.getElementById('emrDetected'),
      dataStatus: document.getElementById('dataStatus'),
      expiresIn: document.getElementById('expiresIn'),

      // Action buttons
      captureBtn: document.getElementById('captureBtn'),
      fillBtn: document.getElementById('fillBtn'),
      clearBtn: document.getElementById('clearBtn'),

      // Footer buttons
      settingsBtn: document.getElementById('settingsBtn'),
      helpBtn: document.getElementById('helpBtn'),

      // Overlays and modals
      loadingOverlay: document.getElementById('loadingOverlay'),
      errorModal: document.getElementById('errorModal'),
      errorMessage: document.getElementById('errorMessage'),
      errorModalClose: document.getElementById('errorModalClose'),
      errorModalOk: document.getElementById('errorModalOk')
    };
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    // Action buttons
    this.elements.captureBtn.addEventListener('click', () => this.handleCapture());
    this.elements.fillBtn.addEventListener('click', () => this.handleFill());
    this.elements.clearBtn.addEventListener('click', () => this.handleClear());

    // Footer buttons
    this.elements.settingsBtn.addEventListener('click', () => this.handleSettings());
    this.elements.helpBtn.addEventListener('click', () => this.handleHelp());

    // Modal events
    this.elements.errorModalClose.addEventListener('click', () => this.hideErrorModal());
    this.elements.errorModalOk.addEventListener('click', () => this.hideErrorModal());

    // Close modal on overlay click
    this.elements.errorModal.addEventListener('click', (e) => {
      if (e.target === this.elements.errorModal) {
        this.hideErrorModal();
      }
    });
  }

  /**
   * Loads current status
   */
  async loadStatus() {
    try {
      const response = await this.sendMessage({ action: 'status' });
      
      if (response.success && response.data) {
        this.updateStatus(response.data);
      } else {
        this.updateStatus({
          hasData: false,
          timeRemaining: 0,
          emrDetected: 'Unknown',
          dataAge: 0
        });
      }
    } catch (error) {
      console.error('Failed to load status:', error);
      this.updateStatus({
        hasData: false,
        timeRemaining: 0,
        emrDetected: 'Error',
        dataAge: 0
      });
    }
  }

  /**
   * Updates the status display
   */
  updateStatus(status) {
    // Update status dot
    if (status.hasData) {
      this.elements.statusDot.className = 'status-dot info';
      this.elements.statusText.textContent = 'Data captured';
    } else {
      this.elements.statusDot.className = 'status-dot warning';
      this.elements.statusText.textContent = 'No data';
    }

    // Update details
    this.elements.emrDetected.textContent = status.emrDetected || 'Unknown';
    this.elements.dataStatus.textContent = status.hasData ? 'Available' : 'None';
    
    if (status.hasData && status.timeRemaining > 0) {
      const minutes = Math.floor(status.timeRemaining / 60000);
      const seconds = Math.floor((status.timeRemaining % 60000) / 1000);
      this.elements.expiresIn.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      this.elements.expiresIn.textContent = '-';
    }

    // Update button states
    this.elements.captureBtn.disabled = false;
    this.elements.fillBtn.disabled = !status.hasData;
    this.elements.clearBtn.disabled = !status.hasData;
  }

  /**
   * Starts status polling
   */
  startStatusPolling() {
    // Poll status every 5 seconds
    setInterval(() => {
      this.loadStatus();
    }, 5000);
  }

  /**
   * Handles capture action
   */
  async handleCapture() {
    try {
      this.showLoading('Capturing patient data...');
      
      const response = await this.sendMessage({ action: 'capture' });
      
      if (response.success) {
        this.showSuccess('Patient data captured successfully!');
        await this.loadStatus();
      } else {
        this.showError(response.error || 'Failed to capture data');
      }
    } catch (error) {
      this.showError('Capture failed: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Handles fill action
   */
  async handleFill() {
    try {
      this.showLoading('Filling RadOrderPad forms...');
      
      const response = await this.sendMessage({ action: 'fill' });
      
      if (response.success) {
        this.showSuccess(`Forms filled successfully! (${response.data.fieldsFilled} fields)`);
      } else {
        this.showError(response.error || 'Failed to fill forms');
      }
    } catch (error) {
      this.showError('Fill failed: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Handles clear action
   */
  async handleClear() {
    try {
      this.showLoading('Clearing data...');
      
      const response = await this.sendMessage({ action: 'clear' });
      
      if (response.success) {
        this.showSuccess('Data cleared successfully!');
        await this.loadStatus();
      } else {
        this.showError(response.error || 'Failed to clear data');
      }
    } catch (error) {
      this.showError('Clear failed: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Handles settings action
   */
  handleSettings() {
    // Open settings page
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  }

  /**
   * Handles help action
   */
  handleHelp() {
    // Open help page
    chrome.tabs.create({ url: 'https://radorderpad.com/extension-help' });
  }

  /**
   * Sends message to background script
   */
  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Shows loading overlay
   */
  showLoading(text = 'Processing...') {
    this.elements.loadingOverlay.querySelector('.loading-text').textContent = text;
    this.elements.loadingOverlay.classList.add('show');
  }

  /**
   * Hides loading overlay
   */
  hideLoading() {
    this.elements.loadingOverlay.classList.remove('show');
  }

  /**
   * Shows success notification
   */
  showSuccess(message) {
    // Add success class to status dot temporarily
    this.elements.statusDot.classList.add('success', 'pulse');
    setTimeout(() => {
      this.elements.statusDot.classList.remove('success', 'pulse');
    }, 2000);

    // Show notification
    this.showNotification(message, 'success');
  }

  /**
   * Shows error notification
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorModal.classList.add('show');
  }

  /**
   * Hides error modal
   */
  hideErrorModal() {
    this.elements.errorModal.classList.remove('show');
  }

  /**
   * Shows notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1002;
      max-width: 300px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupUI();
}); 