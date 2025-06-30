# RadOrderPad EMR Extension Testing Guide

## Overview

This guide covers comprehensive testing for the RadOrderPad EMR Extension, including unit tests, integration tests, security tests, compliance tests, and end-to-end (E2E) tests using Cypress.

## Testing Architecture

### Test Types

1. **Unit Tests** - Test individual functions and classes in isolation
2. **Integration Tests** - Test interactions between modules
3. **Security Tests** - Test encryption, access control, and data protection
4. **Compliance Tests** - Test HIPAA and SOC2 compliance requirements
5. **E2E Tests** - Test complete user workflows using Cypress

### Test Structure

```
test/
├── unit/           # Unit tests for individual modules
├── integration/    # Integration tests for module interactions
├── security/       # Security-specific tests
├── compliance/     # HIPAA/SOC2 compliance tests
├── fixtures/       # Test data and mock pages
└── setup/          # Test configuration and utilities
```

## Running Tests

### Prerequisites

Install dependencies:
```bash
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:security
npm run test:compliance

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:open

# Run all tests (unit + E2E)
npm run test:all
```

## Unit Testing

### Jest Configuration

The project uses Jest with TypeScript support. Key features:

- **TypeScript Support**: Uses `ts-jest` for TypeScript compilation
- **Coverage Reporting**: Generates coverage reports in multiple formats
- **Mock Support**: Comprehensive mocking for Chrome APIs and DOM
- **Test Environment**: Uses `jsdom` for DOM simulation

### Example Unit Test

```typescript
import { SecureDataHandler } from '../../src/security/encryption/secure-data-handler';

describe('SecureDataHandler', () => {
  it('should encrypt data successfully', () => {
    const testData = { name: 'John' };
    const encrypted = SecureDataHandler.encrypt(testData);
    
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe('string');
  });
});
```

### Mock Setup

The test setup includes comprehensive mocks for:

- Chrome Extension APIs (`chrome.runtime`, `chrome.storage`, etc.)
- DOM APIs (`document`, `window`)
- Crypto APIs (`crypto.getRandomValues`)
- Timer functions (`setTimeout`, `setInterval`)

## Integration Testing

### Testing Module Interactions

Integration tests verify that modules work together correctly:

```typescript
import { RadOrderPadImporter } from '../../src/lib/importer';
import { UniversalEMRParser } from '../../src/lib/parser';
import { RadOrderPadFiller } from '../../src/lib/filler';

describe('RadOrderPadImporter Integration', () => {
  it('should parse EMR data and fill forms', async () => {
    const importer = new RadOrderPadImporter();
    const result = await importer.captureAndFill();
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
```

## Security Testing

### Encryption Tests

Test AES-256 encryption and data integrity:

```typescript
describe('Security Tests', () => {
  it('should encrypt and decrypt data correctly', () => {
    const originalData = { patient: { name: 'John' } };
    const encrypted = SecureDataHandler.encrypt(originalData);
    const decrypted = SecureDataHandler.decrypt(encrypted);
    
    expect(decrypted).toEqual(originalData);
  });
  
  it('should detect tampered data', () => {
    const encrypted = SecureDataHandler.encrypt(testData);
    const tampered = encrypted + 'malicious';
    
    expect(() => {
      SecureDataHandler.decrypt(tampered);
    }).toThrow();
  });
});
```

### Access Control Tests

Test session management and permissions:

```typescript
describe('Access Control', () => {
  it('should enforce session timeout', () => {
    const accessControl = new AccessControl();
    accessControl.startSession();
    
    // Simulate time passing
    jest.advanceTimersByTime(16 * 60 * 1000); // 16 minutes
    
    expect(accessControl.isSessionValid()).toBe(false);
  });
});
```

## Compliance Testing

### HIPAA Compliance Tests

Test data handling and audit logging:

```typescript
describe('HIPAA Compliance', () => {
  it('should log all PHI access', () => {
    const auditLogger = new AuditLogger();
    const logEntry = auditLogger.logPHIAccess('CAPTURE', 'patient-data');
    
    expect(logEntry.eventType).toBe('CAPTURE');
    expect(logEntry.resourceType).toBe('PHI');
    expect(logEntry.timestamp).toBeDefined();
  });
  
  it('should not log PHI in audit trails', () => {
    const auditLogger = new AuditLogger();
    const logEntry = auditLogger.logPHIAccess('CAPTURE', 'patient-data');
    
    expect(JSON.stringify(logEntry)).not.toContain('John');
    expect(JSON.stringify(logEntry)).not.toContain('Doe');
  });
});
```

### Data Retention Tests

