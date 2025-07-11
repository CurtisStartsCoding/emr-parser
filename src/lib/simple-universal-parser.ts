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
      let addressValue = this.extractFieldByLabels(['Address', 'Street Address', 'Address Line 1', 'Home Address', 'Primary Address']);
      let parsedAddress = addressValue ? this.parseAddress(addressValue) : null;
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
   * Extract from info rows (div-based layouts)
   */
  private extractFromInfoRows(labels: string[]): string | null {
    const infoContainers = document.querySelectorAll('.info, .details, .patient-info, .demographics');
    for (const container of Array.from(infoContainers)) {
      const elements = container.querySelectorAll('div, span, p');
      for (let i = 0; i < elements.length - 1; i++) {
        const labelElement = elements[i];
        const valueElement = elements[i + 1];
        const labelText = labelElement.textContent?.trim().toLowerCase() || '';
        
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
    return null;
  }

  /**
   * Parse address string into components
   */
  private parseAddress(addressString: string): { addressLine1: string; city: string; state: string; zipCode: string } | null {
    if (!addressString) return null;
    
    // Simple regex-based address parsing
    const addressRegex = /^(.+?)(?:,\s*)?([^,]+?)(?:,\s*)?([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/i;
    const match = addressString.match(addressRegex);
    
    if (match) {
      return {
        addressLine1: match[1].trim(),
        city: match[2].trim(),
        state: match[3].trim(),
        zipCode: match[4].trim()
      };
    }
    
    // Fallback: try to extract components separately
    const parts = addressString.split(',').map(part => part.trim());
    if (parts.length >= 3) {
      return {
        addressLine1: parts[0],
        city: parts[1],
        state: parts[2].split(' ')[0],
        zipCode: parts[2].split(' ')[1] || ''
      };
    }
    
    return null;
  }

  /**
   * Format field values based on field type
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
  private normalizeGender(gender: string): 'Male' | 'Female' | 'Other' {
    const normalized = gender.toLowerCase().trim();
    
    if (/^(m|male)$/.test(normalized)) {
      return 'Male';
    }
    if (/^(f|female)$/.test(normalized)) {
      return 'Female';
    }
    
    return 'Other';
  }

  /**
   * Format phone number
   */
  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  /**
   * Format date to MM/DD/YYYY
   */
  private formatDate(date: string): string {
    // Handle various date formats and convert to MM/DD/YYYY
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const isoRegex = /(\d{4})-(\d{1,2})-(\d{1,2})/;
    
    let match = date.match(dateRegex);
    if (match) {
      const month = match[1].padStart(2, '0');
      const day = match[2].padStart(2, '0');
      const year = match[3];
      return `${month}/${day}/${year}`;
    }
    
    match = date.match(isoRegex);
    if (match) {
      const year = match[1];
      const month = match[2].padStart(2, '0');
      const day = match[3].padStart(2, '0');
      return `${month}/${day}/${year}`;
    }
    
    return date;
  }

  /**
   * Format SSN
   */
  private formatSSN(ssn: string): string {
    const cleaned = ssn.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
    }
    return ssn;
  }

  /**
   * Format zip code
   */
  private formatZipCode(zip: string): string {
    const cleaned = zip.replace(/\D/g, '');
    if (cleaned.length === 5) {
      return cleaned;
    } else if (cleaned.length === 9) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return zip;
  }

  /**
   * Parse insurance data
   */
  private parseInsuranceData(): InsuranceData | null {
    const insuranceLabels = ['Insurance', 'Insurance Company', 'Primary Insurance', 'Secondary Insurance'];
    const hasInsurance = insuranceLabels.some(label => 
      this.extractFieldByLabels([label]) !== null
    );

    if (!hasInsurance) {
      return { hasInsurance: false };
    }

    const primaryCompany = this.extractFieldByLabels(['Primary Insurance', 'Insurance Company', 'Insurance']);
    const secondaryCompany = this.extractFieldByLabels(['Secondary Insurance', 'Secondary']);
    const policyNumber = this.extractFieldByLabels(['Policy Number', 'Policy #', 'Member ID']);
    const groupNumber = this.extractFieldByLabels(['Group Number', 'Group #', 'Group ID']);
    const policyHolderName = this.extractFieldByLabels(['Policy Holder', 'Subscriber', 'Member Name']);

    return {
      hasInsurance: true,
      primary: primaryCompany ? {
        company: primaryCompany,
        policyNumber: policyNumber || '',
        policyHolderName: policyHolderName || '',
        relationshipToPatient: this.normalizeRelationship(this.extractFieldByLabels(['Relationship', 'Patient Relationship']) || 'Self')
      } : undefined,
      secondary: secondaryCompany ? {
        company: secondaryCompany
      } : undefined
    };
  }

  /**
   * Normalize relationship values
   */
  private normalizeRelationship(relationship: string): 'Self' | 'Spouse' | 'Child' | 'Other' {
    const normalized = relationship.toLowerCase().trim();
    if (/^self|patient$/.test(normalized)) return 'Self';
    if (/^spouse|wife|husband$/.test(normalized)) return 'Spouse';
    if (/^child|son|daughter$/.test(normalized)) return 'Child';
    return 'Other';
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.debugMode) {
      console.log(`[SimpleUniversalParser] ${message}`);
    }
  }
} 