// Background script - Chrome extension lifecycle management
import { RadOrderPadImporter } from '../lib/importer';
import { AuditLogger } from '../security/audit/audit-logger';
import { AccessControl } from '../security/access/access-control';
import { ExtensionMessage, ExtensionResponse } from '../types';

class BackgroundScript {
  private importer: RadOrderPadImporter | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initializes the background script
   */
  private async initialize(): Promise<void> {
    try {
      // Initialize the importer
      this.importer = new RadOrderPadImporter();
      await this.importer.initialize();

      // Set up message listeners
      this.setupMessageListeners();

      // Set up alarm for session cleanup
      this.setupSessionCleanup();

      // Set up alarm for data cleanup
      this.setupDataCleanup();

      AuditLogger.logSystem('BACKGROUND_INITIALIZED', true);
    } catch (error) {
      AuditLogger.logError('BACKGROUND_INIT', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Sets up message listeners for content scripts and popup
   */
  private setupMessageListeners(): void {
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });
  }

  /**
   * Handles incoming messages from content scripts and popup
   */
  private async handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void
  ): Promise<void> {
    try {
      if (!this.importer) {
        sendResponse({ success: false, error: 'Importer not initialized' });
        return;
      }

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
      AuditLogger.logError('MESSAGE_HANDLER', errorMessage);
      sendResponse({ success: false, error: errorMessage });
    }
  }

  /**
   * Handles capture action
   */
  private async handleCapture(sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      const result = await this.importer!.capturePatientData();
      
      if (result.success) {
        sendResponse({
          success: true,
          data: {
            message: 'Patient data captured successfully',
            fieldsCaptured: Object.keys(result.data!.patient).length,
            emrDetected: result.data!.metadata.sourceEMR
          }
        });
      } else {
        sendResponse({
          success: false,
          error: result.errors?.join(', ') || 'Capture failed'
        });
      }
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Capture error'
      });
    }
  }

  /**
   * Handles fill action
   */
  private async handleFill(sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      const result = await this.importer!.fillRadOrderPadForms();
      
      if (result.success) {
        sendResponse({
          success: true,
          data: {
            message: 'Forms filled successfully',
            fieldsFilled: result.fieldsFilled
          }
        });
      } else {
        sendResponse({
          success: false,
          error: result.errors?.join(', ') || 'Fill failed'
        });
      }
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Fill error'
      });
    }
  }

  /**
   * Handles detect action
   */
  private async handleDetect(sendResponse: (response: ExtensionResponse) => void): Promise<void> {
    try {
      const status = await this.importer!.getCaptureStatus();
      sendResponse({
        success: true,
        data: status
      });
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
      await this.importer!.clearCapturedData();
      sendResponse({
        success: true,
        data: { message: 'Data cleared successfully' }
      });
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
      const status = await this.importer!.getCaptureStatus();
      const sessionInfo = this.importer!.getSessionInfo();
      
      sendResponse({
        success: true,
        data: {
          ...status,
          sessionValid: sessionInfo.isValid,
          sessionId: sessionInfo.sessionId
        }
      });
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
      const stats = await this.importer!.getSystemStats();
      sendResponse({
        success: true,
        data: stats
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Stats error'
      });
    }
  }

  /**
   * Handles extension installation
   */
  private handleInstallation(details: chrome.runtime.InstalledDetails): void {
    if (details.reason === 'install') {
      AuditLogger.logSystem('EXTENSION_INSTALLED', true);
      
      // Set up default permissions
      chrome.storage.local.set({
        'extension_installed': new Date().toISOString(),
        'version': chrome.runtime.getManifest().version
      });
    } else if (details.reason === 'update') {
      AuditLogger.logSystem('EXTENSION_UPDATED', true);
    }
  }

  /**
   * Handles extension startup
   */
  private handleStartup(): void {
    AuditLogger.logSystem('EXTENSION_STARTED', true);
    
    // Clean up any expired sessions
    AccessControl.cleanupExpiredSessions();
  }

  /**
   * Sets up session cleanup alarm
   */
  private setupSessionCleanup(): void {
    // Clean up sessions every 5 minutes
    chrome.alarms.create('sessionCleanup', { periodInMinutes: 5 });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'sessionCleanup') {
        AccessControl.cleanupExpiredSessions();
      }
    });
  }

  /**
   * Sets up data cleanup alarm
   */
  private setupDataCleanup(): void {
    // Clean up expired data every minute
    chrome.alarms.create('dataCleanup', { periodInMinutes: 1 });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'dataCleanup') {
        // This will be handled by SecureStorage's automatic cleanup
        AuditLogger.logSystem('DATA_CLEANUP_TRIGGERED', true);
      }
    });
  }
}

// Initialize background script
new BackgroundScript(); 