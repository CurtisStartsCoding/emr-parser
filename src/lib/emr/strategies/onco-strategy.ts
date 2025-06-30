import { EMRStrategy, EMRDetectionResult, EMRFieldMapping, EMRDataFormats, EMROptimizationConfig, FieldExtractionResult } from '../emr-strategy';
import { PatientData, ParsingResult } from '../../../types';
import parseAddress = require('parse-address');

export class OncoStrategy extends EMRStrategy {
  constructor() {
    super('Onco');
  }

  // Detection indicators for Onco EMR
  private detectionIndicators = [
    '[data-onco="true"]',
    '.onco-container',
    '.onco-patient-info',
    '[class*="onco"]',
    '[id*="onco"]',
    'input[name*="onco"]',
    'input[id*="onco"]',
    '[data-field*="onco"]',
    '[data-label*="onco"]'
  ];

  /**
   * Get EMR-specific field mappings
   */
  getFieldMappings(): EMRFieldMapping {
    return {
      firstName: [
        '.onco-first-name',
        '.onco-field-first-name',
        '[data-onco-field="firstName"]',
        '[data-onco-field="first_name"]',
        'input[name*="firstName"]',
        'input[name*="first_name"]',
        'input[id*="firstName"]',
        'input[id*="first_name"]',
        '[aria-label*="First Name"]',
        '[aria-labelledby*="First Name"]',
        '[data-field*="First Name"]',
        '[data-label*="First Name"]'
      ],
      lastName: [
        '.onco-last-name',
        '.onco-field-last-name',
        '[data-onco-field="lastName"]',
        '[data-onco-field="last_name"]',
        'input[name*="lastName"]',
        'input[name*="last_name"]',
        'input[id*="lastName"]',
        'input[id*="last_name"]',
        '[aria-label*="Last Name"]',
        '[aria-labelledby*="Last Name"]',
        '[data-field*="Last Name"]',
        '[data-label*="Last Name"]'
      ],
      middleName: [
        '.onco-middle-name',
        '.onco-field-middle-name',
        '[data-onco-field="middleName"]',
        '[data-onco-field="middle_name"]',
        'input[name*="middleName"]',
        'input[name*="middle_name"]',
        'input[id*="middleName"]',
        'input[id*="middle_name"]',
        '[aria-label*="Middle Name"]',
        '[aria-labelledby*="Middle Name"]',
        '[data-field*="Middle Name"]',
        '[data-label*="Middle Name"]'
      ],
      dateOfBirth: [
        '.onco-dob',
        '.onco-field-dob',
        '.onco-birth-date',
        '[data-onco-field="dateOfBirth"]',
        '[data-onco-field="dob"]',
        '[data-onco-field="birthDate"]',
        'input[name*="dateOfBirth"]',
        'input[name*="dob"]',
        'input[name*="birthDate"]',
        'input[id*="dateOfBirth"]',
        'input[id*="dob"]',
        'input[id*="birthDate"]',
        '[aria-label*="Date of Birth"]',
        '[aria-label*="DOB"]',
        '[aria-label*="Birth Date"]',
        '[aria-labelledby*="Date of Birth"]',
        '[aria-labelledby*="DOB"]',
        '[aria-labelledby*="Birth Date"]',
        '[data-field*="Date of Birth"]',
        '[data-field*="DOB"]',
        '[data-field*="Birth Date"]',
        '[data-label*="Date of Birth"]',
        '[data-label*="DOB"]',
        '[data-label*="Birth Date"]'
      ],
      gender: [
        '.onco-gender',
        '.onco-field-gender',
        '[data-onco-field="gender"]',
        'input[name*="gender"]',
        'input[name*="sex"]',
        'input[id*="gender"]',
        'input[id*="sex"]',
        'select[name*="gender"]',
        'select[name*="sex"]',
        'select[id*="gender"]',
        'select[id*="sex"]',
        '[aria-label*="Gender"]',
        '[aria-label*="Sex"]',
        '[aria-labelledby*="Gender"]',
        '[aria-labelledby*="Sex"]',
        '[data-field*="Gender"]',
        '[data-field*="Sex"]',
        '[data-label*="Gender"]',
        '[data-label*="Sex"]'
      ],
      phoneNumber: [
        '.onco-phone',
        '.onco-field-phone',
        '.onco-phone-number',
        '[data-onco-field="phoneNumber"]',
        '[data-onco-field="phone"]',
        'input[name*="phone"]',
        'input[name*="phoneNumber"]',
        'input[name*="telephone"]',
        'input[id*="phone"]',
        'input[id*="phoneNumber"]',
        'input[id*="telephone"]',
        '[aria-label*="Phone"]',
        '[aria-label*="Phone Number"]',
        '[aria-label*="Telephone"]',
        '[aria-labelledby*="Phone"]',
        '[aria-labelledby*="Phone Number"]',
        '[aria-labelledby*="Telephone"]',
        '[data-field*="Phone"]',
        '[data-field*="Phone Number"]',
        '[data-field*="Telephone"]',
        '[data-label*="Phone"]',
        '[data-label*="Phone Number"]',
        '[data-label*="Telephone"]'
      ],
      email: [
        '.onco-email',
        '.onco-field-email',
        '[data-onco-field="email"]',
        'input[name*="email"]',
        'input[name*="e-mail"]',
        'input[id*="email"]',
        'input[id*="e-mail"]',
        'input[type="email"]',
        '[aria-label*="Email"]',
        '[aria-label*="E-mail"]',
        '[aria-labelledby*="Email"]',
        '[aria-labelledby*="E-mail"]',
        '[data-field*="Email"]',
        '[data-field*="E-mail"]',
        '[data-label*="Email"]',
        '[data-label*="E-mail"]'
      ],
      addressLine1: [
        '.onco-address',
        '.onco-field-address',
        '.onco-address-line1',
        '[data-onco-field="addressLine1"]',
        '[data-onco-field="address"]',
        'input[name*="address"]',
        'input[name*="addressLine1"]',
        'input[name*="street"]',
        'input[id*="address"]',
        'input[id*="addressLine1"]',
        'input[id*="street"]',
        '[aria-label*="Address"]',
        '[aria-label*="Street Address"]',
        '[aria-labelledby*="Address"]',
        '[aria-labelledby*="Street Address"]',
        '[data-field*="Address"]',
        '[data-field*="Street Address"]',
        '[data-label*="Address"]',
        '[data-label*="Street Address"]'
      ],
      addressLine2: [
        '.onco-address2',
        '.onco-field-address2',
        '.onco-address-line2',
        '[data-onco-field="addressLine2"]',
        '[data-onco-field="address2"]',
        'input[name*="address2"]',
        'input[name*="addressLine2"]',
        'input[id*="address2"]',
        'input[id*="addressLine2"]',
        '[aria-label*="Address 2"]',
        '[aria-label*="Address Line 2"]',
        '[aria-labelledby*="Address 2"]',
        '[aria-labelledby*="Address Line 2"]',
        '[data-field*="Address 2"]',
        '[data-field*="Address Line 2"]',
        '[data-label*="Address 2"]',
        '[data-label*="Address Line 2"]'
      ],
      city: [
        '.onco-city',
        '.onco-field-city',
        '[data-onco-field="city"]',
        'input[name*="city"]',
        'input[id*="city"]',
        '[aria-label*="City"]',
        '[aria-labelledby*="City"]',
        '[data-field*="City"]',
        '[data-label*="City"]'
      ],
      state: [
        '.onco-state',
        '.onco-field-state',
        '[data-onco-field="state"]',
        'input[name*="state"]',
        'input[id*="state"]',
        'select[name*="state"]',
        'select[id*="state"]',
        '[aria-label*="State"]',
        '[aria-labelledby*="State"]',
        '[data-field*="State"]',
        '[data-label*="State"]'
      ],
      zipCode: [
        '.onco-zip',
        '.onco-field-zip',
        '.onco-zipcode',
        '[data-onco-field="zipCode"]',
        '[data-onco-field="zip"]',
        '[data-onco-field="postalCode"]',
        'input[name*="zip"]',
        'input[name*="zipCode"]',
        'input[name*="postalCode"]',
        'input[id*="zip"]',
        'input[id*="zipCode"]',
        'input[id*="postalCode"]',
        '[aria-label*="ZIP"]',
        '[aria-label*="Zip Code"]',
        '[aria-label*="Postal Code"]',
        '[aria-labelledby*="ZIP"]',
        '[aria-labelledby*="Zip Code"]',
        '[aria-labelledby*="Postal Code"]',
        '[data-field*="ZIP"]',
        '[data-field*="Zip Code"]',
        '[data-field*="Postal Code"]',
        '[data-label*="ZIP"]',
        '[data-label*="Zip Code"]',
        '[data-label*="Postal Code"]'
      ],
      mrn: [
        '.onco-mrn',
        '.onco-field-mrn',
        '[data-onco-field="mrn"]',
        'input[name*="mrn"]',
        'input[name*="medicalRecordNumber"]',
        'input[name*="patientId"]',
        'input[id*="mrn"]',
        'input[id*="medicalRecordNumber"]',
        'input[id*="patientId"]',
        '[aria-label*="MRN"]',
        '[aria-label*="Medical Record Number"]',
        '[aria-label*="Patient ID"]',
        '[aria-labelledby*="MRN"]',
        '[aria-labelledby*="Medical Record Number"]',
        '[aria-labelledby*="Patient ID"]',
        '[data-field*="MRN"]',
        '[data-field*="Medical Record Number"]',
        '[data-field*="Patient ID"]',
        '[data-label*="MRN"]',
        '[data-label*="Medical Record Number"]',
        '[data-label*="Patient ID"]'
      ],
      ssn: [
        '.onco-ssn',
        '.onco-field-ssn',
        '[data-onco-field="ssn"]',
        'input[name*="ssn"]',
        'input[name*="socialSecurityNumber"]',
        'input[id*="ssn"]',
        'input[id*="socialSecurityNumber"]',
        '[aria-label*="SSN"]',
        '[aria-label*="Social Security Number"]',
        '[aria-labelledby*="SSN"]',
        '[aria-labelledby*="Social Security Number"]',
        '[data-field*="SSN"]',
        '[data-field*="Social Security Number"]',
        '[data-label*="SSN"]',
        '[data-label*="Social Security Number"]'
      ]
    };
  }

