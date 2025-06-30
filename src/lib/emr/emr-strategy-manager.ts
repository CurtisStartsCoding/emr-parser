import { EMRStrategy, EMRDetectionResult } from './emr-strategy';
import { PatientData, ParsingResult } from '../../types';
import { AthenahealthStrategy } from './strategies/athenahealth-strategy';
import { ECWStrategy } from './strategies/ecw-strategy';
import { OncoStrategy } from './strategies/onco-strategy';
import { EpicStrategy } from './strategies/epic-strategy';

export class EMRStrategyManager {
  private strategies: EMRStrategy[] = [];
  private detectedStrategy: EMRStrategy | null = null;
  private detectionResult: EMRDetectionResult | null = null;
  private detectedEMR: string | null = null;
  private detectionConfidence: number = 0;
  private isDetecting: boolean = false;
  private isParsing: boolean = false;

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    console.log('🔧 Initializing EMR strategies...');
    
    // Add only working EMR strategies
    try {
      const athenahealthStrategy = new AthenahealthStrategy();
      console.log('✅ Athenahealth strategy loaded');
      
      const ecwStrategy = new ECWStrategy();
      console.log('✅ ECW strategy loaded');
      
      const oncoStrategy = new OncoStrategy();
      console.log('✅ Onco strategy loaded');
      
      const epicStrategy = new EpicStrategy();
      console.log('✅ Epic strategy loaded');
      
      this.strategies = [
        athenahealthStrategy,
        ecwStrategy,
        oncoStrategy,
        epicStrategy
      ];
      
      console.log(`🎯 Loaded ${this.strategies.length} EMR strategies:`, this.strategies.map(s => s.getName()));
    } catch (error) {
      console.error('❌ Error loading strategies:', error);
    }
  }

  /**
   * Detect the EMR system and select the appropriate strategy
   */
  async detectEMR(): Promise<EMRDetectionResult> {
    if (this.isDetecting) {
      console.log('🔍 [EMRStrategyManager] Detection already in progress, returning cached result');
      return this.detectionResult || { detected: false, name: '', confidence: 0 };
    }

    this.isDetecting = true;
    console.log('🔍 [EMRStrategyManager] Starting EMR detection...');

    try {
      console.log('🔍 [EMRStrategyManager] Starting strategy loop...');
      for (let i = 0; i < this.strategies.length; i++) {
        const strategy = this.strategies[i];
        console.log(`🔍 [EMRStrategyManager] Processing strategy ${i + 1}/${this.strategies.length}: ${strategy.getName()}`);
        
        try {
          console.log(`🔍 [EMRStrategyManager] Calling ${strategy.getName()}.detect()...`);
          const result = strategy.detect();
          console.log(`🔍 [EMRStrategyManager] ${strategy.getName()} detection result:`, result);
          
          if (result.detected && result.confidence > 0.1) {
            console.log(`✅ [EMRStrategyManager] EMR detected: ${result.name} (confidence: ${result.confidence})`);
            this.detectionResult = result;
            this.isDetecting = false;
            return result;
          }
        } catch (error) {
          console.error(`❌ [EMRStrategyManager] Error detecting ${strategy.getName()}:`, error);
        }
      }

      console.log('❌ [EMRStrategyManager] No EMR detected');
      this.detectionResult = { detected: false, name: '', confidence: 0 };
      this.isDetecting = false;
      return this.detectionResult;
    } catch (error) {
      console.error('❌ [EMRStrategyManager] Error during EMR detection:', error);
      this.isDetecting = false;
      return { detected: false, name: '', confidence: 0 };
    }
  }

  /**
   * Get the currently detected EMR strategy
   */
  getCurrentStrategy(): EMRStrategy | null {
    return this.detectedStrategy;
  }

  /**
   * Get the detection result
   */
  getDetectionResult(): EMRDetectionResult | null {
    return this.detectionResult;
  }

  /**
   * Parse patient data using the detected EMR strategy
   */
  async parsePatientData(): Promise<ParsingResult> {
    // Prevent recursive calls
    if (this.isParsing) {
      console.log('🔍 [EMRStrategyManager] Parsing already in progress, returning error');
      return {
        success: false,
        data: undefined,
        errors: ['Parsing already in progress - possible infinite recursion'],
        strategy: 'recursion-guard',
        confidence: 0
      };
    }

    this.isParsing = true;
    
    try {
      // Detect EMR if not already detected
      if (!this.detectedStrategy) {
        const detection = await this.detectEMR();
        if (detection.detected) {
          this.detectedStrategy = this.getStrategyByName(detection.name);
          this.detectionResult = detection;
        }
      }

      // Use detected strategy if available
      if (this.detectedStrategy) {
        try {
          const result = await this.detectedStrategy.parsePatientData();
          if (result.success) {
            this.isParsing = false;
            return result;
          }
        } catch (error) {
          console.error('❌ [EMRStrategyManager] Error parsing with detected strategy:', error);
        }
      }

      // Fallback parsing
      const fallbackResult = await this.fallbackParsing();
      this.isParsing = false;
      return fallbackResult;
    } catch (error) {
      console.error('❌ [EMRStrategyManager] Error in parsePatientData:', error);
      this.isParsing = false;
      return {
        success: false,
        data: undefined,
        errors: [`Parsing failed: ${error}`],
        strategy: 'error',
        confidence: 0
      };
    }
  }

  /**
   * Extract a specific field using the detected EMR strategy
   */
  async extractField(field: string): Promise<{ value: string | null; strategy: string; confidence: number }> {
    // Detect EMR if not already detected
    if (!this.detectedStrategy) {
      const detection = await this.detectEMR();
      if (detection.detected) {
        this.detectedStrategy = this.getStrategyByName(detection.name);
        this.detectionResult = detection;
      }
    }

    // Use detected strategy if available
    if (this.detectedStrategy) {
      try {
        const result = await this.detectedStrategy.extractField(field);
        return {
          value: result.value,
          strategy: `${this.detectedStrategy.getName()}-${result.strategy}`,
          confidence: result.confidence
        };
      } catch (error) {
        return {
          value: null,
          strategy: `${this.detectedStrategy.getName()}-error`,
          confidence: 0
        };
      }
    }

    // Fallback to universal field extraction
    return this.fallbackFieldExtraction(field);
  }

  /**
   * Fallback parsing when no specific EMR is detected
   */
  private async fallbackParsing(): Promise<ParsingResult> {
    // Use the already detected results instead of calling detect() again
    if (this.detectionResult && this.detectionResult.detected) {
      const strategy = this.getStrategyByName(this.detectionResult.name);
      if (strategy) {
        try {
          const result = await strategy.parsePatientData();
          if (result.success) {
            return {
              ...result,
              strategy: 'fallback-detected',
              confidence: this.detectionResult.confidence
            };
          }
        } catch (error) {
          console.error('❌ [EMRStrategyManager] Error in fallback parsing:', error);
        }
      }
    }

    // Try all strategies as last resort
    console.log('🔍 [EMRStrategyManager] Trying all strategies as fallback...');
    for (const strategy of this.strategies) {
      try {
        const result = await strategy.parsePatientData();
        if (result.success && result.data && Object.keys(result.data).length > 0) {
          return {
            ...result,
            strategy: `fallback-${strategy.getName()}`,
            confidence: 0.1
          };
        }
      } catch (error) {
        console.error(`❌ [EMRStrategyManager] Error in fallback strategy ${strategy.getName()}:`, error);
      }
    }

    return {
      success: false,
      data: undefined,
      errors: ['No EMR strategy could parse the patient data'],
      strategy: 'fallback-failed',
      confidence: 0
    };
  }

  /**
   * Fallback field extraction when no specific EMR is detected
   */
  private async fallbackFieldExtraction(field: string): Promise<{ value: string | null; strategy: string; confidence: number }> {
    // Try all strategies for the specific field
    for (const strategy of this.strategies) {
      try {
        const result = await strategy.extractField(field);
        if (result.value) {
          return {
            value: result.value,
            strategy: `fallback-${strategy.getName()}-${result.strategy}`,
            confidence: result.confidence * 0.5 // Lower confidence for fallback
          };
        }
      } catch (error) {
        // Continue to next strategy
      }
    }

    return {
      value: null,
      strategy: 'fallback-none',
      confidence: 0
    };
  }

  /**
   * Get available EMR strategies
   */
  getAvailableStrategies(): string[] {
    return this.strategies.map(strategy => strategy.getName());
  }

  /**
   * Get strategy by name
   */
  getStrategyByName(name: string): EMRStrategy | null {
    return this.strategies.find(strategy => strategy.getName() === name) || null;
  }

  /**
   * Force use of a specific EMR strategy (for testing)
   */
  forceStrategy(strategyName: string): boolean {
    const strategy = this.getStrategyByName(strategyName);
    if (strategy) {
      this.detectedStrategy = strategy;
      this.detectedEMR = strategyName;
      this.detectionConfidence = 1.0;
      this.detectionResult = {
        detected: true,
        confidence: 1.0,
        name: strategyName
      };
      console.log(`🔧 [EMRStrategyManager] Forced strategy: ${strategyName}`);
      return true;
    }
    console.log(`❌ [EMRStrategyManager] Strategy not found: ${strategyName}`);
    return false;
  }

  /**
   * Reset EMR detection (useful for testing)
   */
  resetDetection(): void {
    this.detectedStrategy = null;
    this.detectionResult = null;
    this.detectedEMR = null;
    this.detectionConfidence = 0;
    this.isDetecting = false;
    console.log('🔄 [EMRStrategyManager] Detection reset');
  }
} 
