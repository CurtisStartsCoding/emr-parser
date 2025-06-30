// RadOrderPad EMR Import Extension
// Captures patient data from any EMR and fills RadOrderPad forms

// manifest.json configuration
const manifest = {
  "manifest_version": 3,
  "name": "RadOrderPad EMR Importer",
  "version": "1.0.0",
  "description": "Import patient data from EMR to RadOrderPad",
  "permissions": [
    "activeTab",
    "storage",
    "clipboardWrite"
  ],
  "host_permissions": [
    "*://*.radorderpad.com/*",
    "*://localhost:3000/*", // For development
    "<all_urls>" // For EMR access (will refine based on client EMRs)
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
};

// Types matching your RadOrderPad structure
interface RadOrderPatient {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // MM/DD/YYYY format
  gender?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email?: string;
  mrn?: string;
  ssn?: string;
}

interface RadOrderInsurance {
  hasInsurance: boolean;
  primary?: {
    company: string;
    planName?: string;
    policyNumber: string;
    groupNumber?: string;
    policyHolderName: string;
    relationshipToPatient: string;
    policyHolderDOB?: string;
  };
  secondary?: {
    company?: string;
    policyNumber?: string;
  };
}

interface RadOrderImportData {
  patient: RadOrderPatient;
  insurance: RadOrderInsurance;
  sourceEMR: string;
  capturedAt: string;
  orderId?: string; // To link with existing order
}

// Generic EMR detector and parser
class UniversalEMRParser {
  private emrName: string = 'Unknown EMR';
  
  detectEMR(): string {
    // Check for common EMR indicators
    const indicators = {
      'Epic MyChart': [
        () => document.querySelector('.MyChartLogo'),
        () => window.location.hostname.includes('mychart'),
        () => document.querySelector('[class*="epic"]')
      ],
      'Cerner PowerChart': [
        () => document.querySelector('[id*="cerner"]'),
        () => window.location.hostname.includes('cerner'),
        () => document.querySelector('.cerner-logo')
      ],
      'Athena': [
        () => window.location.hostname.includes('athenahealth'),
        () => document.querySelector('[class*="athena"]')
      ],
      'eClinicalWorks': [
        () => window.location.hostname.includes('eclinicalworks'),
        () => document.querySelector('[src*="ecw"]')
      ],
      'NextGen': [
        () => window.location.hostname.includes('nextgen'),
        () => document.querySelector('[class*="nextgen"]')
      ],
      'Allscripts': [
        () => window.location.hostname.includes('allscripts'),
        () => document.querySelector('[id*="allscripts"]')
      ],
      'Practice Fusion': [
        () => window.location.hostname.includes('practicefusion')
      ],
      'DrChrono': [
        () => window.location.hostname.includes('drchrono')
      ],
      'Kareo': [
        () => window.location.hostname.includes('kareo')
      ]
    };
    
    for (const [emr, checks] of Object.entries(indicators)) {
      if (checks.some(check => {
        try { return check(); } catch { return false; }
      })) {
        this.emrName = emr;
        return emr;
      }
    }
    
    return 'Unknown EMR';
  }
  
  parsePatientData(): RadOrderPatient | null {
    console.log(`Parsing patient data from ${this.emrName}`);
    
    // Try multiple strategies
    const strategies = [
      () => this.parseByLabels(),
      () => this.parseByPatterns(),
      () => this.parseByTableStructure(),
      () => this.parseByDivStructure()
    ];
    
    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (result && result.firstName && result.lastName) {
          console.log('Successfully parsed patient data:', result);
          return result;
        }
      } catch (error) {
        console.log('Strategy failed:', error);
      }
    }
    
    return null;
  }
  
  private parseByLabels(): RadOrderPatient {
    const getFieldByLabel = (labelTexts: string[]): string => {
      // Expand label variations for maximum flexibility
      const expandedLabels: string[] = [];
      for (const label of labelTexts) {
        expandedLabels.push(
          label,
          label.replace(/\s+/g, ''),  // Remove spaces: "first name" → "firstname"
          label.replace(/\s+/g, '_'), // Underscores: "first name" → "first_name"
          label.replace(/\s+/g, '-'), // Hyphens: "first name" → "first-name"
        );
      }
      
      for (const labelText of expandedLabels) {
        // Look EVERYWHERE for labels
        const allElements = Array.from(document.querySelectorAll('*'));
        
        // Find elements that might be labels
        const potentialLabels = allElements.filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          const hasMatch = text.includes(labelText.toLowerCase());
          const isReasonableLength = text.length < 50;
          const hasMinimalChildren = el.children.length <= 2; // Allow some formatting tags
          
          // Also check aria-label, title, placeholder
          const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || '';
          const title = el.getAttribute('title')?.toLowerCase() || '';
          const placeholder = el.getAttribute('placeholder')?.toLowerCase() || '';
          
          return (hasMatch && isReasonableLength && hasMinimalChildren) ||
                 ariaLabel.includes(labelText.toLowerCase()) ||
                 title.includes(labelText.toLowerCase()) ||
                 placeholder.includes(labelText.toLowerCase());
        });
        
        // Try each potential label
        for (const label of potentialLabels) {
          const value = this.findValueNearElement(label);
          if (value && value.length > 0) {
            console.log(`Found ${labelText}: ${value}`);
            return value;
          }
        }
      }
      return '';
    };
    
    // Also add proximity search for common patterns
    const findByProximity = (fieldName: string): string => {
      // Look for field name and value in close proximity
      const text = document.body.innerText;
      const patterns = [
        // "First Name: John" or "First Name John"
        new RegExp(`${fieldName}[:\\s]+([^\\n\\r]{1,50})`, 'i'),
        // "First Name\nJohn"
        new RegExp(`${fieldName}\\s*\\n\\s*([^\\n\\r]{1,50})`, 'i'),
        // With pipes: "First Name | John"
        new RegExp(`${fieldName}\\s*\\|\\s*([^\\|\\n\\r]{1,50})`, 'i'),
        // In parentheses: "First Name (John)"
        new RegExp(`${fieldName}\\s*\\(([^)]+)\\)`, 'i'),
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const value = match[1].trim();
          // Filter out common false positives
          if (value && !value.includes(':') && !value.toLowerCase().includes('name')) {
            return value;
          }
        }
      }
      return '';
    };
    
    
    // Massively expanded label sets for maximum compatibility
    return {
      firstName: getFieldByLabel([
        'first name', 'fname', 'given name', 'first', 'patient first',
        'pt first', 'first:', 'given:', 'forename', 'nombre', 
        'patient name', 'name', // Will extract first word
        'legal first', 'preferred name'
      ]) || findByProximity('first.?name'),
      
      lastName: getFieldByLabel([
        'last name', 'lname', 'surname', 'last', 'patient last',
        'pt last', 'last:', 'family name', 'family', 'apellido',
        'legal last', 'family:'
      ]) || findByProximity('last.?name'),
      
      dateOfBirth: this.normalizeDate(
        getFieldByLabel([
          'date of birth', 'dob', 'birth date', 'birthdate', 'born',
          'd.o.b', 'birth:', 'birthday', 'fecha de nacimiento',
          'patient dob', 'pt dob', 'born on', 'birth'
        ]) || findByProximity('(date.?of.?birth|dob|birth.?date)')
      ),
      
      gender: getFieldByLabel([
        'gender', 'sex', 'male/female', 'm/f', 'gender identity',
        'biological sex', 'legal sex', 'sex:', 'gender:', 'sexo',
        'assigned at birth'
      ]) || findByProximity('(gender|sex)'),
      
      addressLine1: getFieldByLabel([
        'address', 'street', 'address line 1', 'street address',
        'address 1', 'addr', 'home address', 'residential address',
        'mailing address', 'street:', 'direccion', 'patient address'
      ]) || findByProximity('address.?(line.?1|1)?'),
      
      addressLine2: getFieldByLabel([
        'address line 2', 'apt', 'suite', 'unit', 'apartment',
        'address 2', 'addr 2', 'apt/suite', 'apt #', 'unit #'
      ]),
      
      city: getFieldByLabel([
        'city', 'town', 'municipality', 'ciudad', 'city/town',
        'city:', 'residence city', 'mailing city'
      ]) || findByProximity('city'),
      
      state: getFieldByLabel([
        'state', 'province', 'st', 'estado', 'state/province',
        'state:', 'residence state'
      ]).toUpperCase().substring(0, 2) || findByProximity('state'),
      
      zipCode: getFieldByLabel([
        'zip', 'postal', 'zip code', 'postal code', 'zipcode',
        'zip:', 'codigo postal', 'mailing zip', 'residence zip'
      ]) || findByProximity('(zip|postal).?code'),
      
      phoneNumber: this.normalizePhone(
        getFieldByLabel([
          'phone', 'telephone', 'mobile', 'cell', 'contact',
          'phone number', 'tel', 'telefono', 'home phone',
          'cell phone', 'mobile phone', 'daytime phone',
          'primary phone', 'best phone', 'contact number'
        ]) || findByProximity('(phone|telephone|mobile|cell)')
      ),
      
      email: getFieldByLabel([
        'email', 'e-mail', 'electronic mail', 'correo', 'email address',
        'e-mail address', 'contact email', 'patient email'
      ]) || findByProximity('e.?mail'),
      
      mrn: getFieldByLabel([
        'mrn', 'medical record', 'chart', 'patient id', 'medical record number',
        'medical record #', 'chart number', 'chart #', 'patient number',
        'patient #', 'record #', 'mr#', 'account number', 'account #',
        'patient identifier', 'clinic number'
      ]) || findByProximity('(mrn|medical.?record|chart).?(number|#)?'),
      
      ssn: this.normalizeSSN(
        getFieldByLabel([
          'ssn', 'social security', 'social', 'ss#', 'social security number',
          'social security #', 'ss number', 'sin'
        ]) || findByProximity('(ssn|social.?security).?(number|#)?')
      )
    };
  }
  
  private parseByPatterns(): RadOrderPatient {
    const html = document.body.innerHTML;
    const text = document.body.textContent || '';
    
    // Pattern matching for common formats
    const extract = (patterns: RegExp[]): string => {
      for (const pattern of patterns) {
        const match = text.match(pattern) || html.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return '';
    };
    
    return {
      firstName: extract([
        /First\s*Name[:\s]*([A-Za-z]+)/i,
        /Patient[:\s]*([A-Za-z]+)\s+[A-Za-z]+/i,
        /Name[:\s]*([A-Za-z]+)\s+[A-Za-z]+/i
      ]),
      lastName: extract([
        /Last\s*Name[:\s]*([A-Za-z]+)/i,
        /Patient[:\s]*[A-Za-z]+\s+([A-Za-z]+)/i,
        /Name[:\s]*[A-Za-z]+\s+([A-Za-z]+)/i
      ]),
      dateOfBirth: this.normalizeDate(extract([
        /(?:DOB|Date\s*of\s*Birth)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /Born[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i
      ])),
      gender: extract([
        /Gender[:\s]*(Male|Female|M|F)/i,
        /Sex[:\s]*(Male|Female|M|F)/i
      ]),
      addressLine1: extract([
        /Address[:\s]*([^\n,]+)/i,
        /Street[:\s]*([^\n,]+)/i
      ]),
      city: extract([
        /City[:\s]*([A-Za-z\s]+)/i,
        /([A-Za-z\s]+),\s*[A-Z]{2}\s+\d{5}/
      ]),
      state: extract([
        /State[:\s]*([A-Z]{2})/i,
        /,\s*([A-Z]{2})\s+\d{5}/
      ]),
      zipCode: extract([
        /ZIP[:\s]*(\d{5})/i,
        /Postal[:\s]*(\d{5})/i,
        /\b(\d{5})(?:-\d{4})?\b/
      ]),
      phoneNumber: this.normalizePhone(extract([
        /Phone[:\s]*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/i,
        /\(\d{3}\)\s*\d{3}-\d{4}/
      ])),
      email: extract([
        /Email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
      ]),
      mrn: extract([
        /MRN[:\s]*([A-Z0-9-]+)/i,
        /Medical\s*Record[:\s]*([A-Z0-9-]+)/i
      ]),
      ssn: this.normalizeSSN(extract([
        /SSN[:\s]*(\d{3}-?\d{2}-?\d{4})/i,
        /Social[:\s]*(\d{3}-?\d{2}-?\d{4})/i
      ]))
    };
  }
  
  private parseByTableStructure(): RadOrderPatient {
    // Look for tables with patient info
    const tables = document.querySelectorAll('table');
    const result: any = {};
    
    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
          const label = cells[0].textContent?.toLowerCase() || '';
          const value = cells[1].textContent?.trim() || '';
          
          if (label.includes('first name')) result.firstName = value;
          else if (label.includes('last name')) result.lastName = value;
          else if (label.includes('date of birth') || label.includes('dob')) {
            result.dateOfBirth = this.normalizeDate(value);
          }
          else if (label.includes('gender') || label.includes('sex')) result.gender = value;
          else if (label.includes('address') && !label.includes('2')) result.addressLine1 = value;
          else if (label.includes('city')) result.city = value;
          else if (label.includes('state')) result.state = value.toUpperCase().substring(0, 2);
          else if (label.includes('zip')) result.zipCode = value;
          else if (label.includes('phone')) result.phoneNumber = this.normalizePhone(value);
          else if (label.includes('email')) result.email = value;
          else if (label.includes('mrn') || label.includes('medical record')) result.mrn = value;
          else if (label.includes('ssn') || label.includes('social')) result.ssn = this.normalizeSSN(value);
        }
      });
    });
    
    return result as RadOrderPatient;
  }
  
  private parseByDivStructure(): RadOrderPatient {
    // Look for div-based layouts
    const result: any = {};
    
    // Common class/id patterns
    const selectors = {
      firstName: ['[class*="first-name"]', '[id*="firstName"]', '[name*="first"]'],
      lastName: ['[class*="last-name"]', '[id*="lastName"]', '[name*="last"]'],
      dateOfBirth: ['[class*="dob"]', '[class*="birth"]', '[id*="dateOfBirth"]'],
      gender: ['[class*="gender"]', '[class*="sex"]', '[id*="gender"]'],
      address: ['[class*="address"]', '[class*="street"]', '[id*="address1"]'],
      city: ['[class*="city"]', '[id*="city"]'],
      state: ['[class*="state"]', '[id*="state"]'],
      zipCode: ['[class*="zip"]', '[class*="postal"]', '[id*="zip"]'],
      phone: ['[class*="phone"]', '[class*="tel"]', '[id*="phone"]'],
      email: ['[class*="email"]', '[id*="email"]'],
      mrn: ['[class*="mrn"]', '[class*="medical-record"]', '[id*="mrn"]'],
      ssn: ['[class*="ssn"]', '[class*="social"]', '[id*="ssn"]']
    };
    
    for (const [field, patterns] of Object.entries(selectors)) {
      for (const selector of patterns) {
        const element = document.querySelector(selector);
        if (element) {
          const value = (element as HTMLInputElement).value || element.textContent?.trim() || '';
          if (value) {
            result[field] = value;
            break;
          }
        }
      }
    }
    
    // Post-process
    if (result.dateOfBirth) result.dateOfBirth = this.normalizeDate(result.dateOfBirth);
    if (result.state) result.state = result.state.toUpperCase().substring(0, 2);
    if (result.phone) result.phoneNumber = this.normalizePhone(result.phone);
    if (result.ssn) result.ssn = this.normalizeSSN(result.ssn);
    if (result.address) result.addressLine1 = result.address;
    
    return result as RadOrderPatient;
  }
  
  parseInsuranceData(): RadOrderInsurance {
    // Similar multi-strategy approach for insurance
    const hasInsurance = this.checkHasInsurance();
    
    if (!hasInsurance) {
      return { hasInsurance: false };
    }
    
    const primary = this.parsePrimaryInsurance();
    const secondary = this.parseSecondaryInsurance();
    
    return {
      hasInsurance: true,
      primary,
      secondary: secondary.company ? secondary : undefined
    };
  }
  
  private checkHasInsurance(): boolean {
    // Look for insurance indicators
    const indicators = [
      () => document.querySelector('[type="checkbox"][checked]')?.nextSibling?.textContent?.toLowerCase().includes('insurance'),
      () => /has insurance[\s:]*(?:yes|✓|x|\[x\])/i.test(document.body.textContent || ''),
      () => !!document.querySelector('[class*="insurance-info"]'),
      () => !!this.getValueByLabel(['insurance company', 'carrier', 'payer'])
    ];
    
    return indicators.some(check => {
      try { return check(); } catch { return false; }
    });
  }
  
  private parsePrimaryInsurance(): any {
    return {
      company: this.getValueByLabel(['insurance company', 'carrier', 'primary insurance', 'payer']),
      planName: this.getValueByLabel(['plan name', 'plan', 'coverage']),
      policyNumber: this.getValueByLabel(['policy number', 'member id', 'subscriber id']),
      groupNumber: this.getValueByLabel(['group number', 'group', 'employer group']),
      policyHolderName: this.getValueByLabel(['policy holder', 'subscriber', 'insured name']),
      relationshipToPatient: this.getValueByLabel(['relationship', 'relation to patient', 'self/spouse/child']) || 'Self',
      policyHolderDOB: this.normalizeDate(this.getValueByLabel(['policy holder dob', 'subscriber dob']))
    };
  }
  
  private parseSecondaryInsurance(): any {
    return {
      company: this.getValueByLabel(['secondary insurance', 'secondary carrier']),
      policyNumber: this.getValueByLabel(['secondary policy', 'secondary member id'])
    };
  }
  
  private getValueByLabel(labels: string[]): string {
    // Reusable label-based value extraction
    for (const label of labels) {
      const elements = Array.from(document.querySelectorAll('*'));
      const labelEl = elements.find(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes(label) && text.length < 50 && el.children.length === 0;
      });
      
      if (labelEl) {
        // Try various relationships to find the value
        const value = this.findValueNearLabel(labelEl);
        if (value) return value;
      }
    }
    return '';
  }
  
  private findValueNearElement(element: Element): string {
    // Comprehensive value extraction - handles ANY layout
    const strategies = [
      // Strategy 1: Input fields within the element
      () => {
        const input = element.querySelector('input, select, textarea');
        return input ? (input as HTMLInputElement).value : '';
      },
      
      // Strategy 2: Next sibling (any type)
      () => {
        let next = element.nextSibling;
        while (next && next.nodeType === Node.TEXT_NODE && !next.textContent?.trim()) {
          next = next.nextSibling;
        }
        if (next) {
          if (next.nodeType === Node.TEXT_NODE) {
            return next.textContent?.trim() || '';
          } else if (next.nodeType === Node.ELEMENT_NODE) {
            const el = next as Element;
            if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
              return (el as HTMLInputElement).value;
            }
            return el.textContent?.trim() || '';
          }
        }
        return '';
      },
      
      // Strategy 3: Parent container method
      () => {
        const parent = element.parentElement;
        if (parent) {
          // Look for value-like elements in parent
          const valueEl = parent.querySelector('.value, .field-value, [class*="value"], [id*="value"]');
          if (valueEl) return valueEl.textContent?.trim() || '';
          
          // Check if parent has exactly 2 children (label + value)
          if (parent.children.length === 2) {
            const otherChild = Array.from(parent.children).find(child => child !== element);
            if (otherChild) return otherChild.textContent?.trim() || '';
          }
        }
        return '';
      },
      
      // Strategy 4: Following DIV/SPAN method
      () => {
        let current = element.nextElementSibling;
        let depth = 0;
        while (current && depth < 3) {
          const text = current.textContent?.trim();
          if (text && text.length > 0 && text.length < 100) {
            // Check if it looks like a value (not another label)
            const looksLikeLabel = /^(first|last|name|date|birth|gender|address|phone|email|mrn|ssn)/i.test(text);
            if (!looksLikeLabel) {
              return text;
            }
          }
          current = current.nextElementSibling;
          depth++;
        }
        return '';
      },
      
      // Strategy 5: Table relationships
      () => {
        const td = element.closest('td, th');
        if (td) {
          // Check next cell in row
          const nextCell = td.nextElementSibling;
          if (nextCell) return nextCell.textContent?.trim() || '';
          
          // Check corresponding cell in next row
          const row = td.parentElement;
          const cellIndex = Array.from(row?.children || []).indexOf(td);
          const nextRow = row?.nextElementSibling;
          if (nextRow && nextRow.children[cellIndex]) {
            return nextRow.children[cellIndex].textContent?.trim() || '';
          }
        }
        return '';
      },
      
      // Strategy 6: Data attributes
      () => {
        // Check if element has data attributes with values
        const attrs = element.attributes;
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i];
          if (attr.name.startsWith('data-') && attr.value) {
            // Check if the value looks like patient data
            if (/^[A-Za-z\s-]{2,50}$/.test(attr.value) || // Names
                /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(attr.value) || // Dates
                /^\(\d{3}\)\s*\d{3}-\d{4}$/.test(attr.value)) { // Phones
              return attr.value;
            }
          }
        }
        return '';
      },
      
      // Strategy 7: Following text nodes
      () => {
        const walker = document.createTreeWalker(
          element.parentElement || document.body,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        // Find our element's position
        let node;
        while (node = walker.nextNode()) {
          if (node.previousSibling === element || node.parentElement === element) {
            const text = node.textContent?.trim();
            if (text && text.length > 0 && text.length < 100) {
              return text;
            }
          }
        }
        return '';
      }
    ];
    
    // Try each strategy
    for (const strategy of strategies) {
      try {
        const value = strategy();
        if (value && value.trim()) {
          return value.trim();
        }
      } catch (e) {
        continue;
      }
    }
    
    return '';
  }
  
  // Normalization functions
  private normalizeDate(dateStr: string): string {
    if (!dateStr) return '';
    
    // Try to parse various formats and convert to MM/DD/YYYY
    const patterns = [
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/, // MM/DD/YYYY or MM-DD-YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,       // YYYY-MM-DD
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/  // MM/DD/YY
    ];
    
    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        let month, day, year;
        
        if (match[1].length === 4) {
          // YYYY-MM-DD format
          year = match[1];
          month = match[2];
          day = match[3];
        } else {
          month = match[1];
          day = match[2];
          year = match[3];
          
          // Handle 2-digit year
          if (year.length === 2) {
            year = parseInt(year) > 50 ? '19' + year : '20' + year;
          }
        }
        
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
      }
    }
    
    return dateStr; // Return as-is if can't parse
  }
  
  private normalizePhone(phone: string): string {
    if (!phone) return '';
    
    // Extract just digits
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    
    return phone; // Return as-is if can't normalize
  }
  
  private normalizeSSN(ssn: string): string {
    if (!ssn) return '';
    
    const digits = ssn.replace(/\D/g, '');
    
    if (digits.length === 9) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    
    return ssn;
  }
}

