# RadOrderPad EMR Integration Chrome Extension
## Complete Technical Specification

### Executive Summary
Build a Chrome extension that captures patient demographics and insurance information from any EMR's patient summary page and automatically fills it into RadOrderPad's order completion forms, eliminating manual data entry for referring staff.

### Project Overview

#### Problem Statement
- Physicians create imaging orders in RadOrderPad CDS platform
- Referring staff must complete patient demographics before sending to radiology
- Staff currently manually copy/paste from EMR to RadOrderPad
- This is time-consuming and error-prone

#### Solution
- Chrome extension that runs on EMR patient summary pages
- One-click capture of patient data
- Automatic form filling in RadOrderPad
- Works with any EMR (Epic, Cerner, Athena, etc.)

### Technical Architecture

#### Core Components

1. **Chrome Extension Structure**
   ```
   radorderpad-extension/
   ├── manifest.json          # Extension configuration
   ├── background.js          # Service worker
   ├── content.js            # Runs on web pages
   ├── popup.html            # Extension popup UI
   ├── popup.js              # Popup logic
   ├── styles.css            # Popup styles
   ├── icons/                # Extension icons
   │   ├── icon-16.png
   │   ├── icon-48.png
   │   └── icon-128.png
   └── lib/                  # Shared libraries
       ├── parser.js         # EMR parsing logic
       ├── filler.js         # Form filling logic
       └── storage.js        # Data persistence
   ```

2. **Data Flow**
   ```
   EMR Page → Parser → Storage → RadOrderPad → Filler
   ```

### Data Models

```typescript
interface PatientData {
  // Demographics
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;  // Format: MM/DD/YYYY
  gender?: 'Male' | 'Female' | 'Other';
  
  // Contact
  phoneNumber: string;  // Format: (XXX) XXX-XXXX
  email?: string;
  
  // Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;       // 2-letter code
  zipCode: string;     // XXXXX or XXXXX-XXXX
  
  // Identifiers
  mrn?: string;        // Medical Record Number
  ssn?: string;        // Format: XXX-XX-XXXX
}

interface InsuranceData {
  hasInsurance: boolean;
  primary?: {
    company: string;
    planName?: string;
    policyNumber: string;
    groupNumber?: string;
    policyHolderName: string;
    relationshipToPatient: 'Self' | 'Spouse' | 'Child' | 'Other';
    policyHolderDOB?: string;
  };
  secondary?: {
    company?: string;
    policyNumber?: string;
  };
}

interface CaptureData {
  patient: PatientData;
  insurance: InsuranceData;
  metadata: {
    sourceEMR: string;
    capturedAt: string;  // ISO timestamp
    capturedBy?: string; // User identifier
    pageUrl: string;
  };
}
```

### Implementation Details

