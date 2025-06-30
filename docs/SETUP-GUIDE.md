# Setup Guide

This guide covers project setup and security infrastructure for the RadOrderPad EMR Extension.

## Prerequisites

- Node.js 18+ 
- Chrome 100+
- Git
- Visual Studio Code (recommended)

## Project Structure

```bash
# Create project structure
mkdir radorderpad-extension && cd radorderpad-extension

# Create directories
mkdir -p src/{lib,popup,background,content,assets/icons}
mkdir -p src/security/{encryption,audit,access}
mkdir -p src/types
mkdir -p test/{unit,integration,security,compliance,fixtures}
mkdir -p docs/{user,developer,compliance,security}
mkdir build
```

## Step 1: Initialize Project

### 1.1 Create package.json

```json
{
  "name": "radorderpad-emr-extension",
  "version": "1.0.0",
  "description": "HIPAA-compliant patient data transfer",
  "scripts": {
    "build": "npm run security:check && webpack --mode production",
    "dev": "webpack --mode development --watch",
    "test": "jest",
    "test:security": "jest test/security",
    "test:compliance": "jest test/compliance", 
    "lint": "eslint src/**/*.ts",
    "lint:security": "eslint src/**/*.ts --config .eslintrc.security.json",
    "typecheck": "tsc --noEmit",
    "audit": "npm audit --production",
    "security:check": "npm run audit && npm run lint:security",
    "clean": "rm -rf build dist"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.246",
    "@types/jest": "^29.5.5",
    "@types/crypto-js": "^4.1.2",
    "@typescript-eslint/eslint-plugin": "^6.7.0",
    "@typescript-eslint/parser": "^6.7.0",
    "copy-webpack-plugin": "^11.0.0",
    "crypto-js": "^4.1.1",
    "eslint": "^8.49.0",
    "eslint-plugin-security": "^1.7.1",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.4.4",
    "typescript": "^5.2.2",
    "webpack": "^5.88.2",
    "webpack-cli": "^5.1.4"
  }
}
```

### 1.2 Install Dependencies

```bash
npm install
```

## Step 2: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020", "dom"],
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["chrome", "jest"],
    "sourceMap": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "test"]
}
```

## Step 3: Configure Build System

### 3.1 Create webpack.config.js

```javascript
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/popup/popup.ts',
    content: './src/content/content.ts',
    background: './src/background/background.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'src/popup/styles.css', to: 'styles.css' },
        { from: 'src/assets/icons', to: 'icons' }
      ]
    })
  ]
};
```

### 3.2 Configure ESLint

Create `.eslintrc.json`:

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

Create `.eslintrc.security.json`:

```json
{
  "extends": [".eslintrc.json", "plugin:security/recommended"],
  "plugins": ["security"],
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error",
    "no-console": "error",
    "no-debugger": "error"
  }
}
```

## Step 4: Configure Testing

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ]
};
```

## Step 5: Create Chrome Extension Manifest

Create `src/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "RadOrderPad EMR Importer",
  "version": "1.0.0",
  "description": "HIPAA-compliant patient data transfer",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "https://*.radorderpad.com/*"
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'none';"
  },
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
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "incognito": "not_allowed"
}
```

## Step 6: Security Infrastructure

### 6.1 Create Type Definitions

Create `src/types/index.ts`:

```typescript
export interface PatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: 'Male' | 'Female' | 'Other';
  phoneNumber: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  mrn?: string;
  ssn?: string;
}

export interface InsuranceData {
  hasInsurance: boolean;
  primary?: {
    company: string;
    policyNumber: string;
    policyHolderName: string;
    relationshipToPatient: string;
  };
}

export interface CaptureData {
  patient: PatientData;
  insurance: InsuranceData;
  metadata: {
    sourceEMR: string;
    capturedAt: string;
    pageUrl: string;
  };
}
```

### 6.2 Create Encryption Module

Create `src/security/encryption.ts`:

```typescript
import CryptoJS from 'crypto-js';

export class SecureDataHandler {
  private static readonly ENCRYPTION_KEY = this.generateKey();
  
  private static generateKey(): string {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }
  
  static encrypt(data: any): string {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.ENCRYPTION_KEY).toString();
  }
  
  static decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
  
  static sanitize(input: string): string {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
  }
}
```

### 6.3 Create Audit Module

Create `src/security/audit.ts`:

```typescript
export interface AuditEvent {
  timestamp: string;
  eventType: 'ACCESS' | 'CAPTURE' | 'FILL' | 'ERROR' | 'SECURITY';
  action: string;
  resourceType: 'PHI' | 'SYSTEM' | 'CONFIG';
  success: boolean;
}

export class AuditLogger {
  static log(event: Omit<AuditEvent, 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };
    
    // Never log PHI data
    console.info('AUDIT:', {
      ...auditEvent,
      // Remove any sensitive data
    });
  }
}
```

### 6.4 Create Access Control

Create `src/security/access.ts`:

```typescript
export class AccessControl {
  private static readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private static sessionStart: number | null = null;
  
  static startSession(): void {
    this.sessionStart = Date.now();
  }
  
  static checkSession(): boolean {
    if (!this.sessionStart) return false;
    
    const elapsed = Date.now() - this.sessionStart;
    if (elapsed > this.SESSION_TIMEOUT) {
      this.endSession();
      return false;
    }
    
    return true;
  }
  
  static endSession(): void {
    this.sessionStart = null;
  }
}
```

## Step 7: Environment Setup

### 7.1 Create .gitignore

```
node_modules/
build/
dist/
*.log
.DS_Store
.env
.env.local
coverage/
*.zip
```

### 7.2 Create .editorconfig

```
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

## Verification Checklist

- [ ] Run `npm install` successfully
- [ ] Run `npm run typecheck` with no errors
- [ ] Run `npm run lint` with no errors
- [ ] Run `npm run build` successfully
- [ ] Build output in `build/` directory
- [ ] All security modules created

## Next Steps

1. Continue to [DEVELOPMENT-GUIDE.md](./DEVELOPMENT-GUIDE.md) for core module implementation
2. Review [COMPLIANCE-GUIDE.md](./COMPLIANCE-GUIDE.md) for security requirements
3. Check [TESTING-GUIDE.md](./TESTING-GUIDE.md) for test setup