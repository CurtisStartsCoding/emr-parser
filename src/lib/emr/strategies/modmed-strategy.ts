import { EMRStrategy, EMRDetectionResult, FieldExtractionResult, EMRFieldMapping, EMRDataFormats, EMROptimizationConfig } from '../emr-strategy';
import { PatientData, ParsingResult } from '../../../types';
import parseAddress = require('parse-address');

export class ModMedStrategy extends EMRStrategy {
  constructor() {
    super('ModMed');
  }

  detect(): EMRDetectionResult {
    console.log('🔍 ModMed detection started');
    
    let confidence = 0;

    // Check for ModMed-specific data attribute (highest confidence)
    const dataModMed = document.querySelector('[data-modmed="true"]');
    if (dataModMed) {
      confidence += 0.6;
      console.log('✅ ModMed data attribute found:', dataModMed);
    } else {
      console.log('❌ ModMed data attribute not found');
    }

    // Check for ModMed container
    const modmedContainer = document.querySelector('.modmed-container');
    if (modmedContainer) {
      confidence += 0.3;
      console.log('✅ ModMed container found:', modmedContainer);
    } else {
      console.log('❌ ModMed container not found');
    }

    // Check for ModMed patient info
    const modmedPatientInfo = document.querySelector('.modmed-patient-info');
    if (modmedPatientInfo) {
      confidence += 0.3;
      console.log('✅ ModMed patient info found:', modmedPatientInfo);
    } else {
      console.log('❌ ModMed patient info not found');
    }

    // Check for ModMed-specific form elements
    const modmedInputs = document.querySelectorAll('input[name*="modmed"], input[id*="modmed"]');
    if (modmedInputs.length > 0) {
      confidence += 0.1 * Math.min(modmedInputs.length, 3);
      console.log(`✅ Found ${modmedInputs.length} ModMed-specific inputs`);
    }

    // Check for ModMed-specific classes
    const modmedElements = document.querySelectorAll('[class*="modmed"]');
    if (modmedElements.length > 0) {
      confidence += 0.1 * Math.min(modmedElements.length, 5);
      console.log(`✅ Found ${modmedElements.length} ModMed-specific elements`);
    }

    // Check for ModMed-specific IDs
    const modmedIds = document.querySelectorAll('[id*="modmed"]');
    if (modmedIds.length > 0) {
      confidence += 0.1 * Math.min(modmedIds.length, 3);
      console.log(`✅ Found ${modmedIds.length} ModMed-specific IDs`);
    }

    // Check for ModMed-specific data fields
    const modmedDataFields = document.querySelectorAll('[data-field*="modmed"]');
    if (modmedDataFields.length > 0) {
      confidence += 0.1 * Math.min(modmedDataFields.length, 3);
      console.log(`✅ Found ${modmedDataFields.length} ModMed-specific data fields`);
    }

    // Check for ModMed in URL or title (low confidence)
    if (window.location.hostname.includes('modmed') || window.location.hostname.includes('modernizingmedicine')) {
      confidence += 0.2;
      console.log('✅ ModMed detected in URL');
    }

    if (document.title && (document.title.toLowerCase().includes('modmed') || document.title.toLowerCase().includes('modernizing medicine'))) {
      confidence += 0.1;
      console.log('✅ ModMed detected in title');
    }

    // Check for specialty-specific indicators (ModMed is specialty-focused)
    const specialtyIndicators = ['dermatology', 'ophthalmology', 'orthopedics', 'plastic surgery', 'otolaryngology'];
    const pageText = document.body.innerText.toLowerCase();
    for (const specialty of specialtyIndicators) {
      if (pageText.includes(specialty)) {
        confidence += 0.1;
        console.log(`✅ Specialty indicator found: ${specialty}`);
        break;
      }
    }

    console.log(`🔍 ModMed total confidence: ${confidence}`);

    const result: EMRDetectionResult = {
      detected: confidence >= 0.3,
      name: this.name,
      confidence: Math.min(confidence, 1.0)
    };

    console.log(`🔍 ModMed detection result:`, result);
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
      addressLine1: [ 'Address Line 1', 'Address', 'Street Address', 'Address Line 1:', 'Address:', 'Street Address:', 'Home Address', 'Address Line 1' ],
      addressLine2: [ 'Address Line 2', 'Apt', 'Suite', 'Unit', 'Floor', 'Apartment', 'Address Line 2:', 'Apt:', 'Suite:', 'Unit:', 'Floor:', 'Apartment:' ],
      city: [ 'City', 'City:', 'Patient City', 'Home City', 'City' ],
      state: [ 'State', 'State:', 'Patient State', 'Home State', 'State' ],
      zipCode: [ 'Zip Code', 'Zip', 'Postal Code', 'Zip Code:', 'Zip:', 'Postal Code:', 'ZIP', 'ZIP Code', 'Zip Code' ],
      mrn: [ 'Medical Record Number', 'MRN', 'Patient ID', 'Record Number', 'Chart Number', 'Medical Record Number:', 'MRN:', 'Patient ID:', 'Record Number:', 'Chart Number:' ],
      ssn: [ 'Social Security Number', 'SSN', 'Social Security', 'SS Number', 'SS#', 'Social Security Number:', 'SSN:', 'Social Security:', 'SS Number:', 'SS#' ],
      // Insurance fields
      insuranceCompany: [ 'Insurance Company', 'Primary Insurance', 'Insurance Provider', 'Insurance Company:', 'Primary Insurance:', 'Insurance Provider:', 'Carrier', 'Insurance Carrier' ],
      insurancePlanName: [ 'Plan Name', 'Insurance Plan', 'Plan Name:', 'Insurance Plan:', 'Plan Type', 'Plan Type:' ],
      insurancePolicyNumber: [ 'Policy Number', 'Policy #', 'Policy Number:', 'Policy #:', 'Member ID', 'Member ID:', 'Member Number', 'Member Number:' ],
      insuranceGroupNumber: [ 'Group Number', 'Group #', 'Group Number:', 'Group #:', 'Group ID', 'Group ID:', 'Employer Group', 'Employer Group:' ],
      insurancePolicyHolder: [ 'Policy Holder', 'Subscriber', 'Policy Holder Name', 'Subscriber Name', 'Policy Holder:', 'Subscriber:', 'Policy Holder Name:', 'Subscriber Name:' ],
      insuranceRelationship: [ 'Relationship', 'Relationship to Patient', 'Relationship:', 'Relationship to Patient:', 'Patient Relationship', 'Patient Relationship:' ],
      insurancePolicyHolderDOB: [ 'Policy Holder DOB', 'Subscriber DOB', 'Policy Holder Date of Birth', 'Subscriber Date of Birth', 'Policy Holder DOB:', 'Subscriber DOB:' ],
      // Secondary insurance
      secondaryInsuranceCompany: [ 'Secondary Insurance', 'Secondary Insurance Company', 'Secondary Insurance:', 'Secondary Insurance Company:', 'Secondary Carrier', 'Secondary Carrier:' ],
      secondaryPolicyNumber: [ 'Secondary Policy Number', 'Secondary Policy #', 'Secondary Policy Number:', 'Secondary Policy #:', 'Secondary Member ID', 'Secondary Member ID:' ],
      secondaryGroupNumber: [ 'Secondary Group Number', 'Secondary Group #', 'Secondary Group Number:', 'Secondary Group #:' ]
    };
  }

  getDataFormats(): EMRDataFormats {
    return {
      phoneNumber: [/^\(\d{3}\) \d{3}-\d{4}$/, /^\d{3}-\d{3}-\d{4}$/, /^\d{10}$/],
      dateOfBirth: [/^\d{1,2}\/\d{1,2}\/\d{4}$/, /^\d{1,2}-\d{1,2}-\d{4}$/],
      ssn: [/^\d{3}-\d{2}-\d{4}$/, /^\d{9}$/],
      mrn: [/^[A-Z0-9]+$/],
      zipCode: [/^\d{5}$/, /^\d{5}-\d{4}$/]
    };
  }

  getOptimizations(): EMROptimizationConfig {
    return {
      preferredSelectors: ['[data-modmed-field]', '.modmed-patient-info', '.patient-details'],
      skipSelectors: ['.hidden', '.disabled', '[readonly]'],
      waitForElements: ['.modmed-container', '.patient-info'],
      customAttributes: ['data-modmed-field', 'data-patient-field']
    };
  }

  protected getEMRSpecificSelectors(field: string): string[] {
    const selectors: { [key: string]: string[] } = {
      firstName: [
        '[data-modmed-field="firstName"]',
        '.modmed-first-name',
        '#modmedFirstName',
        '[name*="firstName"][data-modmed]',
        '.patient-first-name[data-modmed]'
      ],
      lastName: [
        '[data-modmed-field="lastName"]',
        '.modmed-last-name',
        '#modmedLastName',
        '[name*="lastName"][data-modmed]',
        '.patient-last-name[data-modmed]'
      ],
      dateOfBirth: [
        '[data-modmed-field="dateOfBirth"]',
        '.modmed-dob',
        '#modmedDOB',
        '[name*="dob"][data-modmed]',
        '.patient-dob[data-modmed]'
      ],
      phoneNumber: [
        '[data-modmed-field="phoneNumber"]',
        '.modmed-phone',
        '#modmedPhone',
        '[name*="phone"][data-modmed]',
        '.patient-phone[data-modmed]'
      ]
    };

    return selectors[field] || [];
  }

  protected processEMRSpecificValue(value: string, field: string): string {
    if (!value) return value;

    switch (field) {
      case 'dateOfBirth':
        return this.processModMedDate(value);
      case 'phoneNumber':
        return this.processModMedPhone(value);
      case 'gender':
        return this.normalizeGender(value) || value;
      default:
        return value.trim();
    }
  }

  private processModMedDate(date: string): string {
    // ModMed typically uses MM/DD/YYYY format
    const cleaned = date.replace(/[^\d\/\-]/g, '');
    
    // Handle various date formats
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
      // Ensure consistent MM/DD/YYYY format
      const parts = cleaned.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${month}/${day}/${year}`;
      }
      return cleaned;
    }
    
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleaned)) {
      const parts = cleaned.split('-');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${month}/${day}/${year}`;
      }
      return cleaned.replace(/-/g, '/');
    }
    
    // Try to parse and format
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      const year = parsed.getFullYear();
      return `${month}/${day}/${year}`;
    }
    
    return cleaned;
  }

  private processModMedPhone(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // If already formatted, return as is
    if (/^\(\d{3}\) \d{3}-\d{4}$/.test(phone)) {
      return phone;
    }
    
    return phone;
  }

  async extractField(field: string): Promise<FieldExtractionResult> {
    console.log(`🔍 ModMed extracting field: ${field}`);
    
    try {
      // Try ModMed-specific selectors first
      const modmedSelectors = this.getEMRSpecificSelectors(field);
      for (const selector of modmedSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const value = this.extractValueFromElement(element);
          if (value) {
            const processed = this.processEMRSpecificValue(value, field);
            console.log(`✅ ModMed-specific selector found for ${field}:`, processed);
            return {
              value: processed,
              strategy: 'modmed-specific',
              confidence: 0.9
            };
          }
        }
      }

      // Try detail pairs (label-value pairs common in ModMed)
      const detailValue = this.extractFromDetailPairs(field);
      if (detailValue) {
        const processed = this.processEMRSpecificValue(detailValue, field);
        console.log(`✅ Detail pairs found for ${field}:`, processed);
        return {
          value: processed,
          strategy: 'modmed-detail-pairs',
          confidence: 0.8
        };
      }

      // Try table extraction
      const tableValue = this.extractFromTable(field);
      if (tableValue) {
        const processed = this.processEMRSpecificValue(tableValue, field);
        console.log(`✅ Table extraction found for ${field}:`, processed);
        return {
          value: processed,
          strategy: 'modmed-table',
          confidence: 0.7
        };
      }

      // Try form extraction
      const formValue = this.extractFromForm(field);
      if (formValue) {
        const processed = this.processEMRSpecificValue(formValue, field);
        console.log(`✅ Form extraction found for ${field}:`, processed);
        return {
          value: processed,
          strategy: 'modmed-form',
          confidence: 0.6
        };
      }

      console.log(`❌ No value found for field: ${field}`);
      return {
        value: null,
        strategy: 'modmed-none',
        confidence: 0
      };

    } catch (error) {
      console.error(`❌ Error extracting field ${field}:`, error);
      return {
        value: null,
        strategy: 'modmed-error',
        confidence: 0
      };
    }
  }

  private extractValueFromElement(element: Element): string | null {
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
      return element.value;
    }
    return element.textContent?.trim() || null;
  }

  private extractFromDetailPairs(field: string): string | null {
    const labels = this.fieldMappings[field] || [];
    
    for (const label of labels) {
      // Look for label-value pairs in ModMed format
      const labelElements = document.querySelectorAll('*');
      
      for (const labelElement of Array.from(labelElements)) {
        if (!labelElement.textContent?.includes(label)) continue;
        // Check if it's a label element
        if (labelElement.tagName === 'LABEL' || labelElement.classList.contains('label')) {
          // Look for associated input or value
          const input = document.querySelector(`input[for="${labelElement.getAttribute('for')}"]`);
          if (input) {
            return this.extractValueFromElement(input);
          }
          
          // Look for next sibling with value
          const nextSibling = labelElement.nextElementSibling;
          if (nextSibling && nextSibling.classList.contains('value')) {
            return this.extractValueFromElement(nextSibling);
          }
        }
        
        // Check if it's a detail row
        if (labelElement.classList.contains('detail-row') || labelElement.classList.contains('field-row')) {
          const valueElement = labelElement.querySelector('.value, .field-value, .detail-value');
          if (valueElement) {
            return this.extractValueFromElement(valueElement);
          }
        }
      }
    }
    
    return null;
  }

  private extractFromTable(field: string): string | null {
    const labels = this.fieldMappings[field] || [];
    
    for (const label of labels) {
      const tableCells = document.querySelectorAll('td, th');
      
      for (const cell of Array.from(tableCells)) {
        if (cell.textContent?.trim().toLowerCase().includes(label.toLowerCase())) {
          // Find the next cell or sibling cell with the value
          const nextCell = cell.nextElementSibling;
          if (nextCell) {
            return this.extractValueFromElement(nextCell);
          }
          
          // Look for value in the same row
          const row = cell.closest('tr');
          if (row) {
            const cells = row.querySelectorAll('td, th');
            for (let i = 0; i < cells.length; i++) {
              if (cells[i] === cell && i + 1 < cells.length) {
                return this.extractValueFromElement(cells[i + 1]);
              }
            }
          }
        }
      }
    }
    
    return null;
  }

  private extractFromForm(field: string): string | null {
    const labels = this.fieldMappings[field] || [];
    
    for (const label of labels) {
      // Look for form fields with matching labels
      const formElements = document.querySelectorAll('input, select, textarea');
      
      for (const element of Array.from(formElements)) {
        const name = element.getAttribute('name') || '';
        const id = element.getAttribute('id') || '';
        const placeholder = element.getAttribute('placeholder') || '';
        
        if (name.toLowerCase().includes(label.toLowerCase()) ||
            id.toLowerCase().includes(label.toLowerCase()) ||
            placeholder.toLowerCase().includes(label.toLowerCase())) {
          return this.extractValueFromElement(element);
        }
      }
    }
    
    return null;
  }

  async parsePatientData(): Promise<ParsingResult> {
    console.log('🚀 ModMed parsing started');
    
    try {
      const data: Partial<PatientData> = {};
      const errors: string[] = [];
      let confidence = 0;
      let extractedFields = 0;
      const totalFields = 15;

      // Extract basic patient information
      const basicFields = [
        'firstName', 'lastName', 'middleName', 'dateOfBirth', 'gender',
        'phoneNumber', 'email', 'addressLine1', 'addressLine2', 'city',
        'state', 'zipCode', 'mrn', 'ssn'
      ];

      // Extract insurance information
      const insuranceFields = [
        'insuranceCompany', 'insurancePlanName', 'insurancePolicyNumber', 
        'insuranceGroupNumber', 'insurancePolicyHolder', 'insuranceRelationship',
        'insurancePolicyHolderDOB', 'secondaryInsuranceCompany', 
        'secondaryPolicyNumber', 'secondaryGroupNumber'
      ];

      for (const field of basicFields) {
        try {
          const result = await this.extractField(field);
          if (result.value) {
            data[field as keyof PatientData] = result.value as any;
            extractedFields++;
            confidence += result.confidence;
            console.log(`✅ Extracted ${field}:`, result.value);
          }
        } catch (error) {
          const errorMsg = `Failed to extract ${field}: ${error}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Extract insurance data
      const insuranceData: any = { hasInsurance: false };
      let insuranceExtracted = 0;

      for (const field of insuranceFields) {
        try {
          const result = await this.extractField(field);
          if (result.value) {
            insuranceData[field] = result.value;
            insuranceExtracted++;
            console.log(`✅ Extracted insurance ${field}:`, result.value);
          }
        } catch (error) {
          const errorMsg = `Failed to extract insurance ${field}: ${error}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Structure insurance data properly
      if (insuranceExtracted > 0) {
        insuranceData.hasInsurance = true;
        
        // Primary insurance
        if (insuranceData.insuranceCompany) {
          data.insurance = {
            hasInsurance: true,
            primary: {
              company: insuranceData.insuranceCompany,
              planName: insuranceData.insurancePlanName,
              policyNumber: insuranceData.insurancePolicyNumber,
              groupNumber: insuranceData.insuranceGroupNumber,
              policyHolderName: insuranceData.insurancePolicyHolder,
              relationshipToPatient: this.normalizeRelationship(insuranceData.insuranceRelationship),
              policyHolderDOB: insuranceData.insurancePolicyHolderDOB
            }
          };
        }

        // Secondary insurance
        if (insuranceData.secondaryInsuranceCompany) {
          if (!data.insurance) {
            data.insurance = { hasInsurance: true };
          }
          data.insurance.secondary = {
            company: insuranceData.secondaryInsuranceCompany,
            policyNumber: insuranceData.secondaryPolicyNumber,
            groupNumber: insuranceData.secondaryGroupNumber
          };
        }
      }

      // Handle address parsing if we have a full address
      if (!data.addressLine1 && !data.city && !data.state && !data.zipCode) {
        const fullAddress = await this.extractField('addressLine1');
        if (fullAddress.value) {
          try {
            const parsed = parseAddress.parseLocation(fullAddress.value);
            if (parsed) {
              data.addressLine1 = parsed.number + ' ' + parsed.street;
              data.city = parsed.city || '';
              data.state = parsed.state || '';
              data.zipCode = parsed.zip || '';
              extractedFields += 3;
              console.log('✅ Parsed address components');
            }
          } catch (error) {
            console.error('❌ Address parsing failed:', error);
          }
        }
      }

      // Calculate final confidence
      const finalConfidence = extractedFields > 0 ? confidence / extractedFields : 0;

      // Validate required fields
      if (!data.firstName || !data.lastName) {
        errors.push('Missing required fields: firstName and lastName');
      }

      const result: ParsingResult = {
        success: extractedFields >= 3 && finalConfidence > 0.3,
        data: data as PatientData,
        errors,
        strategy: 'modmed',
        confidence: finalConfidence
      };

      console.log('✅ ModMed parsing completed:', result);
      return result;

    } catch (error) {
      console.error('❌ ModMed parsing error:', error);
      return {
        success: false,
        data: undefined,
        errors: [`ModMed parsing failed: ${error}`],
        strategy: 'modmed-error',
        confidence: 0
      };
    }
  }

  private normalizeGender(gender: string | undefined): 'Male' | 'Female' | 'Other' | undefined {
    if (!gender) return undefined;
    
    const normalized = gender.trim().toLowerCase();
    
    if (normalized === 'male' || normalized === 'm') return 'Male';
    if (normalized === 'female' || normalized === 'f') return 'Female';
    
    return 'Other';
  }

  private normalizeRelationship(relationship: string | undefined): 'Self' | 'Spouse' | 'Child' | 'Other' {
    if (!relationship) return 'Other';
    
    const normalized = relationship.trim().toLowerCase();
    
    if (normalized === 'self' || normalized === 'patient') return 'Self';
    if (normalized === 'spouse' || normalized === 'husband' || normalized === 'wife') return 'Spouse';
    if (normalized === 'child' || normalized === 'son' || normalized === 'daughter') return 'Child';
    
    return 'Other';
  }
} 