  /**
   * Get EMR-specific data formats
   */
  getDataFormats(): EMRDataFormats {
    return {
      phoneNumber: [/\(\d{3}\) \d{3}-\d{4}/, /\d{3}-\d{3}-\d{4}/, /\d{10}/],
      dateOfBirth: [/\d{1,2}\/\d{1,2}\/\d{4}/, /\d{4}-\d{2}-\d{2}/],
      ssn: [/\d{3}-\d{2}-\d{4}/, /\d{9}/],
      mrn: [/\d+/],
      zipCode: [/\d{5}/, /\d{5}-\d{4}/]
    };
  }

  /**
   * Get EMR-specific optimizations
   */
  getOptimizations(): EMROptimizationConfig {
    return {
      preferredSelectors: ['.onco-', '[data-onco-field]'],
      skipSelectors: ['.hidden', '.disabled'],
      waitForElements: ['.onco-container', '.onco-patient-info'],
      customAttributes: ['data-onco-field', 'data-onco']
    };
  }

  /**
   * Get EMR-specific selectors for a field
   */
  protected getEMRSpecificSelectors(field: string): string[] {
    const mappings = this.fieldMappings[field] || [];
    return mappings.filter(selector => 
      selector.includes('.onco-') || 
      selector.includes('[data-onco-field') ||
      selector.includes('onco')
    );
  }