Test automatic data deletion:

```typescript
describe('Data Retention', () => {
  it('should delete data after 5 minutes', () => {
    const storage = new SecureStorage();
    storage.store('test-key', testData);
    
    // Simulate 6 minutes passing
    jest.advanceTimersByTime(6 * 60 * 1000);
    
    const retrieved = storage.retrieve('test-key');
    expect(retrieved).toBeNull();
  });
});
```

## E2E Testing with Cypress

### Cypress Configuration

The project uses Cypress for E2E testing with Chrome extension support:

```typescript
// cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        // Load the extension
        launchOptions.args.push('--load-extension=dist');
        return launchOptions;
      });
    },
  },
});
```

### E2E Test Structure

```typescript
// cypress/e2e/extension-workflow.cy.ts
describe('RadOrderPad Extension E2E Workflow', () => {
  it('should capture patient data and fill forms', () => {
    // Navigate to EMR page
    cy.simulateEMRPage('epic');
    
    // Capture data
    cy.capturePatientData();
    
    // Navigate to RadOrderPad
    cy.simulateRadOrderPadPage();
    
    // Fill forms
    cy.fillRadOrderPadForms();
    
    // Verify results
    cy.get('#firstName').should('have.value', 'John');
  });
});
```

### Custom Cypress Commands

The project includes custom commands for common operations:

- `cy.loadExtension()` - Load the Chrome extension
- `cy.capturePatientData()` - Simulate data capture
- `cy.fillRadOrderPadForms()` - Simulate form filling
- `cy.simulateEMRPage(emrType)` - Load mock EMR pages
- `cy.simulateRadOrderPadPage()` - Load mock RadOrderPad pages

### Running E2E Tests

```bash
# Start test server
npm run serve:test

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:open
```

## Test Data and Fixtures

### Mock EMR Pages

The project includes mock EMR pages for testing:

- Epic MyChart pages
- Cerner PowerChart pages
- Athena EMR pages
- Generic EMR pages

### Test Data

Standardized test data includes:

```typescript
const testPatientData = {
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '01/15/1980',
  phoneNumber: '(555) 123-4567',
  email: 'john.doe@example.com',
  addressLine1: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipCode: '10001'
};
```

## Continuous Integration

### GitHub Actions

The project includes CI/CD configuration:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:all
      - run: npm run test:e2e
```

### Pre-commit Hooks

Configure pre-commit hooks for code quality:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test:unit",
      "pre-push": "npm run test:all"
    }
  }
}
```

## Coverage Requirements

### Minimum Coverage Thresholds

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Text**: Console output
- **HTML**: Detailed web report
- **LCOV**: CI/CD integration

## Debugging Tests

### Debugging Unit Tests

```bash
# Run specific test with debugging
npm test -- --verbose --testNamePattern="SecureDataHandler"
```

### Debugging E2E Tests

```bash
# Open Cypress UI for debugging
npm run test:e2e:open

# Run specific test file
npx cypress run --spec "cypress/e2e/extension-workflow.cy.ts"
```

### Common Issues

1. **Chrome Extension Loading**: Ensure extension is built before E2E tests
2. **Mock Data**: Verify test data matches expected formats
3. **Timing Issues**: Use proper waits and assertions for async operations
4. **Environment Variables**: Set required environment variables for tests

## Best Practices

### Test Organization

1. **Arrange-Act-Assert**: Structure tests with clear sections
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should test one thing
4. **Independent Tests**: Tests should not depend on each other

### Test Data Management

1. **Use Fixtures**: Store test data in fixture files
2. **Clean Data**: Reset data between tests
3. **Realistic Data**: Use realistic but safe test data
4. **No PHI**: Never use real patient data in tests

### Security Testing

1. **Encryption Verification**: Test all encryption/decryption paths
2. **Access Control**: Verify session management and permissions
3. **Data Sanitization**: Test XSS and injection prevention
4. **Audit Logging**: Verify all actions are logged appropriately

### Performance Testing

1. **Memory Leaks**: Test for memory leaks in long-running operations
2. **Response Times**: Verify acceptable performance for user interactions
3. **Resource Usage**: Monitor CPU and memory usage during tests

## Troubleshooting

### Common Test Failures

1. **Mock Issues**: Ensure all Chrome APIs are properly mocked
2. **Timing Issues**: Add appropriate waits for async operations
3. **Environment Issues**: Verify test environment setup
4. **Data Issues**: Check test data format and content

### Getting Help

1. Check the test logs for detailed error messages
2. Review the test setup and configuration
3. Verify all dependencies are installed
4. Check the Cypress documentation for E2E testing issues