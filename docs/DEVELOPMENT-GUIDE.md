# Development Guide

This guide covers core module implementation for the RadOrderPad EMR Extension.

## Overview

The extension consists of:
- **Parser Module**: Extracts patient data from EMRs
- **Storage Module**: Secure encrypted storage
- **Filler Module**: Fills RadOrderPad forms
- **Chrome Extension Components**: Background, content, and popup scripts

## Module Implementation

### 1. Parser Module

The parser uses multiple strategies to extract data from various EMR layouts.

#### 1.1 Create Base Parser

Create `src/lib/parser.ts`:

```typescript
import { PatientData } from '../types';
import { SecureDataHandler } from '../security/encryption';
import { AuditLogger } from '../security/audit';

export class UniversalEMRParser {
  private emrName: string = 'Unknown EMR';
  
  detectEMR(): string {
    const indicators = {
      'Epic MyChart': [
        () => document.querySelector('.MyChartLogo'),
        () => window.location.hostname.includes('mychart')
      ],
      'Cerner PowerChart': [
        () => document.querySelector('[id*="cerner"]'),
        () => window.location.hostname.includes('cerner')
      ],
      'Athena': [
        () => window.location.hostname.includes('athenahealth')
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
  
  parsePatientData(): PatientData | null {
    try {
      const strategies = [
        () => this.parseByLabels(),
        () => this.parseByPatterns(),
        () => this.parseByTableStructure()
      ];
      
      for (const strategy of strategies) {
        const result = strategy();
        if (result && this.validateData(result)) {
          AuditLogger.log({
            eventType: 'CAPTURE',
            action: 'PARSE_SUCCESS',
            resourceType: 'PHI',
            success: true
          });
          return result;
        }
      }
      
      return null;
    } catch (error) {
      AuditLogger.log({
        eventType: 'ERROR',
        action: 'PARSE_FAILED',
        resourceType: 'PHI',
        success: false
      });
      return null;
    }
  }
  
  private validateData(data: any): boolean {
    return !!(data.firstName && data.lastName && data.dateOfBirth);
  }
  
  // Implementation continues in actual file...
}
```

#### 1.2 Create Data Normalizer

Create `src/lib/normalizer.ts`:

```typescript
export class DataNormalizer {
  static normalizeDate(dateStr: string): string {
    if (!dateStr) return '';
    
    // Convert various formats to MM/DD/YYYY
    const patterns = [
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    ];
    
    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        // Handle different formats...
        return `${month}/${day}/${year}`;
      }
    }
    
    return dateStr;
  }
  
  static normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    return phone;
  }
  
  static normalizeSSN(ssn: string): string {
    const digits = ssn.replace(/\D/g, '');
    if (digits.length === 9) {
      return `${digits.slice(0,3)}-${digits.slice(3,5)}-${digits.slice(5)}`;
    }
    return ssn;
  }
}
```

### 2. Storage Module

Secure storage with automatic expiration.

Create `src/lib/storage.ts`:

```typescript
import { SecureDataHandler } from '../security/encryption';
import { AuditLogger } from '../security/audit';
import { CaptureData } from '../types';

export class SecureStorage {
  private static readonly STORAGE_KEY = 'radorderpad_data';
  private static readonly EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes
  
  static async saveData(data: CaptureData): Promise<void> {
    const encrypted = SecureDataHandler.encrypt({
      data,
      expiration: Date.now() + this.EXPIRATION_TIME
    });
    
    await chrome.storage.local.set({
      [this.STORAGE_KEY]: encrypted
    });
    
    // Set auto-cleanup
    setTimeout(() => this.clearData(), this.EXPIRATION_TIME);
    
    AuditLogger.log({
      eventType: 'CAPTURE',
      action: 'STORE_DATA',
      resourceType: 'PHI',
      success: true
    });
  }
  
  static async getData(): Promise<CaptureData | null> {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    if (!result[this.STORAGE_KEY]) return null;
    
    const decrypted = SecureDataHandler.decrypt(result[this.STORAGE_KEY]);
    
    // Check expiration
    if (Date.now() > decrypted.expiration) {
      await this.clearData();
      return null;
    }
    
    return decrypted.data;
  }
  
  static async clearData(): Promise<void> {
    await chrome.storage.local.remove(this.STORAGE_KEY);
    
    AuditLogger.log({
      eventType: 'ACCESS',
      action: 'CLEAR_DATA',
      resourceType: 'PHI',
      success: true
    });
  }
}
```

