import { PatientData, ParsingResult } from '../../types';

export interface EMRDetectionResult {
  detected: boolean;
  confidence: number;
  name: string;
}

export interface FieldExtractionResult {
  value: string | null;
  strategy: string;
  confidence: number;
}

export interface EMRFieldMapping {
  [field: string]: string[];
}

export interface EMRDataFormats {
  phoneNumber: RegExp[];
  dateOfBirth: RegExp[];
  ssn: RegExp[];
  mrn: RegExp[];
  zipCode: RegExp[];
}

export interface EMROptimizationConfig {
  preferredSelectors: string[];
  skipSelectors: string[];
  waitForElements: string[];
  customAttributes: string[];
}

export abstract class EMRStrategy {
  protected name: string;
  protected confidence: number = 0;
  protected fieldMappings: EMRFieldMapping;
  protected dataFormats: EMRDataFormats;
  protected optimizations: EMROptimizationConfig;

  constructor(name: string) {
    this.name = name;
    this.fieldMappings = this.getFieldMappings();
    this.dataFormats = this.getDataFormats();
    this.optimizations = this.getOptimizations();
  }

  /**
   * Detect if this EMR strategy applies to the current page
   */
  abstract detect(): EMRDetectionResult;

  /**
   * Get EMR-specific field mappings
   */
  abstract getFieldMappings(): EMRFieldMapping;

  /**
   * Get EMR-specific data formats
   */
  abstract getDataFormats(): EMRDataFormats;

  /**
   * Get EMR-specific optimizations
   */
  abstract getOptimizations(): EMROptimizationConfig;

  /**
   * Extract a specific field using EMR-specific logic
   */
  abstract extractField(field: string): Promise<FieldExtractionResult>;

  /**
   * Parse patient data using EMR-specific approach
   */
  abstract parsePatientData(): Promise<ParsingResult>;

  /**
   * Get field selectors for a specific field
   */
  getFieldSelectors(field: string): string[] {
    const mappings = this.fieldMappings[field] || [];
    return [
      // EMR-specific selectors
      ...this.getEMRSpecificSelectors(field),
      // Generic selectors with EMR-specific prefixes
      ...this.getGenericSelectors(field),
      // Fallback selectors
      ...this.getFallbackSelectors(field)
    ];
  }

  /**
   * Get EMR-specific selectors for a field
   */
  protected abstract getEMRSpecificSelectors(field: string): string[];

  /**
   * Get generic selectors with EMR-specific prefixes
   */
  protected getGenericSelectors(field: string): string[] {
    const mappings = this.fieldMappings[field] || [];
    const selectors: string[] = [];
    
    for (const mapping of mappings) {
      selectors.push(
        `[aria-label*="${mapping}"]`,
        `[aria-labelledby*="${mapping}"]`,
        `[data-field*="${mapping}"]`,
        `[data-label*="${mapping}"]`,
        `input[name*="${mapping}"]`,
        `input[id*="${mapping}"]`,
        `input[placeholder*="${mapping}"]`
      );
    }
    
    return selectors;
  }

  /**
   * Get fallback selectors for a field
   */
  protected getFallbackSelectors(field: string): string[] {
    return [
      `[data-field="${field}"]`,
      `[data-label="${field}"]`,
      `input[name="${field}"]`,
      `input[id="${field}"]`
    ];
  }

  /**
   * Process extracted value using EMR-specific formatting
   */
  processValue(value: string, field: string): string {
    if (!value) return '';
    
    // EMR-specific processing
    const processed = this.processEMRSpecificValue(value, field);
    
    // Format-specific processing
    return this.processFormattedValue(processed, field);
  }

  /**
   * EMR-specific value processing
   */
  protected abstract processEMRSpecificValue(value: string, field: string): string;

  /**
   * Format-specific value processing
   */
  protected processFormattedValue(value: string, field: string): string {
    switch (field) {
      case 'phoneNumber':
        return this.formatPhoneNumber(value);
      case 'dateOfBirth':
        return this.formatDate(value);
      case 'ssn':
        return this.formatSSN(value);
      case 'zipCode':
        return this.formatZipCode(value);
      default:
        return value;
    }
  }

  /**
   * Format phone number according to EMR standards
   */
  protected formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    return phone;
  }

  /**
   * Format date according to EMR standards
   */
  protected formatDate(date: string): string {
    // Try to parse and format as MM/DD/YYYY with leading zeros
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      const yyyy = parsed.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }
    return date;
  }

  /**
   * Format SSN according to EMR standards
   */
  protected formatSSN(ssn: string): string {
    const digits = ssn.replace(/\D/g, '');
    if (digits.length === 9) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    return ssn;
  }

  /**
   * Format zip code according to EMR standards
   */
  protected formatZipCode(zip: string): string {
    const digits = zip.replace(/\D/g, '');
    if (digits.length === 5) {
      return digits;
    } else if (digits.length === 9) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return zip;
  }

  /**
   * Get EMR name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get detection confidence
   */
  getConfidence(): number {
    return this.confidence;
  }
} 