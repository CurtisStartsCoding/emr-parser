import { ModMedStrategy } from '../src/lib/emr/strategies/modmed-strategy';
import { PatientData } from '../src/types';

describe('ModMed Strategy', () => {
  let strategy: ModMedStrategy;

  beforeEach(() => {
    strategy = new ModMedStrategy();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Detection', () => {
    it('should detect ModMed EMR with data attribute', () => {
      document.body.innerHTML = `
        <div data-modmed="true">
          <div class="modmed-container">
            <div class="modmed-patient-info">
              <h2>Patient Information</h2>
            </div>
          </div>
        </div>
      `;

      const result = strategy.detect();
      expect(result.detected).toBe(true);
      expect(result.name).toBe('ModMed');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should detect ModMed EMR with container classes', () => {
      document.body.innerHTML = `
        <div class="modmed-container">
          <div class="modmed-patient-info">
            <h2>Patient Information</h2>
          </div>
        </div>
      `;

      const result = strategy.detect();
      expect(result.detected).toBe(true);
      expect(result.name).toBe('ModMed');
      expect(result.confidence).toBeGreaterThan(0.3);
    });

    it('should detect ModMed EMR with specialty indicators', () => {
      document.body.innerHTML = `
        <div>
          <h1>Dermatology Practice</h1>
          <div class="patient-info">
            <h2>Patient Information</h2>
          </div>
        </div>
      `;

      const result = strategy.detect();
      expect(result.detected).toBe(true);
      expect(result.name).toBe('ModMed');
      expect(result.confidence).toBeGreaterThan(0.1);
    });

    it('should not detect non-ModMed pages', () => {
      document.body.innerHTML = `
        <div>
          <h1>Generic EMR System</h1>
          <div class="patient-info">
            <h2>Patient Information</h2>
          </div>
        </div>
      `;

      const result = strategy.detect();
      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.3);
    });
  });

  describe('Field Extraction', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="modmed-container" data-modmed="true">
          <div class="modmed-patient-info">
            <div class="field">
              <label for="firstName">First Name:</label>
              <input type="text" id="firstName" value="Jennifer" readonly>
            </div>
            <div class="field">
              <label for="lastName">Last Name:</label>
              <input type="text" id="lastName" value="Davis" readonly>
            </div>
            <div class="field">
              <label for="dateOfBirth">Date of Birth:</label>
              <input type="text" id="dateOfBirth" value="07/14/1988" readonly>
            </div>
            <div class="field">
              <label for="phoneNumber">Phone Number:</label>
              <input type="text" id="phoneNumber" value="(312) 555-7890" readonly>
            </div>
            <div class="field">
              <label for="insuranceCompany">Primary Insurance:</label>
              <input type="text" id="insuranceCompany" value="Blue Cross Blue Shield" readonly>
            </div>
            <div class="field">
              <label for="insurancePolicyNumber">Policy Number:</label>
              <input type="text" id="insurancePolicyNumber" value="POL987654321" readonly>
            </div>
          </div>
        </div>
      `;
    });

    it('should extract firstName', async () => {
      const result = await strategy.extractField('firstName');
      expect(result.value).toBe('Jennifer');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should extract lastName', async () => {
      const result = await strategy.extractField('lastName');
      expect(result.value).toBe('Davis');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should extract dateOfBirth', async () => {
      const result = await strategy.extractField('dateOfBirth');
      expect(result.value).toBe('07/14/1988');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should extract phoneNumber', async () => {
      const result = await strategy.extractField('phoneNumber');
      expect(result.value).toBe('(312) 555-7890');
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it('should handle missing fields', async () => {
      const result = await strategy.extractField('email');
      expect(result.value).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('should extract insurance fields', async () => {
      const insuranceResult = await strategy.extractField('insuranceCompany');
      expect(insuranceResult.value).toBe('Blue Cross Blue Shield');
      expect(insuranceResult.confidence).toBeGreaterThan(0.6);

      const policyResult = await strategy.extractField('insurancePolicyNumber');
      expect(policyResult.value).toBe('POL987654321');
      expect(policyResult.confidence).toBeGreaterThan(0.6);
    });
  });

  describe('Detail Row Extraction', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="modmed-container" data-modmed="true">
          <div class="modmed-patient-info">
            <div class="detail-row">
              <div class="detail-label">First Name:</div>
              <div class="detail-value">Jennifer</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Last Name:</div>
              <div class="detail-value">Davis</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Date of Birth:</div>
              <div class="detail-value">07/14/1988</div>
            </div>
          </div>
        </div>
      `;
    });

    it('should extract from detail rows', async () => {
      const firstNameResult = await strategy.extractField('firstName');
      expect(firstNameResult.value).toBe('Jennifer');
      expect(firstNameResult.strategy).toBe('modmed-detail-pairs');

      const lastNameResult = await strategy.extractField('lastName');
      expect(lastNameResult.value).toBe('Davis');
      expect(lastNameResult.strategy).toBe('modmed-detail-pairs');
    });
  });

  describe('Table Extraction', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="modmed-container" data-modmed="true">
          <table>
            <tr>
              <th>First Name</th>
              <td>Jennifer</td>
            </tr>
            <tr>
              <th>Last Name</th>
              <td>Davis</td>
            </tr>
            <tr>
              <th>Date of Birth</th>
              <td>07/14/1988</td>
            </tr>
          </table>
        </div>
      `;
    });

    it('should extract from tables', async () => {
      const firstNameResult = await strategy.extractField('firstName');
      expect(firstNameResult.value).toBe('Jennifer');
      expect(firstNameResult.strategy).toBe('modmed-table');

      const lastNameResult = await strategy.extractField('lastName');
      expect(lastNameResult.value).toBe('Davis');
      expect(lastNameResult.strategy).toBe('modmed-table');
    });
  });

  describe('Complete Patient Data Parsing', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="modmed-container" data-modmed="true">
          <div class="modmed-patient-info">
            <div class="field">
              <label for="firstName">First Name:</label>
              <input type="text" id="firstName" value="Jennifer" readonly>
            </div>
            <div class="field">
              <label for="lastName">Last Name:</label>
              <input type="text" id="lastName" value="Davis" readonly>
            </div>
            <div class="field">
              <label for="middleName">Middle Name:</label>
              <input type="text" id="middleName" value="Marie" readonly>
            </div>
            <div class="field">
              <label for="dateOfBirth">Date of Birth:</label>
              <input type="text" id="dateOfBirth" value="07/14/1988" readonly>
            </div>
            <div class="field">
              <label for="gender">Gender:</label>
              <select id="gender" disabled>
                <option value="F" selected>Female</option>
              </select>
            </div>
            <div class="field">
              <label for="phoneNumber">Phone Number:</label>
              <input type="text" id="phoneNumber" value="(312) 555-7890" readonly>
            </div>
            <div class="field">
              <label for="email">Email:</label>
              <input type="text" id="email" value="jennifer.davis@email.com" readonly>
            </div>
            <div class="field">
              <label for="addressLine1">Address Line 1:</label>
              <input type="text" id="addressLine1" value="654 Maple Drive" readonly>
            </div>
            <div class="field">
              <label for="city">City:</label>
              <input type="text" id="city" value="Chicago" readonly>
            </div>
            <div class="field">
              <label for="state">State:</label>
              <input type="text" id="state" value="IL" readonly>
            </div>
            <div class="field">
              <label for="zipCode">Zip Code:</label>
              <input type="text" id="zipCode" value="60601" readonly>
            </div>
          </div>
        </div>
      `;
    });

    it('should parse complete patient data', async () => {
      const result = await strategy.parsePatientData();
      
      expect(result.success).toBe(true);
      expect(result.strategy).toBe('modmed');
      expect(result.confidence).toBeGreaterThan(0.5);
      
      if (result.data) {
        expect(result.data.firstName).toBe('Jennifer');
        expect(result.data.lastName).toBe('Davis');
        expect(result.data.middleName).toBe('Marie');
        expect(result.data.dateOfBirth).toBe('07/14/1988');
        expect(result.data.gender).toBe('Female');
        expect(result.data.phoneNumber).toBe('(312) 555-7890');
        expect(result.data.email).toBe('jennifer.davis@email.com');
        expect(result.data.addressLine1).toBe('654 Maple Drive');
        expect(result.data.city).toBe('Chicago');
        expect(result.data.state).toBe('IL');
        expect(result.data.zipCode).toBe('60601');
      }
    });
  });

  describe('Data Formatting', () => {
    it('should format phone numbers correctly', () => {
      const strategy = new ModMedStrategy();
      
      // Test phone number formatting
      const phone1 = '(312) 555-7890';
      const phone2 = '3125557890';
      const phone3 = '312-555-7890';
      
      expect(strategy['processModMedPhone'](phone1)).toBe('(312) 555-7890');
      expect(strategy['processModMedPhone'](phone2)).toBe('(312) 555-7890');
      expect(strategy['processModMedPhone'](phone3)).toBe('(312) 555-7890');
    });

    it('should format dates correctly', () => {
      const strategy = new ModMedStrategy();
      
      // Test date formatting
      const date1 = '07/14/1988';
      const date2 = '07-14-1988';
      const date3 = '7/14/1988';
      
      expect(strategy['processModMedDate'](date1)).toBe('07/14/1988');
      expect(strategy['processModMedDate'](date2)).toBe('07/14/1988');
      expect(strategy['processModMedDate'](date3)).toBe('07/14/1988');
    });

    it('should normalize gender correctly', () => {
      const strategy = new ModMedStrategy();
      
      expect(strategy['normalizeGender']('Male')).toBe('Male');
      expect(strategy['normalizeGender']('Female')).toBe('Female');
      expect(strategy['normalizeGender']('M')).toBe('Male');
      expect(strategy['normalizeGender']('F')).toBe('Female');
      expect(strategy['normalizeGender']('male')).toBe('Male');
      expect(strategy['normalizeGender']('female')).toBe('Female');
      expect(strategy['normalizeGender']('Other')).toBe('Other');
      expect(strategy['normalizeGender'](undefined)).toBeUndefined();
    });
  });
}); 