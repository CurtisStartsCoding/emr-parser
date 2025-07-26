import { SimpleUniversalParser } from '../src/lib/simple-universal-parser';

describe('ModMed Universal Parser Test', () => {
  let parser: SimpleUniversalParser;

  beforeEach(() => {
    document.body.innerHTML = '';
    parser = new SimpleUniversalParser(true); // Enable debug mode
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should parse ModMed patient data with universal parser', async () => {
    // Set up ModMed HTML
    document.body.innerHTML = `
      <div class="modmed-container" data-modmed="true">
        <h1>ModMed EMR System</h1>
        <div class="modmed-patient-info">
          <h2>Patient Information</h2>
          
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

    console.log('🔍 Testing ModMed with universal parser...');
    
    const result = await parser.parsePatientData();
    console.log('ModMed Result:', result);

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('simple-universal');
    expect(result.confidence).toBeGreaterThan(0.5);
    
            if (result.data) {
          expect(result.data.firstName).toBe('Jennifer');
          expect(result.data.lastName).toBe('Davis');
          expect(result.data.middleName).toBe('Marie');
          expect(result.data.dateOfBirth).toBe('07/14/1988');
          expect(result.data.gender).toBe('F');
          expect(result.data.phoneNumber).toBe('(312) 555-7890');
          expect(result.data.email).toBe('jennifer.davis@email.com');
          expect(result.data.addressLine1).toBe('654 Maple Drive');
          expect(result.data.city).toBe('Chicago');
          expect(result.data.state).toBe('IL');
          expect(result.data.zipCode).toBe('60601');
          
          // Test insurance data
          if (result.data.insurance) {
            expect(result.data.insurance.hasInsurance).toBe(true);
            if (result.data.insurance.primary) {
              expect(result.data.insurance.primary.company).toBe('Blue Cross Blue Shield');
              expect(result.data.insurance.primary.planName).toBe('PPO Choice Plus');
              expect(result.data.insurance.primary.policyNumber).toBe('POL987654321');
              expect(result.data.insurance.primary.groupNumber).toBe('GRP123456');
              expect(result.data.insurance.primary.policyHolderName).toBe('Jennifer Davis');
              expect(result.data.insurance.primary.relationshipToPatient).toBe('Self');
              expect(result.data.insurance.primary.policyHolderDOB).toBe('07/14/1988');
            }
            if (result.data.insurance.secondary) {
              expect(result.data.insurance.secondary.company).toBe('Aetna');
              expect(result.data.insurance.secondary.policyNumber).toBe('SEC123456789');
              expect(result.data.insurance.secondary.groupNumber).toBe('SECGRP789');
            }
          }
        }
  });

  it('should detect ModMed indicators in page content', () => {
    document.body.innerHTML = `
      <div class="modmed-container" data-modmed="true">
        <h1>ModMed EMR System</h1>
        <div class="modmed-patient-info">
          <h2>Patient Information</h2>
        </div>
      </div>
    `;

    const pageText = document.body.innerText.toLowerCase();
    expect(pageText.includes('modmed')).toBe(true);
    expect(pageText.includes('emr system')).toBe(true);
    expect(pageText.includes('patient information')).toBe(true);
  });
}); 