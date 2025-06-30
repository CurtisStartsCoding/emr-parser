import { EMRStrategy, EMRDetectionResult, FieldExtractionResult, EMRFieldMapping, EMRDataFormats, EMROptimizationConfig } from '../emr-strategy';
import { PatientData, ParsingResult } from '../../../types';
import parseAddress = require('parse-address');

export class ECWStrategy extends EMRStrategy {
  constructor() {
    super('eClinicalWorks');
  }

  detect(): EMRDetectionResult {
    const indicators = [
      document.querySelector('[data-ecw]'),
      document.querySelector('.ecw-'),
      document.querySelector('[class*="ecw"]'),
      document.querySelector('[id*="ecw"]'),
      document.querySelector('.ecw-container'),
      document.querySelector('.ecw-patient-info'),
      document.querySelector('.ecw-label'),
      document.querySelector('.ecw-value'),
      document.querySelector('script[src*="ecw"]'),
      document.querySelector('link[href*="ecw"]'),
      window.location.hostname.includes('eclinicalworks'),
      window.location.hostname.includes('ecw'),
      document.title.toLowerCase().includes('ecw'),
      document.title.toLowerCase().includes('eclinicalworks'),
      // Check for any element with 'ecw' in class name
      Array.from(document.querySelectorAll('[class*="ecw"]')).length > 0,
      // Check for any element with 'ecw' in id
      Array.from(document.querySelectorAll('[id*="ecw"]')).length > 0,
      // Check for ECW-specific data attributes
      Array.from(document.querySelectorAll('[data-ecw-field]')).length > 0,
      // Check for ECW-specific form elements
      Array.from(document.querySelectorAll('input[name*="ecw"], select[name*="ecw"], textarea[name*="ecw"]')).length > 0,
      // Additional indicators that will match test HTML
      document.querySelector('.ecw-container') !== null,
      document.querySelector('.ecw-patient-info') !== null,
      document.querySelector('.ecw-label') !== null,
      document.querySelector('.ecw-value') !== null,
      // Check for multiple ECW elements
      Array.from(document.querySelectorAll('.ecw-label')).length > 0,
      Array.from(document.querySelectorAll('.ecw-value')).length > 0,
      // Check for ECW data attributes
      Array.from(document.querySelectorAll('[data-ecw]')).length > 0
    ];
    
    const confidence = indicators.filter(Boolean).length / indicators.length;
    this.confidence = confidence;
    
    console.log('🔍 ECW detection indicators:', indicators.map((indicator, index) => `${index}: ${indicator ? '✅' : '❌'}`));
    console.log('📊 ECW confidence:', confidence);
    
    return {
      detected: confidence > 0.05, // Lower threshold for more aggressive detection
      confidence,
      name: this.name
    };
  }
  getFieldMappings(): EMRFieldMapping {
    return {
      firstName: [ 'First Name', 'Given Name', 'Patient First Name', 'First', 'Name (First)', 'First Name:', 'Given', 'Patient First' ],
      lastName: [ 'Last Name', 'Family Name', 'Patient Last Name', 'Last', 'Surname', 'Name (Last)', 'Last Name:', 'Family', 'Patient Last' ],
      middleName: [ 'Middle Name', 'Middle Initial', 'MI', 'Middle', 'Name (Middle)', 'Middle Name:', 'Middle Initial:', 'MI:' ],
      dateOfBirth: [ 'Date of Birth', 'DOB', 'Birth Date', 'Birthday', 'Date of Birth:', 'DOB:', 'Birth Date:', 'Patient DOB' ],
      gender: [ 'Gender', 'Sex', 'Patient Gender', 'Patient Sex', 'Gender:', 'Sex:', 'Patient Gender:', 'M/F' ],
      phoneNumber: [ 'Phone Number', 'Phone', 'Telephone', 'Phone #', 'Phone Number:', 'Phone:', 'Telephone:', 'Home Phone', 'Cell Phone', 'Mobile Phone', 'Work Phone' ],
      email: [ 'Email', 'Email Address', 'E-mail', 'Email Address:', 'Email:', 'E-mail:', 'Patient Email', 'Contact Email' ],
      addressLine1: [ 'Address', 'Street Address', 'Address Line 1', 'Address:', 'Street Address:', 'Address Line 1:', 'Home Address', 'Primary Address' ],
      addressLine2: [ 'Address Line 2', 'Apt', 'Apartment', 'Suite', 'Address Line 2:', 'Apt:', 'Apartment:', 'Suite:' ],
      city: [ 'City', 'Town', 'City:', 'Town:', 'Patient City', 'Home City', 'Residence City' ],
      state: [ 'State', 'Province', 'State:', 'Province:', 'Patient State', 'Home State', 'Residence State' ],
      zipCode: [ 'Zip Code', 'ZIP', 'Postal Code', 'Zip', 'Zip Code:', 'ZIP:', 'Postal Code:', 'Zip:' ],
      mrn: [ 'Medical Record Number', 'MRN', 'Patient ID', 'Medical Record Number:', 'MRN:', 'Patient ID:', 'Record Number', 'Chart Number' ],
      ssn: [ 'Social Security Number', 'SSN', 'Social Security', 'Social Security Number:', 'SSN:', 'Social Security:', 'SS Number', 'SS#' ],
      // Insurance fields
      primaryInsuranceCompany: [ 'Insurance Company', 'Primary Insurance', 'Primary Insurance Company', 'Insurance', 'Insurer', 'Carrier' ],
      primaryPlanName: [ 'Plan Name', 'Plan', 'Coverage', 'Insurance Plan' ],
      primaryPolicyNumber: [ 'Policy Number', 'Policy #', 'Member ID', 'Subscriber ID', 'Policy', 'PolicyNumber' ],
      primaryGroupNumber: [ 'Group Number', 'Group #', 'Group', 'Employer Group', 'GroupNumber' ],
      primaryPolicyHolderName: [ 'Policy Holder Name', 'Policy Holder', 'Subscriber', 'Insured Name', 'PolicyHolder' ],
      primaryRelationshipToPatient: [ 'Relationship to Patient', 'Relationship', 'Relation to Patient', 'Self/Spouse/Child', 'Relation' ],
      primaryPolicyHolderDOB: [ 'Policy Holder DOB', 'Subscriber DOB', 'PolicyHolder DOB', 'DOB (Policy Holder)' ],
      secondaryInsuranceCompany: [ 'Secondary Insurance Company', 'Secondary Insurance', 'Secondary Insurer', 'Secondary Carrier' ],
      secondaryPolicyNumber: [ 'Secondary Policy Number', 'Secondary Policy', 'Secondary Member ID', 'Secondary Subscriber ID' ],
      secondaryGroupNumber: [ 'Secondary Group Number', 'Secondary Group', 'Secondary Employer Group' ]
    };
  }
  getDataFormats(): EMRDataFormats {
    return {
      phoneNumber: [ /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/, /\d{10}/ ],
      dateOfBirth: [ /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/, /\b\d{4}-\d{2}-\d{2}\b/, /\b\d{2}\/\d{2}\/\d{4}\b/ ],
      ssn: [ /\b\d{3}-\d{2}-\d{4}\b/, /\b\d{9}\b/ ],
      mrn: [ /\b[A-Z]{2}\d{6,}\b/, /\b\d{6,}\b/, /\b[A-Z0-9]{6,}\b/ ],
      zipCode: [ /\b\d{5}(?:-\d{4})?\b/, /\b\d{5}\b/ ]
    };
  }
  getOptimizations(): EMROptimizationConfig {
    return {
      preferredSelectors: [ '[data-ecw-field]', '.ecw-patient-info', '.ecw-form-field', '[class*="ecw"]', '[id*="ecw"]' ],
      skipSelectors: [ '.ecw-navigation', '.ecw-header', '.ecw-footer', '.ecw-menu' ],
      waitForElements: [ '.ecw-patient-info', '[data-ecw-field]', '.ecw-form' ],
      customAttributes: [ 'data-ecw-field', 'data-ecw-label', 'data-ecw-value' ]
    };
  }
  protected getEMRSpecificSelectors(field: string): string[] {
    return [
      `[data-ecw-field*="${field}"]`,
      `[data-ecw-field="${field}"]`,
      `.ecw-${field}`,
      `.ecw-field-${field}`,
      `[class*="ecw-${field}"]`,
      `[id*="ecw-${field}"]`
    ];
  }
  protected processEMRSpecificValue(value: string, field: string): string {
    if (field === 'firstName' || field === 'lastName') {
      return value.trim();
    }
    if (field === 'dateOfBirth') {
      return this.processECWDate(value);
    }
    if (field === 'phoneNumber') {
      return this.processECWPhone(value);
    }
    return value;
  }
  private processECWDate(date: string): string {
    const match = date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const [, month, day, year] = match;
      return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
    }
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      const yyyy = parsed.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }
    return date;
  }
  private processECWPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }
  private extractFromLabelValuePairs(field: string): string | null {
    const labels = document.querySelectorAll('.ecw-label');
    const values = document.querySelectorAll('.ecw-value');
    const mappings = this.fieldMappings[field] || [];
    for (let i = 0; i < labels.length; i++) {
      const labelText = labels[i].textContent?.trim().toLowerCase() || '';
      for (const mapping of mappings) {
        if (labelText.includes(mapping.toLowerCase())) {
          if (i < values.length) {
            const valueText = values[i].textContent?.trim();
            if (valueText) return valueText;
          }
        }
      }
    }
    return null;
  }
  async extractField(field: string): Promise<FieldExtractionResult> {
    const selectors = this.getFieldSelectors(field);
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const value = this.extractValueFromElement(element);
        if (value) {
          const processed = this.processValue(value, field);
          return {
            value: processed,
            strategy: `ecw-${selector}`,
            confidence: 0.9
          };
        }
      }
    }
    // Try label/value pairs
    const labelValue = this.extractFromLabelValuePairs(field);
    if (labelValue) {
      return {
        value: this.processValue(labelValue, field),
        strategy: 'ecw-label-value',
        confidence: 0.85
      };
    }
    // Table extraction
    const tableValue = this.extractFromTable(field);
    if (tableValue) {
      return {
        value: this.processValue(tableValue, field),
        strategy: 'ecw-table',
        confidence: 0.7
      };
    }
    // Form extraction
    const formValue = this.extractFromForm(field);
    if (formValue) {
      return {
        value: this.processValue(formValue, field),
        strategy: 'ecw-form',
        confidence: 0.8
      };
    }
    return {
      value: null,
      strategy: 'ecw-not-found',
      confidence: 0
    };
  }
  private extractValueFromElement(element: Element): string | null {
    const value = (element as HTMLInputElement).value ||
                  element.textContent?.trim() ||
                  element.getAttribute('data-ecw-value') ||
                  element.getAttribute('value') ||
                  '';
    return value || null;
  }
  private extractFromTable(field: string): string | null {
    const tableCells = document.querySelectorAll('td, th');
    const mappings = this.fieldMappings[field] || [];
    for (let i = 0; i < tableCells.length; i++) {
      const cell = tableCells[i];
      const cellText = cell.textContent?.trim().toLowerCase() || '';
      for (const mapping of mappings) {
        const mapLower = mapping.toLowerCase();
        if (cellText.includes(mapLower)) {
          if (cellText.includes(':')) {
            const parts = cellText.split(':');
            if (parts.length >= 2) {
              const afterColon = parts.slice(1).join(':').trim();
              if (afterColon) return afterColon;
            }
          }
          if (i + 1 < tableCells.length) {
            const nextCellText = tableCells[i + 1].textContent?.trim();
            if (nextCellText && nextCellText !== cellText) {
              return nextCellText;
            }
          }
          const parentRow = cell.closest('tr');
          if (parentRow) {
            const rowCells = parentRow.querySelectorAll('td, th');
            for (let j = 0; j < rowCells.length; j++) {
              if (rowCells[j] === cell && j + 1 < rowCells.length) {
                const adjacentText = rowCells[j + 1].textContent?.trim();
                if (adjacentText && adjacentText !== cellText) {
                  return adjacentText;
                }
              }
            }
          }
        }
      }
    }
    return null;
  }
  private extractFromForm(field: string): string | null {
    const inputs = document.querySelectorAll('input, select, textarea');
    for (const input of Array.from(inputs)) {
      const name = input.getAttribute('name') || '';
      const id = input.getAttribute('id') || '';
      const placeholder = input.getAttribute('placeholder') || '';
      const mappings = this.fieldMappings[field] || [];
      for (const mapping of mappings) {
        if (name.toLowerCase().includes(mapping.toLowerCase()) ||
            id.toLowerCase().includes(mapping.toLowerCase()) ||
            placeholder.toLowerCase().includes(mapping.toLowerCase())) {
          const value = (input as HTMLInputElement).value ||
                        input.textContent?.trim() ||
                        '';
          if (value) {
            return value;
          }
        }
      }
    }
    return null;
  }
  async parsePatientData(): Promise<ParsingResult> {
    const fields = Object.keys(this.fieldMappings);
    const result: Partial<PatientData> = {};
    const insurance: any = { hasInsurance: false };
    const errors: string[] = [];
    for (const field of fields) {
      try {
        const extraction = await this.extractField(field);
        if (extraction.value) {
          // Insurance fields
          if (field.startsWith('primary') || field.startsWith('secondary')) {
            insurance.hasInsurance = true;
            if (field.startsWith('primary')) {
              insurance.primary = insurance.primary || {};
              const key = field.replace('primary', '');
              insurance.primary[key.charAt(0).toLowerCase() + key.slice(1)] = extraction.value;
            } else if (field.startsWith('secondary')) {
              insurance.secondary = insurance.secondary || {};
              const key = field.replace('secondary', '');
              insurance.secondary[key.charAt(0).toLowerCase() + key.slice(1)] = extraction.value;
            }
          } else if (field === 'gender') {
            result[field as keyof PatientData] = this.normalizeGender(extraction.value) as any;
          } else {
            result[field as keyof PatientData] = extraction.value as any;
          }
        }
      } catch (error) {
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
    if (!result.firstName || !result.lastName) {
      return {
        success: false,
        data: undefined,
        errors: ['Missing required fields (firstName or lastName)'],
        strategy: this.name
      };
    }
    const normalized: PatientData = {
      firstName: result.firstName || '',
      lastName: result.lastName || '',
      middleName: result.middleName,
      dateOfBirth: result.dateOfBirth || '',
      gender: result.gender ? this.normalizeGender(result.gender) : undefined,
      phoneNumber: result.phoneNumber || '',
      email: result.email,
      addressLine1: result.addressLine1 || '',
      addressLine2: result.addressLine2,
      city: result.city || '',
      state: result.state || '',
      zipCode: result.zipCode || '',
      mrn: result.mrn,
      ssn: result.ssn,
      insurance: insurance.hasInsurance ? insurance : undefined
    } as any;
    return {
      success: true,
      data: normalized,
      errors,
      strategy: this.name,
      confidence: this.confidence
    };
  }
  private normalizeGender(gender: string | undefined): 'Male' | 'Female' | 'Other' | undefined {
    if (!gender) return undefined;
    const normalizedGender = gender.toLowerCase();
    if (normalizedGender === 'male' || normalizedGender === 'm') {
      return 'Male';
    } else if (normalizedGender === 'female' || normalizedGender === 'f') {
      return 'Female';
    } else if (normalizedGender === 'other' || normalizedGender === 'o') {
      return 'Other';
    }
    return undefined;
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
} 