  /**
   * EMR-specific value processing
   */
  protected processEMRSpecificValue(value: string, field: string): string {
    // Onco-specific processing
    if (field === 'gender') {
      return this.normalizeGender(value);
    }
    return value;
  }

  /**
   * Detect if this is an Onco EMR page
   */
  detect(): EMRDetectionResult {
    console.log('🔍 Onco detection started');
    
    let confidence = 0;

    // Check for Onco-specific data attribute (highest confidence)
    if (document.querySelector('[data-onco="true"]')) {
      confidence += 0.6;
      console.log('✅ Onco data attribute found');
    }

    // Check for Onco container
    if (document.querySelector('.onco-container')) {
      confidence += 0.3;
      console.log('✅ Onco container found');
    }

    // Check for Onco patient info
    if (document.querySelector('.onco-patient-info')) {
      confidence += 0.3;
      console.log('✅ Onco patient info found');
    }

    // Check for Onco-specific form elements
    const oncoInputs = document.querySelectorAll('input[name*="onco"], input[id*="onco"]');
    if (oncoInputs.length > 0) {
      confidence += 0.1 * Math.min(oncoInputs.length, 3);
      console.log(`✅ Found ${oncoInputs.length} Onco-specific inputs`);
    }

    // Check for Onco-specific classes
    const oncoElements = document.querySelectorAll('[class*="onco"]');
    if (oncoElements.length > 0) {
      confidence += 0.1 * Math.min(oncoElements.length, 5);
      console.log(`✅ Found ${oncoElements.length} Onco-specific elements`);
    }

    // Check for Onco-specific IDs
    const oncoIds = document.querySelectorAll('[id*="onco"]');
    if (oncoIds.length > 0) {
      confidence += 0.1 * Math.min(oncoIds.length, 3);
      console.log(`✅ Found ${oncoIds.length} Onco-specific IDs`);
    }

    // Check for Onco-specific data fields
    const oncoDataFields = document.querySelectorAll('[data-field*="onco"]');
    if (oncoDataFields.length > 0) {
      confidence += 0.1 * Math.min(oncoDataFields.length, 3);
      console.log(`✅ Found ${oncoDataFields.length} Onco-specific data fields`);
    }

    const result: EMRDetectionResult = {
      detected: confidence >= 0.3,
      name: this.name,
      confidence: Math.min(confidence, 1.0)
    };

    console.log(`🔍 Onco detection result:`, result);
    return result;
  }