### 3. Form Filler Module

Fills RadOrderPad forms with captured data.

Create `src/lib/filler.ts`:

```typescript
import { PatientData, InsuranceData } from '../types';
import { AuditLogger } from '../security/audit';

export class RadOrderPadFiller {
  async fillPatientData(data: PatientData): Promise<void> {
    try {
      await this.fillField('[placeholder="First Name"]', data.firstName);
      await this.fillField('[placeholder="Last Name"]', data.lastName);
      await this.fillField('[placeholder="MM/DD/YYYY"]', data.dateOfBirth);
      // Continue for all fields...
      
      AuditLogger.log({
        eventType: 'FILL',
        action: 'FILL_PATIENT',
        resourceType: 'PHI',
        success: true
      });
    } catch (error) {
      AuditLogger.log({
        eventType: 'ERROR',
        action: 'FILL_FAILED',
        resourceType: 'PHI',
        success: false
      });
      throw error;
    }
  }
  
  private async fillField(selector: string, value: string): Promise<void> {
    if (!value) return;
    
    const input = document.querySelector(selector) as HTMLInputElement;
    if (!input) {
      console.warn(`Field not found: ${selector}`);
      return;
    }
    
    // Simulate user input
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    for (const char of value) {
      input.value += char;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await this.wait(10);
    }
    
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Chrome Extension Components

### 4. Content Script

Runs on web pages and handles data capture.

Create `src/content/content.ts`:

```typescript
import { UniversalEMRParser } from '../lib/parser';
import { RadOrderPadFiller } from '../lib/filler';
import { SecureStorage } from '../lib/storage';

class ContentScript {
  private parser = new UniversalEMRParser();
  private filler = new RadOrderPadFiller();
  
  constructor() {
    this.setupMessageListener();
    this.checkAutoFill();
  }
  
  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request)
        .then(sendResponse)
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
    });
  }
  
  private async handleMessage(request: any): Promise<any> {
    switch (request.action) {
      case 'capture':
        return this.captureData();
      case 'fill':
        return this.fillData();
      case 'detect':
        return this.detectPage();
      default:
        throw new Error('Unknown action');
    }
  }
  
  private async captureData(): Promise<any> {
    const emr = this.parser.detectEMR();
    const patientData = this.parser.parsePatientData();
    
    if (!patientData) {
      throw new Error('Could not parse patient data');
    }
    
    const captureData = {
      patient: patientData,
      insurance: { hasInsurance: false }, // Simplified
      metadata: {
        sourceEMR: emr,
        capturedAt: new Date().toISOString(),
        pageUrl: window.location.href
      }
    };
    
    await SecureStorage.saveData(captureData);
    return { success: true, data: captureData };
  }
  
  private async fillData(): Promise<any> {
    const data = await SecureStorage.getData();
    if (!data) {
      throw new Error('No data to fill');
    }
    
    await this.filler.fillPatientData(data.patient);
    return { success: true };
  }
  
  private detectPage(): any {
    const isRadOrderPad = window.location.hostname.includes('radorderpad.com');
    const emr = this.parser.detectEMR();
    
    return {
      isRadOrderPad,
      isEMR: !isRadOrderPad && emr !== 'Unknown EMR',
      emrName: emr
    };
  }
  
  private async checkAutoFill(): Promise<void> {
    // Auto-fill if we're on RadOrderPad with recent data
    if (window.location.hostname.includes('radorderpad.com')) {
      const data = await SecureStorage.getData();
      if (data) {
        await this.fillData();
      }
    }
  }
}