#### 1. Manifest Configuration (manifest.json)
```json
{
  "manifest_version": 3,
  "name": "RadOrderPad Patient Importer",
  "version": "1.0.0",
  "description": "Import patient data from EMR to RadOrderPad",
  "permissions": [
    "activeTab",
    "storage",
    "clipboardWrite"
  ],
  "host_permissions": [
    "https://*.radorderpad.com/*",
    "http://localhost:3000/*",
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["lib/parser.js", "lib/filler.js", "content.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

#### 2. EMR Detection Strategy
```javascript
// List of known EMR patterns
const EMR_PATTERNS = {
  'Epic MyChart': {
    urlPatterns: ['mychart', 'epic'],
    domSelectors: ['.MyChartLogo', '[class*="epic"]'],
    title: ['MyChart', 'Epic']
  },
  'Cerner PowerChart': {
    urlPatterns: ['cerner', 'powerchart'],
    domSelectors: ['[id*="cerner"]', '.cerner-logo'],
    title: ['Cerner', 'PowerChart']
  },
  'Athena': {
    urlPatterns: ['athenahealth', 'athenanet'],
    domSelectors: ['[class*="athena"]'],
    title: ['athena']
  },
  // Add more EMRs...
};
```

#### 3. Parsing Algorithm (Multi-Strategy)

**Strategy 1: Label-Value Proximity**
- Find text that looks like labels
- Extract values near those labels
- Handle various HTML structures

**Strategy 2: Pattern Matching**
- Regex patterns for common formats
- Phone: (XXX) XXX-XXXX
- SSN: XXX-XX-XXXX
- DOB: MM/DD/YYYY

**Strategy 3: Table Parsing**
- Detect table structures
- Map headers to values
- Handle nested tables

**Strategy 4: Semantic HTML**
- Check for aria-labels
- Look for data attributes
- Use form field names

#### 4. Form Filling Logic

```javascript
// RadOrderPad form structure
const FORM_SELECTORS = {
  // Patient Demographics Page
  patient: {
    firstName: 'input[placeholder="First Name"]',
    lastName: 'input[placeholder="Last Name"]',
    dateOfBirth: 'input[placeholder="MM/DD/YYYY"]',
    gender: 'select#gender',
    addressLine1: 'input[placeholder="Address Line 1"]',
    addressLine2: 'input[placeholder="Address Line 2"]',
    city: 'input[placeholder="City"]',
    state: 'input[placeholder="State"]',
    zipCode: 'input[placeholder="ZIP Code"]',
    phoneNumber: 'input[placeholder="(XXX) XXX-XXXX"]',
    email: 'input[placeholder="Email"]',
    mrn: 'input[placeholder="Medical Record Number"]',
    ssn: 'input[placeholder="XXX-XX-XXXX"]'
  },
  
  // Insurance Information Page
  insurance: {
    hasInsurance: 'input[type="checkbox"]#hasInsurance',
    company: 'input[placeholder="Insurance Company"]',
    planName: 'input[placeholder="Plan Name"]',
    policyNumber: 'input[placeholder="Policy Number"]',
    groupNumber: 'input[placeholder="Group Number"]',
    policyHolderName: 'input[placeholder="Policy Holder Name"]',
    relationship: 'select#relationship',
    policyHolderDOB: 'input[placeholder="mm/dd/yyyy"]'
  }
};
```

### User Interface

#### Extension Popup (popup.html)
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="popup-container">
    <header>
      <img src="icons/icon-48.png" alt="RadOrderPad">
      <h1>RadOrderPad Importer</h1>
    </header>
    
    <div id="status" class="status"></div>
    
    <div class="actions">
      <button id="captureBtn" class="btn-primary">
        Capture Patient Data
      </button>
      
      <button id="fillBtn" class="btn-secondary" disabled>
        Fill RadOrderPad
      </button>
    </div>
    
    <div id="capturedData" class="data-preview hidden">
      <h3>Captured Data:</h3>
      <div id="dataContent"></div>
    </div>
    
    <footer>
      <a href="#" id="helpLink">Help</a>
      <a href="#" id="settingsLink">Settings</a>
    </footer>
  </div>
  
  <script src="popup.js"></script>
</body>
</html>
```

#### Popup Styles (styles.css)
```css
.popup-container {
  width: 350px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

header img {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

h1 {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.status {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 8px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.data-preview {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
}

.hidden {
  display: none;
}
```

### Security Considerations

1. **Data Handling**
   - No patient data stored permanently
   - Data encrypted in transit
   - Auto-expire captured data after 5 minutes
   - Clear data on browser close

2. **Permissions**
   - Request minimal permissions
   - Use activeTab instead of all tabs
   - No external server communication (initially)

3. **HIPAA Compliance**
   - No logging of patient data
   - Secure memory handling
   - User authentication (future)

### Testing Strategy

#### Unit Tests
```javascript
// Test parsing functions
describe('EMR Parser', () => {
  test('parses Epic patient summary', () => {
    const html = loadFixture('epic-patient-summary.html');
    const result = parser.parse(html);
    expect(result.patient.firstName).toBe('John');
    expect(result.patient.lastName).toBe('Smith');
  });
  
  test('normalizes phone numbers', () => {
    expect(normalizePhone('555-1234')).toBe('(555) 123-4567');
    expect(normalizePhone('(555) 123-4567')).toBe('(555) 123-4567');
    expect(normalizePhone('5551234567')).toBe('(555) 123-4567');
  });
});
```

#### Integration Tests
- Test with real EMR HTML samples
- Test form filling on RadOrderPad staging
- Test error handling and edge cases

