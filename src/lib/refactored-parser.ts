import { EMRStrategyManager } from './emr/emr-strategy-manager';
import { PatientData, ParsingResult, InsuranceData } from '../types';
import { EMRDetectionResult } from './emr/emr-strategy';

/**
 * Refactored Universal EMR Parser
 * 
 * This is a clean, modular implementation that uses EMR-specific strategies
 * for better accuracy and maintainability.
 */
export class RefactoredEMRParser {
  private strategyManager: EMRStrategyManager;
  private debugMode: boolean;
  private detectionResult: EMRDetectionResult | null = null;

  constructor(debugMode: boolean = false) {
    this.strategyManager = new EMRStrategyManager();
    this.debugMode = debugMode;
  }

  /**
   * Main parsing method - delegates to appropriate EMR strategy
   */
  async parsePatientData(): Promise<ParsingResult> {
    this.log('🚀 Starting refactored EMR parsing...');
    
    try {
      // Detect EMR system
      const detection = await this.getDetectedEMR();
      this.log(`🔍 Detected EMR: ${detection.name} (confidence: ${detection.confidence})`);
      
      // Parse using detected strategy
      const result = await this.strategyManager.parsePatientData();
      
      if (result.success) {
        this.log(`✅ Parsing successful with ${result.strategy} strategy`);
      } else {
        this.log(`⚠️ Parsing failed: ${result.errors?.join(', ')}`);
      }
      
      return result;
    } catch (error) {
      this.log(`❌ Parsing error: ${error}`);
      return {
        success: false,
        data: undefined,
        errors: [`Parsing failed: ${error}`],
        strategy: 'refactored-error',
        confidence: 0
      };
    }
  }

  /**
   * Extract a specific field using the detected EMR strategy
   */
  async extractField(field: string): Promise<{ value: string | null; strategy: string; confidence: number }> {
    this.log(`🔍 Extracting field: ${field}`);
    
    try {
      const result = await this.strategyManager.extractField(field);
      this.log(`📊 Field extraction result: ${result.value ? '✅' : '❌'} (${result.strategy})`);
      return result;
    } catch (error) {
      this.log(`❌ Field extraction error: ${error}`);
      return {
        value: null,
        strategy: 'error',
        confidence: 0
      };
    }
  }

  /**
   * Parse insurance data (placeholder for now)
   */
  parseInsuranceData(): InsuranceData | null {
    this.log('🔍 Parsing insurance data...');
    // TODO: Implement insurance parsing with EMR-specific strategies
    return {
      hasInsurance: false
    };
  }

  /**
   * Get the currently detected EMR
   */
  async getDetectedEMR(): Promise<EMRDetectionResult> {
    if (!this.detectionResult) {
      try {
        this.detectionResult = await this.strategyManager.detectEMR();
        this.log(`Detected EMR: ${this.detectionResult.name} (confidence: ${this.detectionResult.confidence})`);
      } catch (error) {
        this.log(`Error detecting EMR: ${error}`);
        this.detectionResult = {
          detected: false,
          confidence: 0,
          name: 'Unknown EMR'
        };
      }
    }
    return this.detectionResult;
  }

  /**
   * Get available EMR strategies
   */
  getAvailableStrategies(): string[] {
    return this.strategyManager.getAvailableStrategies();
  }

  /**
   * Force use of a specific EMR strategy (for testing)
   */
  forceStrategy(strategyName: string): boolean {
    this.log(`🔧 Forcing strategy: ${strategyName}`);
    return this.strategyManager.forceStrategy(strategyName);
  }

  /**
   * Reset EMR detection (useful for testing)
   */
  resetDetection(): void {
    this.log('🔄 Resetting EMR detection');
    this.strategyManager.resetDetection();
  }

  /**
   * Get detailed parsing metrics
   */
  async getParsingMetrics(): Promise<{
    detectedEMR: string;
    confidence: number;
    strategy: string;
    availableStrategies: string[];
    extractionResults: Record<string, { value: string | null; strategy: string; confidence: number }>;
  }> {
    const detection = await this.getDetectedEMR();
    const fields = ['firstName', 'lastName', 'dateOfBirth', 'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'zipCode'];
    const extractionResults: Record<string, { value: string | null; strategy: string; confidence: number }> = {};
    
    for (const field of fields) {
      extractionResults[field] = await this.extractField(field);
    }
    
    return {
      detectedEMR: detection.name,
      confidence: detection.confidence,
      strategy: detection.detected ? 'emr-specific' : 'fallback',
      availableStrategies: this.getAvailableStrategies(),
      extractionResults
    };
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.debugMode) {
      console.log(`[RefactoredEMRParser] ${message}`);
    }
  }

  /**
   * Backward compatibility method - maintains interface with old parser
   */
  async parsePatientDataLegacy(): Promise<ParsingResult> {
    // This method maintains backward compatibility with the old parser interface
    return this.parsePatientData();
  }

  /**
   * Get strategy manager for advanced usage
   */
  getStrategyManager(): EMRStrategyManager {
    return this.strategyManager;
  }
} 