  /**
   * Extract a specific field using Onco-specific selectors
   */
  async extractField(field: string): Promise<FieldExtractionResult> {
    console.log(`🔍 Onco extractField called for: ${field}`);
    
    const selectors = this.fieldMappings[field];
    if (!selectors) {
      console.warn(`❌ No selectors defined for field: ${field}`);
      return { value: null, strategy: this.name, confidence: 0 };
    }

    console.log(`📋 Onco selectors for ${field}:`, selectors);

    // Try Onco-specific selectors first
    for (const selector of selectors) {
      try {
        console.log(`🔍 Trying selector "${selector}":`, document.querySelector(selector));
      const element = document.querySelector(selector);
      if (element) {
        const value = this.extractValueFromElement(element);
        if (value) {
            console.log(`✅ Onco extracted ${field}: ${value}`);
            return { value, strategy: this.name, confidence: 0.8 };
          }
        }
      } catch (error) {
        console.warn(`❌ Error with selector ${selector}:`, error);
      }
    }

    // Try detail label-value pairs
    console.log('🔍 No Onco-specific selectors found, trying detail pairs');
    const detailValue = this.extractFromDetailPairs(field);
    if (detailValue) {
      console.log(`✅ Onco extracted ${field} from detail pairs: ${detailValue}`);
      return { value: detailValue, strategy: this.name, confidence: 0.6 };
    }

    // Try table extraction
    console.log('🔍 No detail pairs found, trying table extraction');
    const tableValue = this.extractFromTable(field);
    if (tableValue) {
      console.log(`✅ Onco extracted ${field} from table: ${tableValue}`);
      return { value: tableValue, strategy: this.name, confidence: 0.5 };
    }

    // Try form extraction
    console.log('🔍 No table extraction found, trying form extraction');
    const formValue = this.extractFromForm(field);
    if (formValue) {
      console.log(`✅ Onco extracted ${field} from form: ${formValue}`);
      return { value: formValue, strategy: this.name, confidence: 0.4 };
    }

    console.log(`❌ No extraction method found for ${field}`);
    return { value: null, strategy: this.name, confidence: 0 };
  }

  /**
   * Parse patient data using Onco-specific logic
   */
  async parsePatientData(): Promise<ParsingResult> {
    const fields = Object.keys(this.fieldMappings);
    const result: Partial<PatientData> = {};
    const errors: string[] = [];
    
    for (const field of fields) {
      try {
        const extraction = await this.extractField(field);
        if (extraction.value) {
          if (field === 'gender') {
            result[field as keyof PatientData] = this.normalizeGender(extraction.value) as any;
          } else {
            result[field as keyof PatientData] = extraction.value as any;
          }
        }
      } catch (error) {
        console.error(`❌ Error extracting ${field}:`, error);
        errors.push(`Failed to extract ${field}: ${error}`);
      }
    }

    // Parse address components if addressLine1 is available
    if (result.addressLine1) {
      const addressComponents = this.parseAddressComponents(result.addressLine1);
      result.addressLine1 = addressComponents.addressLine1;
      result.city = addressComponents.city;
      result.state = addressComponents.state;
      result.zipCode = addressComponents.zipCode;
    }

    const confidence = this.calculateConfidence(result);
    
    return {
      success: confidence > 0.3,
      data: result as PatientData,
      errors,
      strategy: this.name,
      confidence
    };
  }

