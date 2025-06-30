/**
 * DataNormalizer - Handles data normalization and validation
 */

export class DataNormalizer {
  /**
   * Normalizes gender values to standard format
   */
  static normalizeGender(value: string): 'Male' | 'Female' | 'Other' | undefined {
    if (!value) return undefined;
    
    const normalized = value.trim().toLowerCase();
    
    if (normalized.startsWith('m') || normalized === 'male') return 'Male';
    if (normalized.startsWith('f') || normalized === 'female') return 'Female';
    if (normalized.startsWith('o') || normalized === 'other') return 'Other';
    
    return undefined;
  }

  /**
   * Normalizes phone numbers to standard format
   */
  static normalizePhone(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX if 10 digits
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    // Return original if not 10 digits
    return phone.trim();
  }

  /**
   * Normalizes email addresses
   */
  static normalizeEmail(email: string): string {
    if (!email) return '';
    return email.trim().toLowerCase();
  }

  /**
   * Normalizes date strings to MM/DD/YYYY format
   */
  static normalizeDate(date: string): string {
    if (!date) return '';
    
    // Try to parse various date formats
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date.trim();
    
    return parsed.toLocaleDateString('en-US');
  }

  /**
   * Normalizes SSN to XXX-XX-XXXX format
   */
  static normalizeSSN(ssn: string): string {
    if (!ssn) return '';
    
    // Remove all non-digit characters
    const digits = ssn.replace(/\D/g, '');
    
    // Format as XXX-XX-XXXX if 9 digits
    if (digits.length === 9) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    }
    
    return ssn.trim();
  }

  /**
   * Normalizes MRN to standard format
   */
  static normalizeMRN(mrn: string): string {
    if (!mrn) return '';
    return mrn.trim().toUpperCase();
  }

  /**
   * Normalizes state codes to 2-letter format
   * @param state - The state string to normalize
   * @returns Normalized state code
   */
  static normalizeState(state: string): string {
    if (!state) return '';
    
    const stateMap: Record<string, string> = {
      'alabama': 'AL',
      'alaska': 'AK',
      'arizona': 'AZ',
      'arkansas': 'AR',
      'california': 'CA',
      'colorado': 'CO',
      'connecticut': 'CT',
      'delaware': 'DE',
      'florida': 'FL',
      'georgia': 'GA',
      'hawaii': 'HI',
      'idaho': 'ID',
      'illinois': 'IL',
      'indiana': 'IN',
      'iowa': 'IA',
      'kansas': 'KS',
      'kentucky': 'KY',
      'louisiana': 'LA',
      'maine': 'ME',
      'maryland': 'MD',
      'massachusetts': 'MA',
      'michigan': 'MI',
      'minnesota': 'MN',
      'mississippi': 'MS',
      'missouri': 'MO',
      'montana': 'MT',
      'nebraska': 'NE',
      'nevada': 'NV',
      'new hampshire': 'NH',
      'new jersey': 'NJ',
      'new mexico': 'NM',
      'new york': 'NY',
      'north carolina': 'NC',
      'north dakota': 'ND',
      'ohio': 'OH',
      'oklahoma': 'OK',
      'oregon': 'OR',
      'pennsylvania': 'PA',
      'rhode island': 'RI',
      'south carolina': 'SC',
      'south dakota': 'SD',
      'tennessee': 'TN',
      'texas': 'TX',
      'utah': 'UT',
      'vermont': 'VT',
      'virginia': 'VA',
      'washington': 'WA',
      'west virginia': 'WV',
      'wisconsin': 'WI',
      'wyoming': 'WY'
    };
    
    const normalized = state.trim().toLowerCase();
    
    // If it's already a 2-letter code, return as-is
    if (normalized.length === 2 && /^[A-Za-z]{2}$/.test(normalized)) {
      return normalized.toUpperCase();
    }
    
    // Look up full state name
    return stateMap[normalized] || state;
  }

  /**
   * Normalizes zip codes
   * @param zipCode - The zip code to normalize
   * @returns Normalized zip code
   */
  static normalizeZipCode(zipCode: string): string {
    if (!zipCode) return '';
    
    const digits = zipCode.replace(/\D/g, '');
    
    if (digits.length === 5) {
      return digits;
    } else if (digits.length === 9) {
      return `${digits.slice(0,5)}-${digits.slice(5)}`;
    }
    
    return zipCode;
  }

  /**
   * Sanitizes text input
   * @param text - The text to sanitize
   * @returns Sanitized text
   */
  static sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[<>]/g, '') // Remove angle brackets
      .slice(0, 100); // Limit length
  }
} 