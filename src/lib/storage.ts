// SecureStorage - Encrypted temporary storage with 5-minute expiration
import { SecureDataHandler } from '../security/encryption/secure-data-handler';
import { AuditLogger } from '../security/audit/audit-logger';
import { CaptureData } from '../types';

export class SecureStorage {
  private static readonly STORAGE_KEY = 'radorderpad_data';
  private static readonly EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes
  private static cleanupTimer: number | null = null;

  /**
   * Saves encrypted patient data with automatic expiration
   * @param data - The data to save
   */
  static async saveData(data: CaptureData): Promise<void> {
    try {
      // Validate data before encryption
      if (!SecureDataHandler.validateData(data)) {
        throw new Error('Invalid data detected');
      }

      const encrypted = SecureDataHandler.encrypt({
        data,
        expiration: Date.now() + this.EXPIRATION_TIME
      });

      await chrome.storage.local.set({
        [this.STORAGE_KEY]: encrypted
      });

      // Set auto-cleanup
      this.scheduleCleanup();

      AuditLogger.logAccess('STORE_DATA', true);
    } catch (error) {
      AuditLogger.logError('STORE_DATA', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Retrieves and decrypts patient data
   * @returns The decrypted data or null if expired/not found
   */
  static async getData(): Promise<CaptureData | null> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      if (!result[this.STORAGE_KEY]) {
        return null;
      }

      const decrypted = SecureDataHandler.decrypt(result[this.STORAGE_KEY]);

      // Check expiration
      if (Date.now() > decrypted.expiration) {
        await this.clearData();
        return null;
      }

      AuditLogger.logAccess('RETRIEVE_DATA', true);
      return decrypted.data;
    } catch (error) {
      AuditLogger.logError('RETRIEVE_DATA', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Clears all stored data
   */
  static async clearData(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.STORAGE_KEY);
      
      if (this.cleanupTimer) {
        clearTimeout(this.cleanupTimer);
        this.cleanupTimer = null;
      }

      AuditLogger.logAccess('CLEAR_DATA', true);
    } catch (error) {
      AuditLogger.logError('CLEAR_DATA', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Checks if data exists and is not expired
   * @returns True if valid data exists
   */
  static async hasData(): Promise<boolean> {
    try {
      const data = await this.getData();
      return data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets data expiration time
   * @returns Expiration timestamp or null if no data
   */
  static async getExpirationTime(): Promise<number | null> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      if (!result[this.STORAGE_KEY]) {
        return null;
      }

      const decrypted = SecureDataHandler.decrypt(result[this.STORAGE_KEY]);
      return decrypted.expiration;
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets time remaining until data expires
   * @returns Time remaining in milliseconds or 0 if expired
   */
  static async getTimeRemaining(): Promise<number> {
    const expirationTime = await this.getExpirationTime();
    if (!expirationTime) {
      return 0;
    }

    const remaining = expirationTime - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Schedules automatic cleanup of expired data
   */
  private static scheduleCleanup(): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }

    this.cleanupTimer = setTimeout(async () => {
      await this.clearData();
    }, this.EXPIRATION_TIME) as unknown as number;
  }

  /**
   * Gets storage statistics
   * @returns Storage statistics
   */
  static async getStorageStats(): Promise<{
    hasData: boolean;
    timeRemaining: number;
    expirationTime: number | null;
  }> {
    const hasData = await this.hasData();
    const timeRemaining = await this.getTimeRemaining();
    const expirationTime = await this.getExpirationTime();

    return {
      hasData,
      timeRemaining,
      expirationTime
    };
  }

  /**
   * Validates storage integrity
   * @returns True if storage is valid
   */
  static async validateStorage(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      if (!result[this.STORAGE_KEY]) {
        return true; // No data is valid
      }

      // Try to decrypt to validate integrity
      SecureDataHandler.decrypt(result[this.STORAGE_KEY]);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Exports storage data for debugging (encrypted)
   * @returns Encrypted data string
   */
  static async exportData(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Imports storage data (encrypted)
   * @param encryptedData - The encrypted data to import
   */
  static async importData(encryptedData: string): Promise<void> {
    try {
      // Validate the encrypted data
      SecureDataHandler.decrypt(encryptedData);
      
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: encryptedData
      });

      this.scheduleCleanup();
      AuditLogger.logAccess('IMPORT_DATA', true);
    } catch (error) {
      AuditLogger.logError('IMPORT_DATA', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
} 