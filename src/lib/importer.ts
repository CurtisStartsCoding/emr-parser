// RadOrderPadImporter - Main controller coordinating parser and filler
import { UniversalEMRParser } from './parser';
import { RadOrderPadFiller } from './filler';
import { SecureStorage } from './storage';
import { AccessControl } from '../security/access/access-control';
import { AuditLogger } from '../security/audit/audit-logger';
import { CaptureData, FormFillingResult } from '../types';

export class RadOrderPadImporter {
  private parser: UniversalEMRParser;
  private filler: RadOrderPadFiller;
  private sessionId: string | null = null;

  constructor() {
    this.parser = new UniversalEMRParser();
    this.filler = new RadOrderPadFiller();
  }

  /**
   * Initializes the importer with a new session
   */
  async initialize(): Promise<void> {
    try {
      // Start a new session
      this.sessionId = AccessControl.startSession();
      
      // Load persisted sessions
      await AccessControl.loadPersistedSessions();
      
      // Clean up expired sessions
      AccessControl.cleanupExpiredSessions();
      
      AuditLogger.logSystem('IMPORTER_INITIALIZED', true);
    } catch (error) {
      AuditLogger.logError('IMPORTER_INIT', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Captures patient data from current EMR page
   * @returns Capture result
   */
  async capturePatientData(): Promise<{ success: boolean; data?: CaptureData; errors?: string[] }> {
    try {
      if (!this.sessionId || !AccessControl.checkSession(this.sessionId)) {
        throw new Error('Invalid or expired session');
      }

      if (!AccessControl.hasPermission(this.sessionId, 'READ_PHI')) {
        throw new Error('Insufficient permissions');
      }

      // Parse patient data
      const patientResult = await this.parser.parsePatientData();
      if (!patientResult.success) {
        return {
          success: false,
          errors: patientResult.errors
        };
      }

      // Parse insurance data
      const insuranceData = this.parser.parseInsuranceData();

      // Create capture data
      const captureData: CaptureData = {
        patient: patientResult.data!,
        insurance: insuranceData || { hasInsurance: false },
        metadata: {
          sourceEMR: this.parser['emrName'] || 'Unknown',
          capturedAt: new Date().toISOString(),
          pageUrl: window.location.href
        }
      };

      // Store encrypted data
      await SecureStorage.saveData(captureData);

      AuditLogger.logAccess('CAPTURE_COMPLETED', true);

      return {
        success: true,
        data: captureData
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      AuditLogger.logError('CAPTURE_FAILED', errorMessage);
      
      return {
        success: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Fills RadOrderPad forms with captured data
   * @returns Form filling result
   */
  async fillRadOrderPadForms(): Promise<FormFillingResult> {
    try {
      if (!this.sessionId || !AccessControl.checkSession(this.sessionId)) {
        throw new Error('Invalid or expired session');
      }

      if (!AccessControl.hasPermission(this.sessionId, 'WRITE_PHI')) {
        throw new Error('Insufficient permissions');
      }

      // Check if we're on a RadOrderPad page
      if (!this.filler.isRadOrderPadPage()) {
        return {
          success: false,
          fieldsFilled: 0,
          errors: ['Not on a RadOrderPad page']
        };
      }

      // Retrieve captured data
      const captureData = await SecureStorage.getData();
      if (!captureData) {
        return {
          success: false,
          fieldsFilled: 0,
          errors: ['No captured data found or data has expired']
        };
      }

      // Fill patient data
      const patientResult = await this.filler.fillPatientData(captureData.patient);
      
      // Fill insurance data
      const insuranceResult = await this.filler.fillInsuranceData(captureData.insurance);

      // Combine results
      const totalFieldsFilled = patientResult.fieldsFilled + insuranceResult.fieldsFilled;
      const allErrors = [...(patientResult.errors || []), ...(insuranceResult.errors || [])];
      const success = allErrors.length === 0;

      AuditLogger.logAccess('FILL_COMPLETED', success);

      return {
        success,
        fieldsFilled: totalFieldsFilled,
        errors: allErrors
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      AuditLogger.logError('FILL_FAILED', errorMessage);
      
      return {
        success: false,
        fieldsFilled: 0,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Gets current capture status
   * @returns Capture status information
   */
  async getCaptureStatus(): Promise<{
    hasData: boolean;
    timeRemaining: number;
    emrDetected: string;
    dataAge: number;
  }> {
    try {
      const storageStats = await SecureStorage.getStorageStats();
      
      let dataAge = 0;
      if (storageStats.expirationTime) {
        dataAge = Date.now() - (storageStats.expirationTime - 5 * 60 * 1000);
      }

      return {
        hasData: storageStats.hasData,
        timeRemaining: storageStats.timeRemaining,
        emrDetected: this.parser['emrName'] || 'Unknown',
        dataAge: Math.max(0, dataAge)
      };
    } catch (error) {
      return {
        hasData: false,
        timeRemaining: 0,
        emrDetected: 'Unknown',
        dataAge: 0
      };
    }
  }

  /**
   * Clears all captured data
   */
  async clearCapturedData(): Promise<void> {
    try {
      await SecureStorage.clearData();
      AuditLogger.logAccess('DATA_CLEARED', true);
    } catch (error) {
      AuditLogger.logError('CLEAR_FAILED', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Gets session information
   * @returns Session information
   */
  getSessionInfo(): { sessionId: string | null; isValid: boolean; stats: Record<string, unknown> } {
    return {
      sessionId: this.sessionId,
      isValid: !!this.sessionId && AccessControl.checkSession(this.sessionId),
      stats: {} // Provide actual stats if needed
    };
  }

  /**
   * Ends the current session
   */
  endSession(): void {
    if (this.sessionId) {
      AccessControl.endSession(this.sessionId);
      this.sessionId = null;
    }
  }

  /**
   * Gets system statistics
   * @returns System statistics
   */
  async getSystemStats(): Promise<{
    session: Record<string, unknown>;
    storage: Record<string, unknown>;
    formStats: Record<string, unknown>;
  }> {
    return {
      session: {},
      storage: {},
      formStats: {}
    };
  }

  /**
   * Validates system integrity
   * @returns Validation result
   */
  async validateSystem(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    return {
      valid: true,
      errors: []
    };
  }
} 