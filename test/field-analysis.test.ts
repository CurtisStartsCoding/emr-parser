import { EMRStrategyManager } from '../src/lib/emr/emr-strategy-manager';

describe('EMR Field Analysis', () => {
  let parser: EMRStrategyManager;

  beforeEach(() => {
    document.body.innerHTML = '';
    parser = new EMRStrategyManager();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should analyze ECW field extraction', async () => {
    // Set up ECW HTML with all fields
    document.body.innerHTML = `
      <div class="ecw-container">
        <div class="ecw-patient-info">
          <div class="ecw-label">First Name:</div>
          <div class="ecw-value">David</div>
          <div class="ecw-label">Last Name:</div>
          <div class="ecw-value">Wilson</div>
          <div class="ecw-label">Middle Name:</div>
          <div class="ecw-value">James</div>
          <div class="ecw-label">Date of Birth:</div>
          <div class="ecw-value">03/15/1970</div>
          <div class="ecw-label">Gender:</div>
          <div class="ecw-value">Male</div>
          <div class="ecw-label">Phone Number:</div>
          <div class="ecw-value">(555) 789-0123</div>
          <div class="ecw-label">Email:</div>
          <div class="ecw-value">david.wilson@email.com</div>
          <div class="ecw-label">Address:</div>
          <div class="ecw-value">567 Cedar Ln, Miami, FL 33101</div>
          <div class="ecw-label">Medical Record Number:</div>
          <div class="ecw-value">MRN123456</div>
          <div class="ecw-label">Social Security Number:</div>
          <div class="ecw-value">123-45-6789</div>
          <div class="ecw-label">Insurance Company:</div>
          <div class="ecw-value">UnitedHealth</div>
          <div class="ecw-label">Plan Name:</div>
          <div class="ecw-value">Choice Plus</div>
          <div class="ecw-label">Policy Number:</div>
          <div class="ecw-value">POL789012</div>
          <div class="ecw-label">Group Number:</div>
          <div class="ecw-value">GRP345678</div>
          <div class="ecw-label">Policy Holder Name:</div>
          <div class="ecw-value">David Wilson</div>
          <div class="ecw-label">Relationship to Patient:</div>
          <div class="ecw-value">Self</div>
          <div class="ecw-label">Policy Holder DOB:</div>
          <div class="ecw-value">03/15/1970</div>
        </div>
      </div>
    `;

    console.log('🔍 Testing ECW field extraction...');
    
    // Test individual field extraction
    const fields = [
      'firstName', 'lastName', 'middleName', 'dateOfBirth', 'gender',
      'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'zipCode',
      'mrn', 'ssn', 'primaryInsuranceCompany', 'primaryPlanName', 
      'primaryPolicyNumber', 'primaryGroupNumber', 'primaryPolicyHolderName',
      'primaryRelationshipToPatient', 'primaryPolicyHolderDOB'
    ];

    const results: { [key: string]: any } = {};
    
    for (const field of fields) {
      const result = await parser.extractField(field);
      results[field] = result;
      console.log(`ECW ${field}: ${result.value ? '✅' : '❌'} ${result.value || 'NOT FOUND'} (confidence: ${result.confidence})`);
    }

    // Test full parsing
    parser.resetDetection();
    const fullResult = await parser.parsePatientData();
    console.log('ECW Full Result:', fullResult);
  });

  it('should analyze Athenahealth field extraction', async () => {
    // Set up Athenahealth HTML with all fields
    document.body.innerHTML = `
      <div data-athena="true" class="athena-container">
        <div class="athena-patient-info">
          <div class="detail-label">First Name:</div>
          <div class="detail-value">Lisa</div>
          <div class="detail-label">Last Name:</div>
          <div class="detail-value">Anderson</div>
          <div class="detail-label">Middle Name:</div>
          <div class="detail-value">Marie</div>
          <div class="detail-label">Date of Birth:</div>
          <div class="detail-value">09/28/1988</div>
          <div class="detail-label">Gender:</div>
          <div class="detail-value">Female</div>
          <div class="detail-label">Phone:</div>
          <div class="detail-value">(555) 654-3210</div>
          <div class="detail-label">Email:</div>
          <div class="detail-value">lisa.anderson@email.com</div>
          <div class="detail-label">Address:</div>
          <div class="detail-value">890 Birch Rd, Seattle, WA 98101</div>
          <div class="detail-label">Medical Record Number:</div>
          <div class="detail-value">MRN789012</div>
          <div class="detail-label">Social Security Number:</div>
          <div class="detail-value">987-65-4321</div>
          <div class="detail-label">Insurance Company:</div>
          <div class="detail-value">Blue Cross</div>
          <div class="detail-label">Plan Name:</div>
          <div class="detail-value">Premium Plan</div>
          <div class="detail-label">Policy Number:</div>
          <div class="detail-value">POL123456</div>
          <div class="detail-label">Group Number:</div>
          <div class="detail-value">GRP789012</div>
          <div class="detail-label">Policy Holder Name:</div>
          <div class="detail-value">Lisa Anderson</div>
          <div class="detail-label">Relationship to Patient:</div>
          <div class="detail-value">Self</div>
          <div class="detail-label">Policy Holder DOB:</div>
          <div class="detail-value">09/28/1988</div>
        </div>
      </div>
    `;

    console.log('🔍 Testing Athenahealth field extraction...');
    
    // Test individual field extraction
    const fields = [
      'firstName', 'lastName', 'middleName', 'dateOfBirth', 'gender',
      'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'zipCode',
      'mrn', 'ssn', 'primaryInsuranceCompany', 'primaryPlanName', 
      'primaryPolicyNumber', 'primaryGroupNumber', 'primaryPolicyHolderName',
      'primaryRelationshipToPatient', 'primaryPolicyHolderDOB'
    ];

    const results: { [key: string]: any } = {};
    
    for (const field of fields) {
      const result = await parser.extractField(field);
      results[field] = result;
      console.log(`Athenahealth ${field}: ${result.value ? '✅' : '❌'} ${result.value || 'NOT FOUND'} (confidence: ${result.confidence})`);
    }

    // Test full parsing
    parser.resetDetection();
    const fullResult = await parser.parsePatientData();
    console.log('Athenahealth Full Result:', fullResult);
  });

  it('should analyze Onco field extraction', async () => {
    // Set up Onco HTML with all fields
    document.body.innerHTML = `
      <div data-onco="true" class="onco-container">
        <div class="onco-patient-info">
          <div class="detail-label">First Name:</div>
          <div class="detail-value">Michael</div>
          <div class="detail-label">Last Name:</div>
          <div class="detail-value">Johnson</div>
          <div class="detail-label">Middle Name:</div>
          <div class="detail-value">Robert</div>
          <div class="detail-label">Date of Birth:</div>
          <div class="detail-value">12/05/1975</div>
          <div class="detail-label">Gender:</div>
          <div class="detail-value">Male</div>
          <div class="detail-label">Phone:</div>
          <div class="detail-value">(555) 321-0987</div>
          <div class="detail-label">Email:</div>
          <div class="detail-value">michael.johnson@email.com</div>
          <div class="detail-label">Address:</div>
          <div class="detail-value">123 Oak St, Chicago, IL 60601</div>
          <div class="detail-label">Medical Record Number:</div>
          <div class="detail-value">MRN456789</div>
          <div class="detail-label">Social Security Number:</div>
          <div class="detail-value">456-78-9012</div>
        </div>
      </div>
    `;

    console.log('🔍 Testing Onco field extraction...');
    
    // Test individual field extraction
    const fields = [
      'firstName', 'lastName', 'middleName', 'dateOfBirth', 'gender',
      'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'zipCode',
      'mrn', 'ssn'
    ];

    const results: { [key: string]: any } = {};
    
    for (const field of fields) {
      const result = await parser.extractField(field);
      results[field] = result;
      console.log(`Onco ${field}: ${result.value ? '✅' : '❌'} ${result.value || 'NOT FOUND'} (confidence: ${result.confidence})`);
    }

    // Test full parsing
    parser.resetDetection();
    const fullResult = await parser.parsePatientData();
    console.log('Onco Full Result:', fullResult);
  });

  it('should analyze Epic field extraction', async () => {
    // Set up Epic HTML with all fields
    document.body.innerHTML = `
      <div class="MyChartLogo">Epic MyChart</div>
      <div class="patient-info">
        <div class="info-row">
          <div class="info-label">First Name:</div>
          <div class="info-value">John</div>
        </div>
        <div class="info-row">
          <div class="info-label">Last Name:</div>
          <div class="info-value">Doe</div>
        </div>
        <div class="info-row">
          <div class="info-label">Middle Name:</div>
          <div class="info-value">Michael</div>
        </div>
        <div class="info-row">
          <div class="info-label">Date of Birth:</div>
          <div class="info-value">01/15/1980</div>
        </div>
        <div class="info-row">
          <div class="info-label">Gender:</div>
          <div class="info-value">Male</div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone Number:</div>
          <div class="info-value">(555) 123-4567</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value">john.doe@example.com</div>
        </div>
        <div class="info-row">
          <div class="info-label">Address Line 1:</div>
          <div class="info-value">123 Main Street</div>
        </div>
        <div class="info-row">
          <div class="info-label">Address Line 2:</div>
          <div class="info-value">Apt 4B</div>
        </div>
        <div class="info-row">
          <div class="info-label">City:</div>
          <div class="info-value">New York</div>
        </div>
        <div class="info-row">
          <div class="info-label">State:</div>
          <div class="info-value">NY</div>
        </div>
        <div class="info-row">
          <div class="info-label">Zip Code:</div>
          <div class="info-value">10001</div>
        </div>
        <div class="info-row">
          <div class="info-label">MRN:</div>
          <div class="info-value">MRN123456</div>
        </div>
        <div class="info-row">
          <div class="info-label">SSN:</div>
          <div class="info-value">123-45-6789</div>
        </div>
      </div>
    `;

    console.log('🔍 Testing Epic field extraction...');
    
    // Test individual field extraction
    const fields = [
      'firstName', 'lastName', 'middleName', 'dateOfBirth', 'gender',
      'phoneNumber', 'email', 'addressLine1', 'addressLine2', 'city', 'state', 'zipCode',
      'mrn', 'ssn'
    ];

    const results: { [key: string]: any } = {};
    
    for (const field of fields) {
      const result = await parser.extractField(field);
      results[field] = result;
      console.log(`Epic ${field}: ${result.value ? '✅' : '❌'} ${result.value || 'NOT FOUND'} (confidence: ${result.confidence})`);
    }

    // Test full parsing
    parser.resetDetection();
    const fullResult = await parser.parsePatientData();
    console.log('Epic Full Result:', fullResult);
  });
}); 