#### Manual Testing Checklist
- [ ] Install extension in Chrome
- [ ] Navigate to EMR patient summary
- [ ] Click extension icon
- [ ] Verify "Capture" button is enabled
- [ ] Click "Capture"
- [ ] Verify data preview shows correctly
- [ ] Navigate to RadOrderPad
- [ ] Click "Fill RadOrderPad"
- [ ] Verify all fields filled correctly
- [ ] Test with missing data
- [ ] Test with malformed data

### Deployment Plan

#### Phase 1: MVP (Week 1-2)
- Basic parser for top 3 EMRs
- Direct form filling for RadOrderPad
- Manual trigger (click button)
- Single clinic pilot

#### Phase 2: Enhancement (Week 3-4)
- Support 10+ EMRs
- Auto-detection improvements
- Error handling and retry logic
- Settings page

#### Phase 3: Scale (Month 2)
- API integration option
- Audit logging
- Multi-clinic deployment
- Performance optimization

### Chrome Web Store Submission

#### Required Assets
1. **Screenshots** (1280x800)
   - EMR capture in action
   - RadOrderPad filling
   - Success confirmation

2. **Store Listing**
   ```
   Title: RadOrderPad Patient Importer
   
   Short Description:
   Import patient data from any EMR directly into RadOrderPad 
   imaging orders with one click.
   
   Detailed Description:
   Streamline your imaging workflow! This extension eliminates 
   manual data entry by automatically capturing patient 
   demographics and insurance information from your EMR and 
   filling it into RadOrderPad order forms.
   
   Features:
   • Works with Epic, Cerner, Athena, and more
   • One-click patient data capture
   • Automatic form filling
   • Secure - no data stored permanently
   • Saves 5+ minutes per order
   ```

3. **Privacy Policy**
   - No data collection
   - No external servers
   - HIPAA compliant practices

### Development Setup

#### Prerequisites
- Node.js 18+
- Chrome 100+
- Git

#### Local Development
```bash
# Clone repository
git clone https://github.com/radorderpad/emr-extension

# Install dependencies
npm install

# Build extension
npm run build

# Load in Chrome
1. Open chrome://extensions
2. Enable Developer mode
3. Click "Load unpacked"
4. Select build folder

# Watch for changes
npm run watch
```

#### Build Commands
```json
{
  "scripts": {
    "build": "webpack --mode production",
    "watch": "webpack --mode development --watch",
    "test": "jest",
    "lint": "eslint src/**/*.js"
  }
}
```

### Support & Maintenance

#### Error Tracking
```javascript
// Send anonymous error reports
window.addEventListener('error', (event) => {
  // Log error without patient data
  console.error('Parser error:', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    emr: detectEMR(),
    version: chrome.runtime.getManifest().version
  });
});
```

#### Update Strategy
- Monthly EMR pattern updates
- User-reported issue fixes
- Chrome API compatibility
- Security patches

### Future Enhancements

1. **Machine Learning**
   - Learn from user corrections
   - Improve accuracy over time
   - Handle new EMR layouts automatically

2. **API Integration**
   ```javascript
   // Future API endpoint
   POST https://api.radorderpad.com/v1/patients/import
   {
     "patient": { ... },
     "insurance": { ... },
     "orderId": "12345"
   }
   ```

3. **Bi-directional Flow**
   - Send results back to EMR
   - Update order status
   - Create follow-up tasks

### Success Metrics

- **Adoption**: 80% of staff using within 30 days
- **Time Saved**: 5+ minutes per order
- **Accuracy**: 95%+ field capture rate (Epic: 100% success rate)
- **Errors**: <1% failed captures

### Contact & Resources

- **Technical Lead**: [Your Name]
- **Repository**: github.com/radorderpad/emr-extension
- **Documentation**: docs.radorderpad.com/emr-extension
- **Support**: support@radorderpad.com

---

## Appendix: Code Samples

### Complete Parser Implementation
[See attached parser.js for full implementation]

### Complete Filler Implementation
[See attached filler.js for full implementation]

### Test Data Sets
[See test-data/ folder for EMR HTML samples]