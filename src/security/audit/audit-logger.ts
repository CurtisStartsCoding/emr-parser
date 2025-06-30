// AuditLogger - HIPAA-compliant audit trails (never logs PHI)
import { AuditLogEntry } from '../../types';

export class AuditLogger {
  private static readonly STORAGE_KEY = 'audit_logs';
  private static readonly MAX_LOG_ENTRIES = 1000;
  private static readonly LOG_RETENTION_DAYS = 7;

  /**
   * Logs an audit event (never includes actual PHI)
   * @param entry - The audit log entry
   */
  static log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date().toISOString()
      };

      // Store in Chrome storage
      this.storeLog(auditEntry);
      
      // Clean up old logs
      this.cleanupOldLogs();
    } catch (error) {
      // Don't throw errors from logging - just fail silently
      // This prevents logging failures from breaking the main functionality
    }
  }

  /**
   * Stores a log entry in Chrome storage
   * @param entry - The audit log entry
   */
  private static async storeLog(entry: AuditLogEntry): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const logs: AuditLogEntry[] = result[this.STORAGE_KEY] || [];
      
      logs.push(entry);
      
      // Limit the number of stored logs
      if (logs.length > this.MAX_LOG_ENTRIES) {
        logs.splice(0, logs.length - this.MAX_LOG_ENTRIES);
      }
      
      await chrome.storage.local.set({ [this.STORAGE_KEY]: logs });
    } catch (error) {
      // Fail silently to prevent logging from breaking main functionality
    }
  }

  /**
   * Cleans up logs older than retention period
   */
  private static async cleanupOldLogs(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const logs: AuditLogEntry[] = result[this.STORAGE_KEY] || [];
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.LOG_RETENTION_DAYS);
      
      const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate > cutoffDate;
      });
      
      if (filteredLogs.length !== logs.length) {
        await chrome.storage.local.set({ [this.STORAGE_KEY]: filteredLogs });
      }
    } catch (error) {
      // Fail silently
    }
  }

  /**
   * Gets audit logs for compliance reporting
   * @returns Array of audit log entries
   */
  static async getLogs(): Promise<AuditLogEntry[]> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Exports audit logs for compliance
   * @returns JSON string of audit logs
   */
  static async exportLogs(): Promise<string> {
    const logs = await this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Clears all audit logs
   */
  static async clearLogs(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.STORAGE_KEY);
    } catch (error) {
      // Fail silently
    }
  }

  /**
   * Logs a capture event
   * @param success - Whether the capture was successful
   * @param emrName - Name of the EMR system
   */
  static logCapture(success: boolean, emrName: string): void {
    this.log({
      eventType: 'CAPTURE',
      action: success ? 'CAPTURE_SUCCESS' : 'CAPTURE_FAILED',
      resourceType: 'PHI',
      success,
      metadata: {
        emrName,
        hasData: success
      }
    });
  }

  /**
   * Logs a form filling event
   * @param success - Whether the filling was successful
   * @param fieldsFilled - Number of fields filled
   */
  static logFormFill(success: boolean, fieldsFilled: number): void {
    this.log({
      eventType: 'FILL',
      action: success ? 'FILL_SUCCESS' : 'FILL_FAILED',
      resourceType: 'PHI',
      success,
      metadata: {
        fieldsFilled,
        targetSystem: 'RadOrderPad'
      }
    });
  }

  /**
   * Logs an access event
   * @param action - The access action performed
   * @param success - Whether the access was successful
   */
  static logAccess(action: string, success: boolean): void {
    this.log({
      eventType: 'ACCESS',
      action,
      resourceType: 'PHI',
      success
    });
  }

  /**
   * Logs an error event
   * @param action - The action that failed
   * @param errorType - Type of error
   */
  static logError(action: string, errorType: string): void {
    this.log({
      eventType: 'ERROR',
      action,
      resourceType: 'PHI',
      success: false,
      metadata: {
        errorType
      }
    });
  }

  /**
   * Logs a system event
   * @param action - The system action
   * @param success - Whether the action was successful
   */
  static logSystem(action: string, success: boolean): void {
    this.log({
      eventType: 'SYSTEM',
      action,
      resourceType: 'SYSTEM',
      success
    });
  }
} 