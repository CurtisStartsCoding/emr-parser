// Type definitions for RadOrderPad EMR Extension

export interface PatientData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;  // Format: MM/DD/YYYY
  gender?: 'Male' | 'Female' | 'Other';
  phoneNumber: string;  // Format: (XXX) XXX-XXXX
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;       // 2-letter code
  zipCode: string;     // XXXXX or XXXXX-XXXX
  mrn?: string;        // Medical Record Number
  ssn?: string;        // Format: XXX-XX-XXXX
  insurance?: InsuranceData;
}

export interface InsuranceData {
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
    groupNumber?: string;
  };
}

export interface CaptureData {
  patient: PatientData;
  insurance: InsuranceData;
  metadata: {
    sourceEMR: string;
    capturedAt: string;  // ISO timestamp
    capturedBy?: string; // User identifier
    pageUrl: string;
  };
}

export interface AuditLogEntry {
  timestamp: string;
  eventType: 'CAPTURE' | 'ACCESS' | 'FILL' | 'ERROR' | 'SYSTEM';
  action: string;
  resourceType: 'PHI' | 'SYSTEM';
  success: boolean;
  metadata?: Record<string, unknown>;
}

export interface EncryptedData {
  data: CaptureData;
  expiration: number;
  checksum: string;
}

export interface EMRDetectionResult {
  emrName: string;
  confidence: number;
  indicators: string[];
}

export interface ParsingResult {
  success: boolean;
  data?: PatientData;
  partialData?: Partial<PatientData>;
  insurance?: InsuranceData;
  errors?: string[];
  strategy?: string;
  confidence?: number; // Success rate as a decimal (0.0 to 1.0)
}

export interface FormFillingResult {
  success: boolean;
  fieldsFilled: number;
  errors?: string[];
}

export interface ExtensionMessage {
  action: 'capture' | 'fill' | 'detect' | 'clear' | 'status' | 'stats';
  data?: unknown;
}

export interface ExtensionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
} 