// Initialize
new ContentScript();
```

### 5. Background Service Worker

Handles extension lifecycle and messaging.

Create `src/background/background.ts`:

```typescript
import { AuditLogger } from '../security/audit';

chrome.runtime.onInstalled.addListener(() => {
  console.log('RadOrderPad Extension installed');
  
  AuditLogger.log({
    eventType: 'SYSTEM',
    action: 'EXTENSION_INSTALLED',
    resourceType: 'SYSTEM',
    success: true
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.action.openPopup();
});

// Clean up on browser close
chrome.runtime.onSuspend.addListener(() => {
  // Clear any remaining data
  chrome.storage.local.clear();
});
```

### 6. Popup UI

User interface for the extension.

Create `src/popup/popup.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
  <title>RadOrderPad Importer</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="popup-container">
    <header>
      <img src="icons/icon-48.png" alt="RadOrderPad" class="logo">
      <h1>RadOrderPad Importer</h1>
    </header>
    
    <div id="status" class="status" role="status"></div>
    
    <div class="actions">
      <button id="captureBtn" class="btn-primary">
        Capture Patient Data
      </button>
      
      <button id="fillBtn" class="btn-secondary" disabled>
        Fill RadOrderPad
      </button>
      
      <button id="clearBtn" class="btn-danger">
        Clear Data
      </button>
    </div>
    
    <div id="sessionTimer" class="session-timer">
      Session: <span id="timeRemaining">15:00</span>
    </div>
  </div>
  
  <script src="popup.js"></script>
</body>
</html>
```

Create `src/popup/popup.ts`:

```typescript
import { AccessControl } from '../security/access';

class Popup {
  constructor() {
    AccessControl.startSession();
    this.setupEventListeners();
    this.checkCurrentPage();
    this.startSessionTimer();
  }
  
  private setupEventListeners(): void {
    document.getElementById('captureBtn')?.addEventListener('click', 
      () => this.handleCapture());
    document.getElementById('fillBtn')?.addEventListener('click', 
      () => this.handleFill());
    document.getElementById('clearBtn')?.addEventListener('click', 
      () => this.handleClear());
  }
  
  private async handleCapture(): Promise<void> {
    try {
      this.updateStatus('Capturing...', 'info');
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id!, { action: 'capture' });
      
      if (response.success) {
        this.updateStatus('Data captured!', 'success');
        this.enableFillButton();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      this.updateStatus(`Error: ${error.message}`, 'error');
    }
  }
  
  private updateStatus(message: string, type: string): void {
    const status = document.getElementById('status')!;
    status.textContent = message;
    status.className = `status ${type}`;
  }
  
  // Additional methods...
}

document.addEventListener('DOMContentLoaded', () => new Popup());
```

Create `src/popup/styles.css`:

```css
.popup-container {
  width: 350px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

h1 {
  font-size: 18px;
  margin: 0;
}

.status {
  padding: 8px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 14px;
}

.status.success {
  background: #d4edda;
  color: #155724;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
}

.btn-primary, .btn-secondary, .btn-danger {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.session-timer {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 16px;
}
```

## Development Workflow

1. **Start Development Build**
   ```bash
   npm run dev
   ```

2. **Load Extension in Chrome**
   - Open `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select `build` directory

3. **Test on EMR**
   - Navigate to EMR patient page
   - Click extension icon
   - Click "Capture Patient Data"
   - Navigate to RadOrderPad
   - Click "Fill RadOrderPad"

## Next Steps

- Continue to [TESTING-GUIDE.md](./TESTING-GUIDE.md) for testing procedures
- Review [COMPLIANCE-GUIDE.md](./COMPLIANCE-GUIDE.md) for security requirements
- See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for release procedures