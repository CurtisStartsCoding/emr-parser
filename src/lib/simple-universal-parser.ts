import { PatientData, ParsingResult, InsuranceData } from '../types';

/**
 * Simple Universal EMR Parser
 * 
 * This is a simplified, unified approach that works across all EMRs
 * using common HTML patterns and the parse-address package.
 */
export class SimpleUniversalParser {
  private debugMode: boolean;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
  }

  /**
   * Main parsing method - universal approach for all EMRs
   */
  async parsePatientData(): Promise<ParsingResult> {
    this.log('🚀 Starting simple universal EMR parsing...');
    
    try {
      const data: Partial<PatientData> = {};
      const errors: string[] = [];
      let confidence = 0;
      let extractedFields = 0;
      const totalFields = 15; // Basic fields we're looking for

      // Extract basic patient information
      const basicFields = [
        { key: 'firstName', labels: ['First Name', 'Given Name', 'Patient First Name', 'First', 'Name (First)'] },
        { key: 'lastName', labels: ['Last Name', 'Family Name', 'Patient Last Name', 'Last', 'Surname', 'Name (Last)'] },
        { key: 'middleName', labels: ['Middle Name', 'Middle Initial', 'MI', 'Middle', 'Name (Middle)'] },
        { key: 'dateOfBirth', labels: ['Date of Birth', 'DOB', 'Birth Date', 'Birthday', 'Patient DOB'] },
        { key: 'gender', labels: ['Gender', 'Sex', 'Patient Gender', 'Patient Sex', 'M/F'] },
        { key: 'phoneNumber', labels: ['Phone Number', 'Phone', 'Telephone', 'Phone #', 'Home Phone', 'Cell Phone', 'Mobile Phone'] },
        { key: 'email', labels: ['Email', 'Email Address', 'E-mail', 'Patient Email', 'Contact Email'] },
        { key: 'addressLine2', labels: ['Address Line 2', 'Apt', 'Suite', 'Unit', 'Floor', 'Apartment'] },
        { key: 'mrn', labels: ['Medical Record Number', 'MRN', 'Patient ID', 'Record Number', 'Chart Number'] },
        { key: 'ssn', labels: ['Social Security Number', 'SSN', 'Social Security', 'SS Number', 'SS#'] }
      ];

      // Extract basic fields
      for (const field of basicFields) {
        const value = this.extractFieldByLabels(field.labels);
        if (value) {
          // Avoid extracting label-like values for middleName
          if (field.key === 'middleName' && /^\s*(insurance company|last name|middle name)\s*:?$/i.test(value)) continue;
          if (field.key === 'gender') {
            data[field.key as keyof PatientData] = this.normalizeGender(value) as any;
          } else {
            data[field.key as keyof PatientData] = this.formatFieldValue(field.key, value) as any;
          }
          extractedFields++;
        }
      }

      // Extract and parse address
      const addressValue = this.extractFieldByLabels(['Address', 'Street Address', 'Address Line 1', 'Home Address', 'Primary Address']);
      const parsedAddress = addressValue ? this.parseAddress(addressValue) : null;
      // Fallback: try to extract address components separately if missing or incomplete
      if (!parsedAddress || !parsedAddress.city || !parsedAddress.state || !parsedAddress.zipCode) {
        const addressLine1 = this.extractFieldByLabels(['Address Line 1', 'Street Address', 'Address']) || (parsedAddress ? parsedAddress.addressLine1 : '');
        const city = this.extractFieldByLabels(['City', 'Town', 'Patient City', 'Home City']) || (parsedAddress ? parsedAddress.city : '');
        const state = this.extractFieldByLabels(['State', 'Province', 'Patient State', 'Home State']) || (parsedAddress ? parsedAddress.state : '');
        const zipCode = this.extractFieldByLabels(['Zip Code', 'ZIP', 'Postal Code', 'Zip']) || (parsedAddress ? parsedAddress.zipCode : '');
        if (addressLine1) data.addressLine1 = addressLine1;
        if (city) data.city = city;
        if (state) data.state = state;
        if (zipCode) data.zipCode = zipCode;
        extractedFields += 4;
      } else {
        data.addressLine1 = parsedAddress.addressLine1;
        data.city = parsedAddress.city;
        data.state = parsedAddress.state;
        data.zipCode = parsedAddress.zipCode;
        extractedFields += 4;
      }

      // Extract insurance information
      const insurance = this.parseInsuranceData();
      if (insurance && insurance.hasInsurance) {
        data.insurance = insurance;
        extractedFields += 2; // Count insurance as 2 fields
      }

      // Calculate confidence based on extracted fields
      confidence = extractedFields / totalFields;

      this.log(`📊 Extracted ${extractedFields}/${totalFields} fields (confidence: ${confidence.toFixed(2)})`);

      return {
        success: confidence > 0.3, // Lower threshold for universal approach
        data: data as PatientData,
        errors,
        strategy: 'simple-universal',
        confidence
      };
    } catch (error) {
      this.log(`❌ Parsing error: ${error}`);
      return {
        success: false,
        data: undefined,
        errors: [`Parsing failed: ${error}`],
        strategy: 'simple-universal-error',
        confidence: 0
      };
    }
  }

  /**
   * Extract a specific field using label matching
   */
  async extractField(field: string): Promise<{ value: string | null; strategy: string; confidence: number }> {
    this.log(`🔍 Extracting field: ${field}`);
    
    const fieldMappings: Record<string, string[]> = {
      firstName: ['First Name', 'Given Name', 'Patient First Name', 'First', 'Name (First)'],
      lastName: ['Last Name', 'Family Name', 'Patient Last Name', 'Last', 'Surname', 'Name (Last)'],
      middleName: ['Middle Name', 'Middle Initial', 'MI', 'Middle', 'Name (Middle)'],
      dateOfBirth: ['Date of Birth', 'DOB', 'Birth Date', 'Birthday', 'Patient DOB'],
      gender: ['Gender', 'Sex', 'Patient Gender', 'Patient Sex', 'M/F'],
      phoneNumber: ['Phone Number', 'Phone', 'Telephone', 'Phone #', 'Home Phone', 'Cell Phone', 'Mobile Phone'],
      email: ['Email', 'Email Address', 'E-mail', 'Patient Email', 'Contact Email'],
      addressLine1: ['Address', 'Street Address', 'Address Line 1', 'Home Address', 'Primary Address'],
      city: ['City', 'Town', 'Patient City', 'Home City'],
      state: ['State', 'Province', 'Patient State', 'Home State'],
      zipCode: ['Zip Code', 'ZIP', 'Postal Code', 'Zip'],
      mrn: ['Medical Record Number', 'MRN', 'Patient ID', 'Record Number', 'Chart Number'],
      ssn: ['Social Security Number', 'SSN', 'Social Security', 'SS Number', 'SS#']
    };

    const labels = fieldMappings[field] || [field];
    const value = this.extractFieldByLabels(labels);
    
    if (value) {
      const formattedValue = this.formatFieldValue(field, value);
      this.log(`✅ Found ${field}: ${formattedValue}`);
      return {
        value: formattedValue,
        strategy: 'simple-universal',
        confidence: 0.8
      };
    } else {
      this.log(`❌ Field not found: ${field}`);
      return {
        value: null,
        strategy: 'simple-universal',
        confidence: 0
      };
    }
  }

  /**
   * Extract field value by matching labels
   */
  private extractFieldByLabels(labels: string[]): string | null {
    // Try multiple extraction methods
    const methods = [
      this.extractFromLabelValuePairs,
      this.extractFromFormFields,
      this.extractFromTableCells,
      this.extractFromInfoRows
    ];

    for (const method of methods) {
      const value = method.call(this, labels);
      if (value) {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract from label-value pairs (common pattern)
   */
  private extractFromLabelValuePairs(labels: string[]): string | null {
    // Look for common label-value patterns
    const selectors = [
      '.ecw-label, .ecw-value',
      '.detail-label, .detail-value',
      '.info-label, .info-value',
      '.athena-label, .athena-value',
      '.onco-label, .onco-value',
      '.patient-label, .patient-value',
      '.field-label, .field-value',
      '[class*="label"], [class*="value"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        for (let i = 0; i < elements.length - 1; i++) {
          const labelElement = elements[i];
          const valueElement = elements[i + 1];
          const labelText = labelElement.textContent?.trim().toLowerCase() || '';
          // Only treat as value if next element is not a label
          const valueClass = valueElement.className || '';
          if (/label/i.test(valueClass)) continue;
          for (const label of labels) {
            if (labelText.includes(label.toLowerCase())) {
              const value = valueElement.textContent?.trim();
              if (value && value !== labelText) {
                return value;
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Extract from form fields
   */
  private extractFromFormFields(labels: string[]): string | null {
    for (const label of labels) {
      // Look for input fields with matching labels
      const inputs = document.querySelectorAll('input, select, textarea');
      for (const input of Array.from(inputs)) {
        const inputName = input.getAttribute('name')?.toLowerCase() || '';
        const inputId = input.getAttribute('id')?.toLowerCase() || '';
        const inputPlaceholder = input.getAttribute('placeholder')?.toLowerCase() || '';
        
        if (inputName.includes(label.toLowerCase()) || 
            inputId.includes(label.toLowerCase()) || 
            inputPlaceholder.includes(label.toLowerCase())) {
          const value = (input as HTMLInputElement).value?.trim();
          if (value) return value;
        }
      }
    }
    return null;
  }

  /**
   * Extract from table cells
   */
  private extractFromTableCells(labels: string[]): string | null {
    const tables = document.querySelectorAll('table');
    for (const table of Array.from(tables)) {
      const rows = table.querySelectorAll('tr');
      for (const row of Array.from(rows)) {
        const cells = row.querySelectorAll('td, th');
        for (let i = 0; i < cells.length - 1; i++) {
          const labelCell = cells[i];
          const valueCell = cells[i + 1];
          const labelText = labelCell.textContent?.trim().toLowerCase() || '';
          
          for (const label of labels) {
            if (labelText.includes(label.toLowerCase())) {
              const value = valueCell.textContent?.trim();
              if (value && value !== labelText) {
                return value;
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Extract from info rows (common in EMRs)
   */
  private extractFromInfoRows(labels: string[]): string | null {
    // Look for common info row patterns
    const selectors = [
      '.info-row',
      '.detail-row',
      '.patient-row',
      '.field-row',
      '[class*="info"]',
      '[class*="detail"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of Array.from(elements)) {
        const text = element.textContent?.trim() || '';
        for (const label of labels) {
          const regex = new RegExp(`${label}\\s*:?\\s*([^\\n\\r]+)`, 'i');
          const match = text.match(regex);
          if (match && match[1]) {
            const value = match[1].trim();
            if (value && value !== label) {
              return value;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Parse address string into components
   */
  private parseAddress(addressString: string): { addressLine1: string; city: string; state: string; zipCode: string } | null {
    if (!addressString) return null;

    // Simple regex-based address parsing
    const addressPattern = /^(.+?)(?:,\s*)?([^,]+?)(?:,\s*)?([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/i;
    const match = addressString.match(addressPattern);
    
    if (match) {
      return {
        addressLine1: match[1].trim(),
        city: match[2].trim(),
        state: match[3].trim(),
        zipCode: match[4].trim()
      };
    }
    
    return null;
  }

  /**
   * Format field value based on field type
   */
  private formatFieldValue(field: string, value: string): string {
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
        return value.trim();
    }
  }

  /**
   * Normalize gender values
   */
  private normalizeGender(gender: string): string {
    if (!gender) return '';
    
    const normalized = gender.toLowerCase().trim();
    
    // Use safer string matching instead of regex
    if (normalized.includes('male') || normalized.includes('m')) {
      return 'M';
    } else if (normalized.includes('female') || normalized.includes('f')) {
      return 'F';
    }
    
    return '';
  }

  /**
   * Format phone number
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    return phone.trim();
  }

  /**
   * Format date to MM/DD/YYYY
   */
  private formatDate(date: string): string {
    if (!date) return '';
    
    // Remove any non-date characters
    const cleanDate = date.replace(/[^\d\/\-]/g, '');
    
    // Try to parse common date formats
    const dateFormats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,   // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/    // MM-DD-YYYY
    ];
    
    for (const format of dateFormats) {
      const match = cleanDate.match(format);
      if (match) {
        const [, month, day, year] = match;
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
      }
    }
    
    return date.trim();
  }

  /**
   * Format SSN
   */
  private formatSSN(ssn: string): string {
    // Remove all non-digits
    const digits = ssn.replace(/\D/g, '');
    
    // Format as XXX-XX-XXXX
    if (digits.length === 9) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    
    return ssn.trim();
  }

  /**
   * Format ZIP code
   */
  private formatZipCode(zip: string): string {
    // Remove all non-digits
    const digits = zip.replace(/\D/g, '');
    
    // Format as XXXXX or XXXXX-XXXX
    if (digits.length === 5) {
      return digits;
    } else if (digits.length === 9) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    
    return zip.trim();
  }

  /**
   * Parse insurance data
   */
  private parseInsuranceData(): InsuranceData | null {
    const insuranceText = this.extractFieldByLabels(['Insurance', 'Insurance Company', 'Insurance Provider', 'Insurance Plan']);
    
    if (!insuranceText) {
      return {
        hasInsurance: false
      };
    }

    const policyNumber = this.extractFieldByLabels(['Policy Number', 'Policy #', 'Policy ID', 'Insurance Policy Number']) || '';
    const groupNumber = this.extractFieldByLabels(['Group Number', 'Group #', 'Group ID', 'Insurance Group Number']) || '';
    const policyHolderName = this.extractFieldByLabels(['Policy Holder', 'Subscriber', 'Member Name']) || '';
    const relationship = this.extractFieldByLabels(['Relationship', 'Patient Relationship', 'Insured Relationship']) || 'Self';

    return {
      hasInsurance: true,
      primary: {
        company: insuranceText,
        policyNumber,
        groupNumber,
        policyHolderName,
        relationshipToPatient: this.normalizeRelationship(relationship)
      }
    };
  }

  /**
   * Normalize relationship values
   */
  private normalizeRelationship(relationship: string): 'Self' | 'Spouse' | 'Child' | 'Other' {
    const normalized = relationship.toLowerCase().trim();
    
    if (normalized.includes('self') || normalized.includes('patient')) {
      return 'Self';
    } else if (normalized.includes('spouse') || normalized.includes('wife') || normalized.includes('husband')) {
      return 'Spouse';
    } else if (normalized.includes('child') || normalized.includes('son') || normalized.includes('daughter')) {
      return 'Child';
    }
    
    return 'Other';
  }

  /**
   * Log message if debug mode is enabled
   */
  private log(message: string): void {
    if (this.debugMode) {
      console.log(`[SimpleUniversalParser] ${message}`);
    }
  }
} 