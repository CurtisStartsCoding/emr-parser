import { EMRStrategy, EMRDetectionResult, FieldExtractionResult, EMRFieldMapping, EMRDataFormats, EMROptimizationConfig } from '../emr-strategy';
import { PatientData, ParsingResult } from '../../../types';
import parseAddress = require('parse-address');

export class AthenahealthStrategy extends EMRStrategy {
  constructor() {
    super('Athenahealth');
  }

  detect(): EMRDetectionResult {
    console.log('🔍 Athenahealth detection started');
    
    let confidence = 0;

    // Check for Athenahealth-specific data attribute (highest confidence)
    const dataAthena = document.querySelector('[data-athena="true"]');
    if (dataAthena) {
      confidence += 0.6;
      console.log('✅ Athenahealth data attribute found:', dataAthena);
    } else {
      console.log('❌ Athenahealth data attribute not found');
    }

    // Check for Athenahealth container
    const athenaContainer = document.querySelector('.athena-container');
    if (athenaContainer) {
      confidence += 0.3;
      console.log('✅ Athenahealth container found:', athenaContainer);
    } else {
      console.log('❌ Athenahealth container not found');
    }

    // Check for Athenahealth patient info
    const athenaPatientInfo = document.querySelector('.athena-patient-info');
    if (athenaPatientInfo) {
      confidence += 0.3;
      console.log('✅ Athenahealth patient info found:', athenaPatientInfo);
    } else {
      console.log('❌ Athenahealth patient info not found');
    }

    // Check for Athenahealth-specific form elements
    const athenaInputs = document.querySelectorAll('input[name*="athena"], input[id*="athena"]');
    if (athenaInputs.length > 0) {
      confidence += 0.1 * Math.min(athenaInputs.length, 3);
      console.log(`✅ Found ${athenaInputs.length} Athenahealth-specific inputs`);
    }

    // Check for Athenahealth-specific classes
    const athenaElements = document.querySelectorAll('[class*="athena"]');
    if (athenaElements.length > 0) {
      confidence += 0.1 * Math.min(athenaElements.length, 5);
      console.log(`✅ Found ${athenaElements.length} Athenahealth-specific elements`);
    }

    // Check for Athenahealth-specific IDs
    const athenaIds = document.querySelectorAll('[id*="athena"]');
    if (athenaIds.length > 0) {
      confidence += 0.1 * Math.min(athenaIds.length, 3);
      console.log(`✅ Found ${athenaIds.length} Athenahealth-specific IDs`);
    }

    // Check for Athenahealth-specific data fields
    const athenaDataFields = document.querySelectorAll('[data-field*="athena"]');
    if (athenaDataFields.length > 0) {
      confidence += 0.1 * Math.min(athenaDataFields.length, 3);
      console.log(`✅ Found ${athenaDataFields.length} Athenahealth-specific data fields`);
    }

    // Check for Athenahealth in URL or title (low confidence)
    if (window.location.hostname.includes('athenahealth') || window.location.hostname.includes('athena')) {
      confidence += 0.2;
      console.log('✅ Athenahealth detected in URL');
    }

    if (document.title.toLowerCase().includes('athena') || document.title.toLowerCase().includes('athenahealth')) {
      confidence += 0.1;
      console.log('✅ Athenahealth detected in title');
    }

    console.log(`🔍 Athenahealth total confidence: ${confidence}`);

    const result: EMRDetectionResult = {
      detected: confidence >= 0.3,
      name: this.name,
      confidence: Math.min(confidence, 1.0)
    };

    console.log(`🔍 Athenahealth detection result:`, result);
    return result;
  }
  getFieldMappings(): EMRFieldMapping {
    return {
      firstName: [ 'First Name', 'Given Name', 'Patient First Name', 'First', 'Name (First)', 'First Name:', 'Given', 'Patient First', 'First', 'First Name' ],
      lastName: [ 'Last Name', 'Family Name', 'Patient Last Name', 'Last', 'Surname', 'Name (Last)', 'Last Name:', 'Family', 'Patient Last', 'Last', 'Last Name' ],
      middleName: [ 'Middle Name', 'Middle Initial', 'MI', 'Middle', 'Name (Middle)', 'Middle Name:', 'Middle Initial:', 'MI:', 'Middle', 'Middle Name' ],
      dateOfBirth: [ 'Date of Birth', 'DOB', 'Birth Date', 'Birthday', 'Date of Birth:', 'DOB:', 'Birth Date:', 'Patient DOB', 'Birth Date', 'DOB' ],
      gender: [ 'Gender', 'Sex', 'Patient Gender', 'Patient Sex', 'Gender:', 'Sex:', 'Patient Gender:', 'M/F', 'Sex', 'Gender' ],
      phoneNumber: [ 'Phone Number', 'Phone', 'Telephone', 'Phone #', 'Phone Number:', 'Phone:', 'Telephone:', 'Home Phone', 'Cell Phone', 'Mobile Phone', 'Work Phone', 'Phone', 'Telephone' ],
      email: [ 'Email', 'Email Address', 'E-mail', 'Email Address:', 'Email:', 'E-mail:', 'Patient Email', 'Contact Email', 'Email Address', 'Email' ],
      addressLine1: [ 'Address', 'Street Address', 'Address Line 1', 'Address:', 'Street Address:', 'Address Line 1:', 'Home Address', 'Primary Address', 'Street Address', 'Address' ],
      addressLine2: [ 'Address Line 2', 'Apt', 'Apartment', 'Suite', 'Address Line 2:', 'Apt:', 'Apartment:', 'Suite:', 'Apartment', 'Suite' ],
      city: [ 'City', 'Town', 'City:', 'Town:', 'Patient City', 'Home City', 'Residence City', 'City', 'Town' ],
      state: [ 'State', 'Province', 'State:', 'Province:', 'Patient State', 'Home State', 'Residence State', 'State', 'Province' ],
      zipCode: [ 'Zip Code', 'ZIP', 'Postal Code', 'Zip', 'Zip Code:', 'ZIP:', 'Postal Code:', 'Zip:', 'ZIP', 'Postal Code' ],
      mrn: [ 'Medical Record Number', 'MRN', 'Patient ID', 'Medical Record Number:', 'MRN:', 'Patient ID:', 'Record Number', 'Chart Number', 'MRN', 'Patient ID' ],
      ssn: [ 'Social Security Number', 'SSN', 'Social Security', 'Social Security Number:', 'SSN:', 'Social Security:', 'SS Number', 'SS#', 'SSN', 'Social Security' ],
      // Insurance fields
      primaryInsuranceCompany: [ 'Insurance Company', 'Insurance Company:', 'Primary Insurance', 'Primary Insurance Company', 'Insurance:', 'Insurer', 'Carrier' ],
      primaryPlanName: [ 'Plan Name', 'Plan Name:', 'Plan', 'Coverage', 'Insurance Plan', 'Plan:' ],
      primaryPolicyNumber: [ 'Policy Number', 'Policy Number:', 'Policy #', 'Member ID', 'Subscriber ID', 'Policy', 'PolicyNumber', 'Policy:' ],
      primaryGroupNumber: [ 'Group Number', 'Group Number:', 'Group #', 'Group', 'Employer Group', 'GroupNumber', 'Group:' ],
      primaryPolicyHolderName: [ 'Policy Holder Name', 'Policy Holder Name:', 'Policy Holder', 'Subscriber', 'Insured Name', 'PolicyHolder', 'Policy Holder:' ],
      primaryRelationshipToPatient: [ 'Relationship to Patient', 'Relationship to Patient:', 'Relationship', 'Relation to Patient', 'Self/Spouse/Child', 'Relation', 'Relationship:' ],
      primaryPolicyHolderDOB: [ 'Policy Holder DOB', 'Policy Holder DOB:', 'Subscriber DOB', 'PolicyHolder DOB', 'DOB (Policy Holder)', 'Policy Holder DOB:' ],
      secondaryInsuranceCompany: [ 'Secondary Insurance Company', 'Secondary Insurance Company:', 'Secondary Insurance', 'Secondary Insurer', 'Secondary Carrier', 'Secondary Insurance:' ],
      secondaryPolicyNumber: [ 'Secondary Policy Number', 'Secondary Policy Number:', 'Secondary Policy', 'Secondary Member ID', 'Secondary Subscriber ID', 'Secondary Policy:' ],
      secondaryGroupNumber: [ 'Secondary Group Number', 'Secondary Group Number:', 'Secondary Group', 'Secondary Employer Group', 'Secondary Group:' ]
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
      preferredSelectors: [ '[data-athena-field]', '.athena-patient-info', '.athena-form-field', '.detail-label', '.detail-value', '.patient-card', '.athena-card', '[class*="athena"]', '[id*="athena"]' ],
      skipSelectors: [ '.athena-navigation', '.athena-header', '.athena-footer', '.athena-menu' ],
      waitForElements: [ '.athena-patient-info', '[data-athena-field]', '.athena-form', '.detail-label', '.patient-card' ],
      customAttributes: [ 'data-athena-field', 'data-athena-label', 'data-athena-value' ]
    };
  }
  protected getEMRSpecificSelectors(field: string): string[] {
    return [
      `[data-athena-field*="${field}"]`,
      `[data-athena-field="${field}"]`,
      `.athena-${field}`,
      `.athena-field-${field}`,
      `[class*="athena-${field}"]`,
      `[id*="athena-${field}"]`,
      `.detail-label[data-field="${field}"]`,
      `.detail-value[data-field="${field}"]`,
      `[aria-label*="${this.getFieldMappings()[field]?.[0] || field}"]`,
      `[aria-labelledby*="${this.getFieldMappings()[field]?.[0] || field}"]`,
      `[data-field*="${this.getFieldMappings()[field]?.[0] || field}"]`,
      `[data-label*="${this.getFieldMappings()[field]?.[0] || field}"]`,
      `input[name*="${this.getFieldMappings()[field]?.[0] || field}"]`,
      `input[id*="${this.getFieldMappings()[field]?.[0] || field}"]`,
      `input[placeholder*="${this.getFieldMappings()[field]?.[0] || field}"]`,
      `[data-field="${field}"]`,
      `[data-label="${field}"]`,
      `input[name="${field}"]`,
      `input[id="${field}"]`
    ];
  }
  protected processEMRSpecificValue(value: string, field: string): string {
    if (field === 'firstName' || field === 'lastName') {
      return value.trim();
    }
    if (field === 'dateOfBirth') {
      return this.processAthenaDate(value);
    }
    if (field === 'phoneNumber') {
      return this.processAthenaPhone(value);
    }
    return value;
  }
  private processAthenaDate(date: string): string {
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
  private processAthenaPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }
  async extractField(field: string): Promise<FieldExtractionResult> {
    console.log(`🔍 Athenahealth extractField called for: ${field}`);
    const mappings = this.fieldMappings[field] || [];
    console.log(`🔍 Field mappings for ${field}:`, mappings);
    try {
      const selectors = this.getFieldSelectors(field);
      console.log(`📋 Athenahealth selectors for ${field}:`, selectors);
      
      // Try Athenahealth-specific selectors first
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        console.log(`🔍 Trying selector "${selector}":`, element);
        if (element) {
          const value = this.extractValueFromElement(element);
          console.log(`✅ Found value for ${field}:`, value);
          if (value) {
            const processed = this.processValue(value, field);
            return {
              value: processed,
              strategy: `athena-${selector}`,
              confidence: 0.9
            };
          }
        }
      }
      
      console.log(`🔍 No Athenahealth-specific selectors found for ${field}, trying detail pairs`);
      const detailValue = this.extractFromDetailPairs(field);
      if (detailValue) {
        console.log(`✅ Found detail value for ${field}:`, detailValue);
        return {
          value: this.processValue(detailValue, field),
          strategy: 'athena-detail-pairs',
          confidence: 0.85
        };
      }
      
      console.log(`🔍 No detail pairs found for ${field}, trying table extraction`);
      const tableValue = this.extractFromTable(field);
      if (tableValue) {
        console.log(`✅ Found table value for ${field}:`, tableValue);
        return {
          value: this.processValue(tableValue, field),
          strategy: 'athena-table',
          confidence: 0.7
        };
      }
      
      console.log(`🔍 No table extraction found for ${field}, trying form extraction`);
      const formValue = this.extractFromForm(field);
      if (formValue) {
        console.log(`✅ Found form value for ${field}:`, formValue);
        return {
          value: this.processValue(formValue, field),
          strategy: 'athena-form',
          confidence: 0.8
        };
      }
      
      console.log(`❌ No extraction method found for ${field}`);
      return {
        value: null,
        strategy: 'athena-not-found',
        confidence: 0
      };
    } catch (error) {
      console.error(`❌ Athenahealth extractField error for ${field}:`, error);
      return {
        value: null,
        strategy: 'athena-error',
        confidence: 0
      };
    }
  }
  private extractValueFromElement(element: Element): string | null {
    const value = (element as HTMLInputElement).value ||
                  element.textContent?.trim() ||
                  element.getAttribute('data-athena-value') ||
                  element.getAttribute('value') ||
                  '';
    return value || null;
  }
  private extractFromDetailPairs(field: string): string | null {
    const labels = document.querySelectorAll('.detail-label');
    const mappings = this.fieldMappings[field] || [];
    console.log(`🔍 [extractFromDetailPairs] Searching for field: ${field}`);
    console.log(`🔍 [extractFromDetailPairs] Mappings:`, mappings);
    for (const label of Array.from(labels)) {
      const labelText = label.textContent?.trim().toLowerCase() || '';
      console.log(`🔍 [extractFromDetailPairs] Label text:`, labelText);
      for (const mapping of mappings) {
        const mapLower = mapping.toLowerCase();
        if (labelText.includes(mapLower)) {
          console.log(`✅ [extractFromDetailPairs] Match found: ${mapping}`);
          const nextSibling = label.nextElementSibling;
          if (nextSibling && nextSibling.classList.contains('detail-value')) {
            const value = nextSibling.textContent?.trim();
            if (value) {
              console.log(`✅ [extractFromDetailPairs] Value found:`, value);
              return value;
            }
          }
          const parent = label.parentElement;
          if (parent) {
            const detailValue = parent.querySelector('.detail-value');
            if (detailValue) {
              const value = detailValue.textContent?.trim();
              if (value) {
                console.log(`✅ [extractFromDetailPairs] Value found in parent:`, value);
                return value;
              }
            }
          }
        }
      }
    }
    console.log(`❌ [extractFromDetailPairs] No value found for field: ${field}`);
    return null;
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
    let extractedFields = 0;
    
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
          extractedFields++;
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
        strategy: this.name,
        confidence: 0
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
    
    // Calculate confidence based on extracted fields
    const totalFields = fields.length;
    const confidence = totalFields > 0 ? extractedFields / totalFields : 0;
    
    return {
      success: true,
      data: normalized,
      errors,
      strategy: this.name,
      confidence: Math.min(confidence, 1.0)
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