  /**
   * Parses address components from a full address string using parse-address
   */
  private parseAddressComponents(fullAddress: string): { addressLine1: string; city: string; state: string; zipCode: string } {
    try {
      const parsed = parseAddress.parseLocation(fullAddress);
      const streetAddress = [parsed.number, parsed.street, parsed.type].filter(Boolean).join(' ');
      return {
        addressLine1: streetAddress || fullAddress, // Fallback to original if parsing fails
        city: parsed.city || '',
        state: parsed.state || '',
        zipCode: parsed.zip || ''
      };
    } catch (error) {
      console.warn('Failed to parse address components:', error);
      return {
        addressLine1: fullAddress, // Keep original if parsing fails
        city: '',
        state: '',
        zipCode: ''
      };
    }
  }

  /**
   * Calculate confidence based on extracted data
   */
  private calculateConfidence(data: Partial<PatientData>): number {
    const requiredFields = ['firstName', 'lastName', 'dateOfBirth'];
    const optionalFields = ['gender', 'phoneNumber', 'email', 'addressLine1'];
    
    let confidence = 0;
    
    // Base confidence for required fields
    for (const field of requiredFields) {
      if (data[field as keyof PatientData]) {
        confidence += 0.2;
      }
    }
    
    // Additional confidence for optional fields
    for (const field of optionalFields) {
      if (data[field as keyof PatientData]) {
        confidence += 0.1;
      }
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Extract value from DOM element
   */
  private extractValueFromElement(element: Element): string | null {
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
      return element.value || null;
    }
    return element.textContent?.trim() || null;
  }

  /**
   * Extract from detail label-value pairs
   */
  private extractFromDetailPairs(field: string): string | null {
    const labels = Array.from(document.querySelectorAll('.detail-label, .label, [class*="label"]'));
    for (const label of labels) {
      const text = label.textContent?.toLowerCase() || '';
      const aliases = this.getFieldAliases(field);
      if (text.includes(field.toLowerCase()) || aliases.some(alias => text.includes(alias))) {
        const nextElement = label.nextElementSibling;
        if (nextElement && nextElement.classList.contains('detail-value')) {
          return nextElement.textContent?.trim() || null;
        }
      }
    }
    return null;
  }

  /**
   * Extract from table
   */
  private extractFromTable(field: string): string | null {
    const tables = Array.from(document.querySelectorAll('table'));
    for (const table of tables) {
      const rows = Array.from(table.querySelectorAll('tr'));
      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td, th'));
        for (let i = 0; i < cells.length - 1; i++) {
          const cellText = cells[i].textContent?.toLowerCase() || '';
          const aliases = this.getFieldAliases(field);
          if (cellText.includes(field.toLowerCase()) || aliases.some(alias => cellText.includes(alias))) {
            return cells[i + 1].textContent?.trim() || null;
          }
        }
      }
    }
    return null;
  }

  /**
   * Extract from form
   */
  private extractFromForm(field: string): string | null {
    const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    for (const input of inputs) {
      const name = input.getAttribute('name')?.toLowerCase() || '';
      const id = input.getAttribute('id')?.toLowerCase() || '';
      const placeholder = input.getAttribute('placeholder')?.toLowerCase() || '';
      
      if (name.includes(field.toLowerCase()) || 
          id.includes(field.toLowerCase()) || 
          placeholder.includes(field.toLowerCase())) {
        return this.extractValueFromElement(input);
      }
    }
    return null;
  }

  /**
   * Get field aliases for matching
   */
  private getFieldAliases(field: string): string[] {
    const aliases: { [key: string]: string[] } = {
      firstName: ['first name', 'first', 'given name'],
      lastName: ['last name', 'last', 'surname', 'family name'],
      dateOfBirth: ['dob', 'birth date', 'date of birth'],
      gender: ['sex'],
      phoneNumber: ['phone', 'telephone', 'tel'],
      email: ['e-mail', 'email address'],
      addressLine1: ['address', 'street address'],
      city: ['city'],
      state: ['state', 'province'],
      zipCode: ['zip', 'postal code', 'zip code'],
      mrn: ['medical record number', 'patient id', 'chart number'],
      ssn: ['social security number', 'ss number']
    };
    return aliases[field] || [];
  }

  /**
   * Normalize gender values
   */
  private normalizeGender(value: string): string {
    const normalized = value.toLowerCase().trim();
    if (normalized.includes('male') || normalized.includes('m')) {
      return 'Male';
    }
    if (normalized.includes('female') || normalized.includes('f')) {
      return 'Female';
    }
    return value;
  }
} 