// RadOrderPad form filler
class RadOrderPadFiller {
  async fillPatientData(data: RadOrderPatient): Promise<void> {
    console.log('Filling RadOrderPad patient form...', data);
    
    // Check if we're on RadOrderPad
    if (!window.location.hostname.includes('radorderpad.com') && !window.location.hostname.includes('localhost')) {
      throw new Error('Not on RadOrderPad website');
    }
    
    // Fill patient demographics
    await this.fillField('input[placeholder="First Name"]', data.firstName);
    await this.fillField('input[placeholder="Last Name"]', data.lastName);
    await this.fillField('input[placeholder="MM/DD/YYYY"]', data.dateOfBirth);
    
    // Gender might be a dropdown
    if (data.gender) {
      await this.selectDropdown('select', data.gender);
    }
    
    // Address fields
    await this.fillField('input[placeholder="Address Line 1"]', data.addressLine1);
    if (data.addressLine2) {
      await this.fillField('input[placeholder="Address Line 2"]', data.addressLine2);
    }
    await this.fillField('input[placeholder="City"]', data.city);
    await this.fillField('input[placeholder="State"]', data.state);
    await this.fillField('input[placeholder="ZIP Code"]', data.zipCode);
    
    // Contact info
    await this.fillField('input[placeholder="(XXX) XXX-XXXX"]', data.phoneNumber);
    if (data.email) {
      await this.fillField('input[placeholder="Email"]', data.email);
    }
    
    // Medical identifiers
    if (data.mrn) {
      await this.fillField('input[placeholder="Medical Record Number"]', data.mrn);
    }
    if (data.ssn) {
      await this.fillField('input[placeholder="XXX-XX-XXXX"]', data.ssn);
    }
  }
  
