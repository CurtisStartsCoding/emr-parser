// Content script - EMR page interaction
import { ExtensionMessage, ExtensionResponse } from '../types';
import { AuditLogger } from '../security/audit/audit-logger';
import { SimpleUniversalParser } from '../lib/simple-universal-parser';

class ContentScript {
  private isInitialized = false;
  private statusIndicator: HTMLElement | null = null;
  private parser: SimpleUniversalParser;

  constructor() {
    this.parser = new SimpleUniversalParser(true); // Enable debug mode
    this.initialize();
  }

  /**
   * Initializes the content script
   */
  private async initialize(): Promise<void> {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupContentScript());
      } else {
        this.setupContentScript();
      }

      this.isInitialized = true;
      AuditLogger.logSystem('CONTENT_SCRIPT_INITIALIZED', true);
    } catch (error) {
      AuditLogger.logError('CONTENT_INIT', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Sets up the content script functionality
   */
  private setupContentScript(): void {
    // Set up message listeners
    this.setupMessageListeners();

    // Add status indicator
    this.addStatusIndicator();

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Check if we're on an EMR page
    this.checkEMRPage();
  }

  /**
   * Sets up message listeners for communication with background script
   */
  private setupMessageListeners(): void {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  /**
   * Handles messages from background script
   */
  private async handleMessage(
    message: ExtensionMessage,
    sendResponse: (response: ExtensionResponse) => void
  ): Promise<void> {
    try {
      switch (message.action) {
        case 'capture':
          await this.handleCapture(sendResponse);
          break;
        case 'fill':
          await this.handleFill(sendResponse);
          break;
        case 'detect':
          await this.handleDetect(sendResponse);
          break;
        case 'clear':
          await this.handleClear(sendResponse);
          break;
        case 'status':
          await this.handleStatus(sendResponse);
          break;
        case 'stats':
          await this.handleStats(sendResponse);
          break;
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      AuditLogger.logError('CONTENT_MESSAGE_HANDLER', errorMessage);
      sendResponse({ success: false, error: errorMessage });
    }
  }

  /**
   * Handles capture action
   */
  private async handleCapture(sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      // Send capture request to background script
      const response = await chrome.runtime.sendMessage({ action: 'capture' });
      sendResponse(response);
      
      // Update status indicator
      this.updateStatusIndicator(response.success ? 'success' : 'error');
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Capture error'
      });
      this.updateStatusIndicator('error');
    }
  }

  /**
   * Handles fill action
   */
  private async handleFill(sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      // Send fill request to background script
      const response = await chrome.runtime.sendMessage({ action: 'fill' });
      sendResponse(response);
      
      // Update status indicator
      this.updateStatusIndicator(response.success ? 'success' : 'error');
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Fill error'
      });
      this.updateStatusIndicator('error');
    }
  }

  /**
   * Handles detect action
   */
  private async handleDetect(sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'detect' });
      sendResponse(response);
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Detection error'
      });
    }
  }

  /**
   * Handles clear action
   */
  private async handleClear(sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'clear' });
      sendResponse(response);
      
      // Update status indicator
      this.updateStatusIndicator('cleared');
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Clear error'
      });
    }
  }

  /**
   * Handles status action
   */
  private async handleStatus(sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'status' });
      sendResponse(response);
      
      // Update status indicator based on response
      if (response.success && response.data) {
        this.updateStatusIndicator(response.data.hasData ? 'hasData' : 'noData');
      }
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Status error'
      });
    }
  }

  /**
   * Handles stats action
   */
  private async handleStats(sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'stats' });
      sendResponse(response);
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Stats error'
      });
    }
  }

  /**
   * Adds status indicator to the page
   */
  private addStatusIndicator(): void {
    // Create status indicator element
    this.statusIndicator = document.createElement('div');
    this.statusIndicator.id = 'radorderpad-status';
    this.statusIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #ccc;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 10000;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    // Add tooltip
    this.statusIndicator.title = 'RadOrderPad Extension - Click for status';

    // Add click handler
    this.statusIndicator.addEventListener('click', () => {
      this.showStatusPopup();
    });

    // Add to page
    document.body.appendChild(this.statusIndicator);

    // Initial status check
    this.checkStatus();
  }

  /**
   * Updates the status indicator
   */
  private updateStatusIndicator(status: 'success' | 'error' | 'hasData' | 'noData' | 'cleared'): void {
    if (!this.statusIndicator) return;

    const colors = {
      success: '#4CAF50',
      error: '#F44336',
      hasData: '#2196F3',
      noData: '#ccc',
      cleared: '#FF9800'
    };

    this.statusIndicator.style.backgroundColor = colors[status];
    
    // Add pulse animation for success/error
    if (status === 'success' || status === 'error') {
      this.statusIndicator.style.animation = 'pulse 0.5s ease-in-out';
      setTimeout(() => {
        if (this.statusIndicator) {
          this.statusIndicator.style.animation = '';
        }
      }, 500);
    }
  }

  /**
   * Shows status popup
   */
  private async showStatusPopup(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'status' });
      
      if (response.success && response.data) {
        const data = response.data;
        const message = data.hasData 
          ? `Data captured from ${data.emrDetected}. Expires in ${Math.round(data.timeRemaining / 1000)}s`
          : 'No data captured';
        
        this.showNotification(message, data.hasData ? 'info' : 'warning');
      }
    } catch (error) {
      this.showNotification('Error getting status', 'error');
    }
  }

  /**
   * Shows a notification
   */
  private showNotification(message: string, type: 'info' | 'warning' | 'error'): void {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50px;
      right: 10px;
      padding: 10px 15px;
      background-color: ${type === 'error' ? '#F44336' : type === 'warning' ? '#FF9800' : '#2196F3'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10001;
      max-width: 300px;
      word-wrap: break-word;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Sets up keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Ctrl+Shift+C to capture
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        this.handleCapture(() => {});
      }
      
      // Ctrl+Shift+F to fill
      if (event.ctrlKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        this.handleFill(() => {});
      }
    });
  }

  /**
   * Checks if we're on an EMR page
   */
  private checkEMRPage(): void {
    const emrIndicators = [
      'mychart',
      'epic',
      'cerner',
      'athena',
      'eclinicalworks',
      'nextgen',
      'allscripts'
    ];

    const pageText = document.body.innerText.toLowerCase();
    const isEMRPage = emrIndicators.some(indicator => pageText.includes(indicator));

    if (isEMRPage) {
      this.updateStatusIndicator('noData');
      AuditLogger.logSystem('EMR_PAGE_DETECTED', true);
    }
  }

  /**
   * Checks current status
   */
  private async checkStatus(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'status' });
      if (response.success && response.data) {
        this.updateStatusIndicator(response.data.hasData ? 'hasData' : 'noData');
      }
    } catch (error) {
      // Ignore errors for status check
    }
  }
}

// Initialize content script
new ContentScript();

// Add this function to send data to CDS app
async function sendToCDSApp(patientData: any) {
  try {
    // Replace this URL with your CDS app's API endpoint
    const cdsApiUrl = 'https://your-cds-app.com/api/patient-data';
    
    const response = await fetch(cdsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientData: patientData,
        source: 'emr-parser-extension',
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log('✅ Patient data sent to CDS app successfully');
      // Optionally open your CDS app
      window.open('https://your-cds-app.com', '_blank');
    } else {
      console.error('❌ Failed to send data to CDS app');
    }
  } catch (error) {
    console.error('❌ Error sending to CDS app:', error);
  }
}

// Modify the existing capture function to send to CDS
async function capturePatientData() {
  try {
    const parser = new SimpleUniversalParser();
    const result = await parser.parsePatientData();
    
    if (result.success && result.data) {
      console.log('📊 Parsed patient data:', result.data);
      
      // Send to your CDS app
      await sendToCDSApp(result.data);
      
      // Show success message
      console.log('✅ Patient data sent to CDS app!');
    } else {
      console.error('❌ Failed to parse patient data');
    }
  } catch (error) {
    console.error('❌ Capture error:', error);
  }
} 