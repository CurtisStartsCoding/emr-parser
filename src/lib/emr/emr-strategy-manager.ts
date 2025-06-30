import { EMRDetectionResult, ParsingResult } from '../../types';

export class EMRStrategyManager {
  constructor() {
    // Simplified manager - no complex strategies for now
  }

  /**
   * Detects which EMR is being used (simplified)
   */
  detectEMR(): EMRDetectionResult {
    console.log('🔍 EMR detection started');
    
    // Simple detection based on URL and page content
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();
    const bodyText = document.body.innerText.toLowerCase();
    
    let emrName = 'Unknown';
    let confidence = 0;
    const indicators: string[] = [];

    // Check for common EMR indicators
    if (url.includes('epic') || title.includes('epic') || bodyText.includes('epic')) {
      emrName = 'Epic';
      confidence = 0.8;
      indicators.push('epic');
    } else if (url.includes('athena') || title.includes('athena') || bodyText.includes('athena')) {
      emrName = 'Athenahealth';
      confidence = 0.8;
      indicators.push('athena');
    } else if (url.includes('ecw') || title.includes('ecw') || bodyText.includes('ecw')) {
      emrName = 'ECW';
      confidence = 0.8;
      indicators.push('ecw');
    } else if (url.includes('onco') || title.includes('onco') || bodyText.includes('onco')) {
      emrName = 'Onco';
      confidence = 0.8;
      indicators.push('onco');
    }

    const result: EMRDetectionResult = {
      emrName,
      confidence,
      indicators
    };

    console.log(`🔍 EMR detection result:`, result);
    return result;
  }

  /**
   * Parses patient data using universal approach
   */
  async parsePatientData(): Promise<ParsingResult> {
    console.log('🚀 Universal EMR parsing started');
    
    // For now, return a simple result indicating universal parser should be used
    return {
      success: false,
      data: undefined,
      errors: ['Use SimpleUniversalParser for data extraction'],
      strategy: 'universal',
      confidence: 0
    };
  }

  /**
   * Gets all available strategies (none for now)
   */
  getStrategies(): any[] {
    return [];
  }

  /**
   * Adds a strategy to the manager (disabled for now)
   */
  addStrategy(strategy: any): void {
    console.log('Strategy addition disabled - using universal parser');
  }
} 