  async fillInsuranceData(data: RadOrderInsurance): Promise<void> {
    console.log('Filling RadOrderPad insurance form...', data);
    
    // First, check the "Patient has insurance" checkbox if needed
    if (data.hasInsurance) {
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) {
        (checkbox as HTMLInputElement).click();
        await this.wait(500); // Wait for form to update
      }
    }
    
    if (data.primary) {
      // Primary insurance fields
      await this.fillField('input[placeholder="Insurance Company"]', data.primary.company);
      if (data.primary.planName) {
        await this.fillField('input[placeholder="Plan Name"]', data.primary.planName);
      }
      await this.fillField('input[placeholder="Policy Number"]', data.primary.policyNumber);
      if (data.primary.groupNumber) {
        await this.fillField('input[placeholder="Group Number"]', data.primary.groupNumber);
      }
      await this.fillField('input[placeholder="Policy Holder Name"]', data.primary.policyHolderName);
      
      // Relationship dropdown
      await this.selectDropdown('select', data.primary.relationshipToPatient);
      
      if (data.primary.policyHolderDOB) {
        await this.fillField('input[placeholder="mm/dd/yyyy"]', data.primary.policyHolderDOB);
      }
    }
  }
  
  private async fillField(selector: string, value: string): Promise<void> {
    if (!value) return;
    
    const input = document.querySelector(selector) as HTMLInputElement;
    if (!input) {
      console.warn(`Field not found: ${selector}`);
      return;
    }
    
    // Clear existing value
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Type new value character by character for better compatibility
    for (const char of value) {
      input.value += char;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await this.wait(10);
    }
    
    // Trigger change and blur
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  
  private async selectDropdown(selector: string, value: string): Promise<void> {
    const selects = document.querySelectorAll(selector);
    
    for (const select of selects) {
      const options = Array.from((select as HTMLSelectElement).options);
      const option = options.find(opt => 
        opt.value.toLowerCase() === value.toLowerCase() ||
        opt.text.toLowerCase() === value.toLowerCase()
      );
      
      if (option) {
        (select as HTMLSelectElement).value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
    }
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main controller
class RadOrderPadImporter {
  private parser: UniversalEMRParser;
  private filler: RadOrderPadFiller;
  private capturedData: RadOrderImportData | null = null;
  
  constructor() {
    this.parser = new UniversalEMRParser();
    this.filler = new RadOrderPadFiller();
    this.setupMessageHandlers();
  }
  
  private setupMessageHandlers(): void {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request).then(sendResponse).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    });
  }
  
  private async handleMessage(request: any): Promise<any> {
    switch (request.action) {
      case 'capture':
        return this.captureFromEMR();
        
      case 'fill':
        return this.fillRadOrderPad(request.data);
        
      case 'detect':
        return this.detectCurrentPage();
        
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }
  }
  
  private detectCurrentPage(): any {
    const isRadOrderPad = window.location.hostname.includes('radorderpad.com') || 
                         window.location.hostname.includes('localhost');
    const emrName = this.parser.detectEMR();
    
    return {
      isRadOrderPad,
      isEMR: !isRadOrderPad && emrName !== 'Unknown EMR',
      emrName,
      canCapture: !isRadOrderPad,
      canFill: isRadOrderPad
    };
  }
  
  private async captureFromEMR(): Promise<RadOrderImportData> {
    const emrName = this.parser.detectEMR();
    console.log(`Capturing from ${emrName}`);
    
    const patient = this.parser.parsePatientData();
    if (!patient) {
      throw new Error('Could not parse patient data from this page');
    }
    
    const insurance = this.parser.parseInsuranceData();
    
    this.capturedData = {
      patient,
      insurance,
      sourceEMR: emrName,
      capturedAt: new Date().toISOString()
    };
    
    // Store in extension storage
    await chrome.storage.local.set({ capturedData: this.capturedData });
    
    return this.capturedData;
  }
  
  private async fillRadOrderPad(data?: RadOrderImportData): Promise<void> {
    // Use provided data or get from storage
    if (!data) {
      const stored = await chrome.storage.local.get('capturedData');
      data = stored.capturedData;
    }
    
    if (!data) {
      throw new Error('No data to fill');
    }
    
    // Fill patient form
    await this.filler.fillPatientData(data.patient);
    
    // Check if we need to navigate to insurance page
    const continueButton = document.querySelector('button:contains("Continue to Insurance")');
    if (continueButton) {
      console.log('Patient data filled. Click "Continue to Insurance" to fill insurance data.');
      // Could auto-click if desired
      // continueButton.click();
    } else {
      // Try to fill insurance if on same page or already on insurance page
      await this.filler.fillInsuranceData(data.insurance);
    }
  }
}

// Initialize
const importer = new RadOrderPadImporter();

// Auto-fill if we navigated to RadOrderPad with pending data
if (window.location.hostname.includes('radorderpad.com') || window.location.hostname.includes('localhost')) {
  chrome.storage.local.get('capturedData', (result) => {
    if (result.capturedData) {
      // Check if data is recent (less than 5 minutes old)
      const capturedAt = new Date(result.capturedData.capturedAt);
      const now = new Date();
      const diffMinutes = (now.getTime() - capturedAt.getTime()) / 60000;
      
      if (diffMinutes < 5) {
        console.log('Found recent captured data, auto-filling...');
        importer.fillRadOrderPad(result.capturedData);
      }
    }
  });
}

// Export for popup
export { RadOrderPadImporter, UniversalEMRParser, RadOrderPadFiller };