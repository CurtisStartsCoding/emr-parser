import { SimpleUniversalParser } from '../src/lib/simple-universal-parser';

describe('Simple Universal Parser Tests', () => {
  let parser: SimpleUniversalParser;

  beforeEach(() => {
    document.body.innerHTML = '';
    parser = new SimpleUniversalParser(true); // Enable debug mode
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should parse ECW data with simplified approach', async () => {
    // Set up ECW HTML
    document.body.innerHTML = `
      <div class="ecw-container">
        <div class="ecw-patient-info">
          <div class="ecw-label">First Name:</div>
          <div class="ecw-value">David</div>
          <div class="ecw-label">Last Name:</div>
          <div class="ecw-value">Wilson</div>
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
          <div class="ecw-label">Insurance Company:</div>
          <div class="ecw-value">UnitedHealth</div>
          <div class="ecw-label">Middle Name:</div>
          <div class="ecw-value">Alan</div>
          <div class="ecw-label">Address Line 2:</div>
          <div class="ecw-value">Apt 101</div>
          <div class="ecw-label">MRN:</div>
          <div class="ecw-value">ECW123456</div>
          <div class="ecw-label">SSN:</div>
          <div class="ecw-value">123-45-6789</div>
        </div>
      </div>
    `;

    console.log('🔍 Testing ECW with simplified parser...');
    
    const result = await parser.parsePatientData();
    console.log('ECW Result:', result);

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('simple-universal');
    expect(result.confidence).toBeGreaterThan(0.5);
    
    expect(result.data?.firstName).toBe('David');
    expect(result.data?.lastName).toBe('Wilson');
    expect(result.data?.dateOfBirth).toBe('03/15/1970');
    expect(result.data?.gender).toBe('Male');
    expect(result.data?.phoneNumber).toBe('(555) 789-0123');
    expect(result.data?.email).toBe('david.wilson@email.com');
    expect(result.data?.addressLine1).toBe('567 Cedar Ln');
    expect(result.data?.city).toBe('Miami');
    expect(result.data?.state).toBe('FL');
    expect(result.data?.zipCode).toBe('33101');
    expect(result.data?.insurance?.hasInsurance).toBe(true);
    expect(result.data?.insurance?.primary?.company).toBe('UnitedHealth');
    expect(result.data?.middleName).toBe('Alan');
    expect(result.data?.addressLine2).toBe('Apt 101');
    expect(result.data?.mrn).toBe('ECW123456');
    expect(result.data?.ssn).toBe('123-45-6789');
  });

  it('should parse Athenahealth data with simplified approach', async () => {
    // Set up Athenahealth HTML
    document.body.innerHTML = `
      <div data-athena="true" class="athena-container">
        <div class="athena-patient-info">
          <div class="detail-label">First Name:</div>
          <div class="detail-value">Lisa</div>
          <div class="detail-label">Last Name:</div>
          <div class="detail-value">Anderson</div>
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
          <div class="detail-label">Insurance Company:</div>
          <div class="detail-value">Blue Cross</div>
          <div class="detail-label">Middle Name:</div>
          <div class="detail-value">Marie</div>
          <div class="detail-label">Address Line 2:</div>
          <div class="detail-value">Suite 200</div>
          <div class="detail-label">MRN:</div>
          <div class="detail-value">ATH654321</div>
          <div class="detail-label">SSN:</div>
          <div class="detail-value">987-65-4321</div>
        </div>
      </div>
    `;

    console.log('🔍 Testing Athenahealth with simplified parser...');
    
    const result = await parser.parsePatientData();
    console.log('Athenahealth Result:', result);

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('simple-universal');
    expect(result.confidence).toBeGreaterThan(0.5);
    
    expect(result.data?.firstName).toBe('Lisa');
    expect(result.data?.lastName).toBe('Anderson');
    expect(result.data?.dateOfBirth).toBe('09/28/1988');
    expect(result.data?.gender).toBe('Female');
    expect(result.data?.phoneNumber).toBe('(555) 654-3210');
    expect(result.data?.email).toBe('lisa.anderson@email.com');
    expect(result.data?.addressLine1).toBe('890 Birch Rd');
    expect(result.data?.city).toBe('Seattle');
    expect(result.data?.state).toBe('WA');
    expect(result.data?.zipCode).toBe('98101');
    expect(result.data?.insurance?.hasInsurance).toBe(true);
    expect(result.data?.insurance?.primary?.company).toBe('Blue Cross');
    expect(result.data?.middleName).toBe('Marie');
    expect(result.data?.addressLine2).toBe('Suite 200');
    expect(result.data?.mrn).toBe('ATH654321');
    expect(result.data?.ssn).toBe('987-65-4321');
  });

  it('should parse Epic data with simplified approach', async () => {
    // Set up Epic HTML
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
          <div class="info-label">Middle Name:</div>
          <div class="info-value">Paul</div>
        </div>
        <div class="info-row">
          <div class="info-label">Address Line 2:</div>
          <div class="info-value">Floor 3</div>
        </div>
        <div class="info-row">
          <div class="info-label">MRN:</div>
          <div class="info-value">EPI789012</div>
        </div>
        <div class="info-row">
          <div class="info-label">SSN:</div>
          <div class="info-value">321-54-9876</div>
        </div>
      </div>
    `;

    console.log('🔍 Testing Epic with simplified parser...');
    
    const result = await parser.parsePatientData();
    console.log('Epic Result:', result);

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('simple-universal');
    expect(result.confidence).toBeGreaterThan(0.5);
    
    expect(result.data?.firstName).toBe('John');
    expect(result.data?.lastName).toBe('Doe');
    expect(result.data?.dateOfBirth).toBe('01/15/1980');
    expect(result.data?.gender).toBe('Male');
    expect(result.data?.phoneNumber).toBe('(555) 123-4567');
    expect(result.data?.email).toBe('john.doe@example.com');
    expect(result.data?.addressLine1).toBe('123 Main Street');
    expect(result.data?.city).toBe('New York');
    expect(result.data?.state).toBe('NY');
    expect(result.data?.zipCode).toBe('10001');
    expect(result.data?.middleName).toBe('Paul');
    expect(result.data?.addressLine2).toBe('Floor 3');
    expect(result.data?.mrn).toBe('EPI789012');
    expect(result.data?.ssn).toBe('321-54-9876');
  });

  it('should parse Onco data with simplified approach', async () => {
    // Set up Onco HTML
    document.body.innerHTML = `
      <div data-onco="true" class="onco-container">
        <div class="onco-patient-info">
          <div class="detail-label">First Name:</div>
          <div class="detail-value">Michael</div>
          <div class="detail-label">Last Name:</div>
          <div class="detail-value">Johnson</div>
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
          <div class="detail-label">Middle Name:</div>
          <div class="detail-value">Lee</div>
          <div class="detail-label">Address Line 2:</div>
          <div class="detail-value">Unit 5B</div>
          <div class="detail-label">MRN:</div>
          <div class="detail-value">ONC345678</div>
          <div class="detail-label">SSN:</div>
          <div class="detail-value">654-32-1987</div>
        </div>
      </div>
    `;

    console.log('🔍 Testing Onco with simplified parser...');
    
    const result = await parser.parsePatientData();
    console.log('Onco Result:', result);

    expect(result.success).toBe(true);
    expect(result.strategy).toBe('simple-universal');
    expect(result.confidence).toBeGreaterThan(0.5);
    
    expect(result.data?.firstName).toBe('Michael');
    expect(result.data?.lastName).toBe('Johnson');
    expect(result.data?.dateOfBirth).toBe('12/05/1975');
    expect(result.data?.gender).toBe('Male');
    expect(result.data?.phoneNumber).toBe('(555) 321-0987');
    expect(result.data?.email).toBe('michael.johnson@email.com');
    expect(result.data?.addressLine1).toBe('123 Oak St');
    expect(result.data?.city).toBe('Chicago');
    expect(result.data?.state).toBe('IL');
    expect(result.data?.zipCode).toBe('60601');
    expect(result.data?.middleName).toBe('Lee');
    expect(result.data?.addressLine2).toBe('Unit 5B');
    expect(result.data?.mrn).toBe('ONC345678');
    expect(result.data?.ssn).toBe('654-32-1987');
  });
}); 