// SecureDataHandler - AES-256 encryption for patient data
import CryptoJS from 'crypto-js';
import { EncryptedData, CaptureData } from '../../types';

export class SecureDataHandler {
  private static readonly ENCRYPTION_KEY = 'radorderpad-secure-key-2024'; // In production, this would be generated securely
  private static readonly ALGORITHM = 'AES-256-CBC';

  /**
   * Encrypts patient data with AES-256
   * @param data - The data to encrypt
   * @returns Encrypted data with expiration and checksum
   */
  static encrypt(data: { data: CaptureData; expiration: number }): string {
    try {
      const jsonData = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonData, this.ENCRYPTION_KEY).toString();
      
      // Create checksum for integrity verification
      const checksum = CryptoJS.SHA256(jsonData).toString();
      
      const encryptedData: EncryptedData = {
        data: data.data,
        expiration: data.expiration,
        checksum
      };
      
      return CryptoJS.AES.encrypt(JSON.stringify(encryptedData), this.ENCRYPTION_KEY).toString();
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypts patient data
   * @param encryptedData - The encrypted data string
   * @returns Decrypted data object
   */
  static decrypt(encryptedData: string): { data: CaptureData; expiration: number } {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) {
        throw new Error('Decryption failed - invalid data');
      }
      
      const data: EncryptedData = JSON.parse(jsonString);
      
      // Verify checksum for integrity
      const expectedChecksum = CryptoJS.SHA256(JSON.stringify(data.data)).toString();
      if (data.checksum !== expectedChecksum) {
        throw new Error('Data integrity check failed');
      }
      
      return {
        data: data.data,
        expiration: data.expiration
      };
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sanitizes input to prevent XSS attacks
   * @param input - The input string to sanitize
   * @returns Sanitized string
   */
  static sanitize(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  }

  /**
   * Generates a secure random key
   * @returns Random key string
   */
  static generateKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validates that data contains no malicious content
   * @param data - The data to validate
   * @returns True if data is safe
   */
  static validateData(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const jsonString = JSON.stringify(data);
    const sanitized = this.sanitize(jsonString);
    return jsonString === sanitized;
  }
} 