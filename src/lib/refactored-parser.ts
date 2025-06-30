// Refactored Parser - DISABLED - Using SimpleUniversalParser instead
// This file is temporarily disabled to focus on the simple universal parser approach

/*
import { EMRStrategyManager } from './emr/emr-strategy-manager';
import { PatientData, ParsingResult, EMRDetectionResult } from '../types';

export class RefactoredParser {
  private strategyManager: EMRStrategyManager;
  private detectedEMR: string | null = null;
  private detectionConfidence: number = 0;

  constructor() {
    this.strategyManager = new EMRStrategyManager();
  }

  async parsePatientData(): Promise<ParsingResult> {
    console.log('🚀 Refactored parser started');
    
    try {
      // Detect EMR
      const detection = await this.strategyManager.detectEMR();
      this.detectedEMR = detection.emrName;
      this.detectionConfidence = detection.confidence;

      if (detection.confidence < 0.3) {
        return {
          success: false,
          data: undefined,
          errors: ['No EMR detected with sufficient confidence'],
          strategy: 'refactored-none',
          confidence: 0
        };
      }

      // Parse with detected strategy
      const result = await this.strategyManager.parsePatientData();
      
      if (result.success) {
        return {
          ...result,
          strategy: `refactored-${this.detectedEMR}`,
          confidence: this.detectionConfidence
        };
      }

      // Try individual field extraction as fallback
      return await this.fallbackFieldExtraction();
    } catch (error) {
      console.error('❌ Refactored parser error:', error);
      return {
        success: false,
        data: undefined,
        errors: [`Refactored parsing failed: ${error}`],
        strategy: 'refactored-error',
        confidence: 0
      };
    }
  }

  async extractField(field: string): Promise<{ value: string | null; strategy: string; confidence: number }> {
    try {
      const result = await this.strategyManager.extractField(field);
      return {
        value: result.value,
        strategy: `refactored-${result.strategy}`,
        confidence: result.confidence
      };
    } catch (error) {
      return {
        value: null,
        strategy: 'refactored-error',
        confidence: 0
      };
    }
  }

  private async fallbackFieldExtraction(): Promise<ParsingResult> {
    const fields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'phoneNumber'];
    const data: Partial<PatientData> = {};
    let extractedCount = 0;

    for (const field of fields) {
      const result = await this.extractField(field);
      if (result.value) {
        data[field as keyof PatientData] = result.value as any;
        extractedCount++;
      }
    }

    const confidence = extractedCount / fields.length;
    
    return {
      success: confidence > 0.3,
      data: data as PatientData,
      errors: [],
      strategy: `refactored-fallback-${this.detectedEMR}`,
      confidence
    };
  }

  getDetectedEMR(): string | null {
    return this.detectedEMR;
  }

  getDetectionConfidence(): number {
    return this.detectionConfidence;
  }

  getAvailableStrategies(): string[] {
    return this.strategyManager.getAvailableStrategies();
  }

  forceStrategy(strategyName: string): boolean {
    return this.strategyManager.forceStrategy(strategyName);
  }

  resetDetection(): void {
    this.strategyManager.resetDetection();
    this.detectedEMR = null;
    this.detectionConfidence = 0;
  }
}
*/

// Export a placeholder class that redirects to SimpleUniversalParser
import { SimpleUniversalParser } from './simple-universal-parser';
import { PatientData, ParsingResult } from '../types';

export class RefactoredParser {
  private parser: SimpleUniversalParser;

  constructor() {
    this.parser = new SimpleUniversalParser();
  }

  async parsePatientData(): Promise<ParsingResult> {
    console.log('🚀 Refactored parser redirecting to SimpleUniversalParser');
    return await this.parser.parsePatientData();
  }

  async extractField(field: string): Promise<{ value: string | null; strategy: string; confidence: number }> {
    return await this.parser.extractField(field);
  }

  getDetectedEMR(): string | null {
    return 'Universal Parser';
  }

  getDetectionConfidence(): number {
    return 0.8;
  }

  getAvailableStrategies(): string[] {
    return ['SimpleUniversalParser'];
  }

  forceStrategy(strategyName: string): boolean {
    console.log('Strategy forcing disabled - using universal parser');
    return true;
  }

  resetDetection(): void {
    console.log('Detection reset disabled - using universal parser');
  }
} 