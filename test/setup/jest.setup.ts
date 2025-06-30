/// <reference types="node" />
import 'jest-extended';

// Mock Chrome extension APIs
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    onStartup: {
      addListener: jest.fn()
    },
    getManifest: jest.fn(() => ({ version: '1.0.0' })),
    getURL: jest.fn((path: string) => `chrome-extension://test/${path}`)
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    }
  },
  alarms: {
    create: jest.fn(),
    onAlarm: {
      addListener: jest.fn()
    }
  },
  tabs: {
    create: jest.fn(),
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  scripting: {
    executeScript: jest.fn()
  }
};

// Mock crypto API
const mockCrypto = {
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  randomUUID: jest.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
};

// Mock DOM APIs - let jsdom handle the actual DOM
// Only mock what's not provided by jsdom
const mockDocument = {
  readyState: 'complete',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  createElement: jest.fn(),
  head: {
    appendChild: jest.fn()
  },
  body: {
    innerText: '',
    innerHTML: '',
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  title: 'Test Page'
};

const mockWindow = {
  location: {
    href: 'https://test.com',
    hostname: 'test.com'
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

// Mock timer functions
const mockSetTimeout = jest.fn((callback: any, delay?: number) => {
  return 1 as any;
});

const mockSetInterval = jest.fn((callback: any, delay?: number) => {
  return 2 as any;
});

const mockClearTimeout = jest.fn();
const mockClearInterval = jest.fn();

// Global test utilities
const createMockElement = (tagName: string, attributes: Record<string, any> = {}) => {
  const element = {
    tagName: tagName.toUpperCase(),
    textContent: '',
    innerText: '',
    style: {},
    className: '',
    id: '',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    parentElement: null,
    nextElementSibling: null,
    ...attributes
  };
  return element;
};

const createMockPatientData = () => ({
  firstName: 'John',
  lastName: 'Doe',
  middleName: 'M',
  dateOfBirth: '01/15/1980',
  gender: 'Male' as const,
  phoneNumber: '(555) 123-4567',
  email: 'john.doe@example.com',
  addressLine1: '123 Main St',
  addressLine2: 'Apt 4B',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  mrn: 'MRN123456',
  ssn: '123-45-6789'
});

const createMockInsuranceData = () => ({
  hasInsurance: true,
  primary: {
    company: 'Blue Cross Blue Shield',
    policyNumber: 'POL123456',
    groupNumber: 'GRP789012',
    policyHolderName: 'John Doe',
    relationshipToPatient: 'Self' as const,
    policyHolderDOB: '01/15/1980'
  },
  secondary: {
    company: 'Aetna',
    policyNumber: 'SEC123456'
  }
});

// Assign mocks to global scope
Object.assign(global, {
  chrome: mockChrome,
  crypto: mockCrypto,
  // Let jsdom handle document operations
  window: mockWindow,
  setTimeout: mockSetTimeout,
  setInterval: mockSetInterval,
  clearTimeout: mockClearTimeout,
  clearInterval: mockClearInterval,
  createMockElement,
  createMockPatientData,
  createMockInsuranceData
});

// Test environment cleanup
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  
  // Reset Chrome mocks
  (mockChrome.storage.local.get as jest.Mock).mockResolvedValue({});
  (mockChrome.storage.local.set as jest.Mock).mockResolvedValue(undefined);
  (mockChrome.storage.local.remove as jest.Mock).mockResolvedValue(undefined);
  
  // Reset window mocks
  mockWindow.location.href = 'https://test.com';
  mockWindow.location.hostname = 'test.com';
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(10000); 