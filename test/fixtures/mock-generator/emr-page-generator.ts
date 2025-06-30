// EMR Page Generator
// Creates diverse mock EMR pages to test parser flexibility

interface PatientData {
  // Basic Demographics
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender?: string;
  maritalStatus?: string;
  ethnicity?: string;
  race?: string;
  preferredLanguage?: string;
  
  // Contact Information
  phoneNumber: string;
  email?: string;
  alternatePhone?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Address Information
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
  country?: string;
  
  // Medical Identifiers
  mrn?: string;
  ssn?: string;
  accountNumber?: string;
  chartNumber?: string;
  patientId?: string;
  
  // Insurance Information
  primaryInsurance?: {
    company: string;
    planName?: string;
    policyNumber: string;
    groupNumber?: string;
    policyHolderName: string;
    relationshipToPatient: string;
    policyHolderDOB?: string;
    effectiveDate?: string;
    terminationDate?: string;
  };
  secondaryInsurance?: {
    company?: string;
    policyNumber?: string;
    groupNumber?: string;
  };
  
  // Additional Medical Information
  primaryCarePhysician?: string;
  referringPhysician?: string;
  allergies?: string[];
  medications?: string[];
  diagnoses?: string[];
  height?: string;
  weight?: string;
  bloodType?: string;
  
  // Administrative
  registrationDate?: string;
  lastVisitDate?: string;
  nextAppointment?: string;
  department?: string;
  roomNumber?: string;
  bedNumber?: string;
}

interface InsuranceData {
  hasInsurance: boolean;
  primary?: {
    company: string;
    planName?: string;
    policyNumber: string;
    groupNumber?: string;
    policyHolderName: string;
    relationshipToPatient: string;
    policyHolderDOB?: string;
  };
  secondary?: {
    company?: string;
    policyNumber?: string;
  };
}

class EMRPageGenerator {
  private patientData: PatientData;
  private insuranceData: InsuranceData;
  
  constructor() {
    this.patientData = this.generateRandomPatientData();
    this.insuranceData = this.generateRandomInsuranceData();
  }

  private generateRandomPatientData(): PatientData {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'GA', 'NC'];
    const ethnicities = ['Hispanic', 'Non-Hispanic', 'Unknown'];
    const races = ['White', 'Black', 'Asian', 'Native American', 'Pacific Islander', 'Other', 'Unknown'];
    const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Korean'];
    const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const allergies = ['Penicillin', 'Latex', 'Peanuts', 'Shellfish', 'Dairy', 'None'];
    const medications = ['Lisinopril', 'Metformin', 'Atorvastatin', 'Amlodipine', 'None'];
    const diagnoses = ['Hypertension', 'Diabetes', 'Hyperlipidemia', 'Asthma', 'None'];

    return {
      // Basic Demographics
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      middleName: Math.random() > 0.5 ? 'A' : undefined,
      dateOfBirth: this.generateRandomDate(),
      gender: Math.random() > 0.3 ? (Math.random() > 0.5 ? 'Male' : 'Female') : undefined,
      maritalStatus: Math.random() > 0.3 ? maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)] : undefined,
      ethnicity: Math.random() > 0.4 ? ethnicities[Math.floor(Math.random() * ethnicities.length)] : undefined,
      race: Math.random() > 0.4 ? races[Math.floor(Math.random() * races.length)] : undefined,
      preferredLanguage: Math.random() > 0.6 ? languages[Math.floor(Math.random() * languages.length)] : undefined,
      
      // Contact Information
      phoneNumber: this.generateRandomPhone(),
      email: Math.random() > 0.2 ? `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}@email.com` : undefined,
      alternatePhone: Math.random() > 0.5 ? this.generateRandomPhone() : undefined,
      emergencyContact: Math.random() > 0.7 ? {
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        relationship: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend'][Math.floor(Math.random() * 5)],
        phone: this.generateRandomPhone()
      } : undefined,
      
      // Address Information
      addressLine1: `${Math.floor(Math.random() * 9999) + 1} Main St`,
      addressLine2: Math.random() > 0.7 ? 'Apt 2B' : undefined,
      city: cities[Math.floor(Math.random() * cities.length)],
      state: states[Math.floor(Math.random() * states.length)],
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      county: Math.random() > 0.6 ? `${cities[Math.floor(Math.random() * cities.length)]} County` : undefined,
      country: Math.random() > 0.8 ? 'USA' : undefined,
      
      // Medical Identifiers
      mrn: Math.random() > 0.3 ? `MRN${Math.floor(Math.random() * 999999)}` : undefined,
      ssn: Math.random() > 0.4 ? this.generateRandomSSN() : undefined,
      accountNumber: Math.random() > 0.5 ? `ACC${Math.floor(Math.random() * 999999999)}` : undefined,
      chartNumber: Math.random() > 0.4 ? `CHART${Math.floor(Math.random() * 999999)}` : undefined,
      patientId: Math.random() > 0.3 ? `PID${Math.floor(Math.random() * 999999999)}` : undefined,
      
      // Insurance Information
      primaryInsurance: Math.random() > 0.1 ? {
        company: ['Blue Cross', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana', 'Kaiser', 'Anthem', 'Molina'][Math.floor(Math.random() * 8)],
        planName: Math.random() > 0.5 ? ['Premium Plan', 'Standard Plan', 'Basic Plan'][Math.floor(Math.random() * 3)] : undefined,
        policyNumber: `POL${Math.floor(Math.random() * 999999999)}`,
        groupNumber: Math.random() > 0.6 ? `GRP${Math.floor(Math.random() * 999999)}` : undefined,
        policyHolderName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        relationshipToPatient: ['Self', 'Spouse', 'Child', 'Other'][Math.floor(Math.random() * 4)],
        policyHolderDOB: Math.random() > 0.5 ? this.generateRandomDate() : undefined,
        effectiveDate: Math.random() > 0.6 ? this.generateRandomDate() : undefined,
        terminationDate: Math.random() > 0.7 ? this.generateRandomDate() : undefined
      } : undefined,
      secondaryInsurance: Math.random() > 0.7 ? {
        company: ['Blue Cross', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana', 'Kaiser', 'Anthem', 'Molina'][Math.floor(Math.random() * 8)],
        policyNumber: `POL${Math.floor(Math.random() * 999999999)}`,
        groupNumber: Math.random() > 0.6 ? `GRP${Math.floor(Math.random() * 999999)}` : undefined
      } : undefined,
      
      // Additional Medical Information
      primaryCarePhysician: Math.random() > 0.4 ? `Dr. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}` : undefined,
      referringPhysician: Math.random() > 0.6 ? `Dr. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}` : undefined,
      allergies: Math.random() > 0.3 ? [allergies[Math.floor(Math.random() * allergies.length)]] : undefined,
      medications: Math.random() > 0.4 ? [medications[Math.floor(Math.random() * medications.length)]] : undefined,
      diagnoses: Math.random() > 0.5 ? [diagnoses[Math.floor(Math.random() * diagnoses.length)]] : undefined,
      height: Math.random() > 0.6 ? `${Math.floor(Math.random() * 2) + 5}'${Math.floor(Math.random() * 12)}"` : undefined,
      weight: Math.random() > 0.6 ? `${Math.floor(Math.random() * 200) + 100} lbs` : undefined,
      bloodType: Math.random() > 0.7 ? bloodTypes[Math.floor(Math.random() * bloodTypes.length)] : undefined,
      
      // Administrative
      registrationDate: Math.random() > 0.5 ? this.generateRandomDate() : undefined,
      lastVisitDate: Math.random() > 0.6 ? this.generateRandomDate() : undefined,
      nextAppointment: Math.random() > 0.7 ? this.generateRandomDate() : undefined,
      department: Math.random() > 0.5 ? ['Cardiology', 'Radiology', 'Emergency', 'Primary Care', 'Orthopedics'][Math.floor(Math.random() * 5)] : undefined,
      roomNumber: Math.random() > 0.8 ? `${Math.floor(Math.random() * 20) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}` : undefined,
      bedNumber: Math.random() > 0.8 ? `${Math.floor(Math.random() * 10) + 1}` : undefined
    };
  }

  private generateRandomInsuranceData(): InsuranceData {
    const companies = ['Blue Cross', 'Aetna', 'Cigna', 'UnitedHealth', 'Humana', 'Kaiser', 'Anthem', 'Molina'];
    const relationships = ['Self', 'Spouse', 'Child', 'Other'];

    const hasInsurance = Math.random() > 0.1;
    
    if (!hasInsurance) {
      return { hasInsurance: false };
    }

    return {
      hasInsurance: true,
      primary: {
        company: companies[Math.floor(Math.random() * companies.length)],
        planName: Math.random() > 0.5 ? 'Premium Plan' : undefined,
        policyNumber: `POL${Math.floor(Math.random() * 999999999)}`,
        groupNumber: Math.random() > 0.6 ? `GRP${Math.floor(Math.random() * 999999)}` : undefined,
        policyHolderName: `${this.patientData.firstName} ${this.patientData.lastName}`,
        relationshipToPatient: relationships[Math.floor(Math.random() * relationships.length)],
        policyHolderDOB: Math.random() > 0.5 ? this.generateRandomDate() : undefined
      },
      secondary: Math.random() > 0.7 ? {
        company: companies[Math.floor(Math.random() * companies.length)],
        policyNumber: `POL${Math.floor(Math.random() * 999999999)}`
      } : undefined
    };
  }

  private generateRandomDate(): string {
    const year = Math.floor(Math.random() * 50) + 1950;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
  }

  private generateRandomPhone(): string {
    const area = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 9000) + 1000;
    return `(${area}) ${prefix}-${line}`;
  }

  private generateRandomSSN(): string {
    const part1 = Math.floor(Math.random() * 900) + 100;
    const part2 = Math.floor(Math.random() * 90) + 10;
    const part3 = Math.floor(Math.random() * 9000) + 1000;
    return `${part1}-${part2}-${part3}`;
  }

  // Generate different layout structures
  generatePage(layoutType: 'table' | 'div' | 'form' | 'mixed' | 'complex' = 'mixed'): string {
    const layouts = {
      table: this.generateTableLayout,
      div: this.generateDivLayout,
      form: this.generateFormLayout,
      mixed: this.generateMixedLayout,
      complex: this.generateComplexLayout
    };

    return layouts[layoutType].call(this);
  }

  private generateTableLayout(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Patient Summary - Table Layout</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .section { margin: 20px 0; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <h1>Patient Information</h1>
    
    <div class="section">
        <div class="section-title">Demographics</div>
        <table>
            <tr><th>First Name</th><td>${this.patientData.firstName}</td><th>Last Name</th><td>${this.patientData.lastName}</td></tr>
            ${this.patientData.middleName ? `<tr><th>Middle Name</th><td>${this.patientData.middleName}</td><th>Date of Birth</th><td>${this.patientData.dateOfBirth}</td></tr>` : ''}
            <tr><th>Date of Birth</th><td>${this.patientData.dateOfBirth}</td><th>Gender</th><td>${this.patientData.gender || 'N/A'}</td></tr>
            <tr><th>Phone</th><td>${this.patientData.phoneNumber}</td><th>Email</th><td>${this.patientData.email || 'N/A'}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Address</div>
        <table>
            <tr><th>Address Line 1</th><td>${this.patientData.addressLine1}</td></tr>
            ${this.patientData.addressLine2 ? `<tr><th>Address Line 2</th><td>${this.patientData.addressLine2}</td></tr>` : ''}
            <tr><th>City</th><td>${this.patientData.city}</td><th>State</th><td>${this.patientData.state}</td></tr>
            <tr><th>Zip Code</th><td>${this.patientData.zipCode}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Identifiers</div>
        <table>
            ${this.patientData.mrn ? `<tr><th>Medical Record Number</th><td>${this.patientData.mrn}</td></tr>` : ''}
            ${this.patientData.ssn ? `<tr><th>Social Security Number</th><td>${this.patientData.ssn}</td></tr>` : ''}
        </table>
    </div>

    ${this.insuranceData.hasInsurance ? `
    <div class="section">
        <div class="section-title">Insurance Information</div>
        <table>
            <tr><th>Primary Insurance</th><td>${this.insuranceData.primary?.company}</td></tr>
            <tr><th>Policy Number</th><td>${this.insuranceData.primary?.policyNumber}</td></tr>
            <tr><th>Group Number</th><td>${this.insuranceData.primary?.groupNumber || 'N/A'}</td></tr>
            <tr><th>Policy Holder</th><td>${this.insuranceData.primary?.policyHolderName}</td></tr>
            <tr><th>Relationship</th><td>${this.insuranceData.primary?.relationshipToPatient}</td></tr>
        </table>
    </div>
    ` : ''}
</body>
</html>`;
  }

  private generateDivLayout(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Patient Summary - Div Layout</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .field { margin: 10px 0; display: flex; }
        .label { font-weight: bold; width: 150px; }
        .value { flex: 1; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Patient Summary</h1>
        
        <div class="section">
            <div class="section-title">Patient Demographics</div>
            <div class="field">
                <div class="label">First Name:</div>
                <div class="value">${this.patientData.firstName}</div>
            </div>
            <div class="field">
                <div class="label">Last Name:</div>
                <div class="value">${this.patientData.lastName}</div>
            </div>
            ${this.patientData.middleName ? `
            <div class="field">
                <div class="label">Middle Name:</div>
                <div class="value">${this.patientData.middleName}</div>
            </div>
            ` : ''}
            <div class="field">
                <div class="label">Date of Birth:</div>
                <div class="value">${this.patientData.dateOfBirth}</div>
            </div>
            <div class="field">
                <div class="label">Gender:</div>
                <div class="value">${this.patientData.gender || 'Not specified'}</div>
            </div>
            <div class="field">
                <div class="label">Phone Number:</div>
                <div class="value">${this.patientData.phoneNumber}</div>
            </div>
            ${this.patientData.email ? `
            <div class="field">
                <div class="label">Email Address:</div>
                <div class="value">${this.patientData.email}</div>
            </div>
            ` : ''}
        </div>

        <div class="section">
            <div class="section-title">Address Information</div>
            <div class="field">
                <div class="label">Address Line 1:</div>
                <div class="value">${this.patientData.addressLine1}</div>
            </div>
            ${this.patientData.addressLine2 ? `
            <div class="field">
                <div class="label">Address Line 2:</div>
                <div class="value">${this.patientData.addressLine2}</div>
            </div>
            ` : ''}
            <div class="field">
                <div class="label">City:</div>
                <div class="value">${this.patientData.city}</div>
            </div>
            <div class="field">
                <div class="label">State:</div>
                <div class="value">${this.patientData.state}</div>
            </div>
            <div class="field">
                <div class="label">Zip Code:</div>
                <div class="value">${this.patientData.zipCode}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Patient Identifiers</div>
            ${this.patientData.mrn ? `
            <div class="field">
                <div class="label">Medical Record Number:</div>
                <div class="value">${this.patientData.mrn}</div>
            </div>
            ` : ''}
            ${this.patientData.ssn ? `
            <div class="field">
                <div class="label">Social Security Number:</div>
                <div class="value">${this.patientData.ssn}</div>
            </div>
            ` : ''}
        </div>

        ${this.insuranceData.hasInsurance ? `
        <div class="section">
            <div class="section-title">Insurance Details</div>
            <div class="field">
                <div class="label">Primary Insurance:</div>
                <div class="value">${this.insuranceData.primary?.company}</div>
            </div>
            <div class="field">
                <div class="label">Policy Number:</div>
                <div class="value">${this.insuranceData.primary?.policyNumber}</div>
            </div>
            <div class="field">
                <div class="label">Group Number:</div>
                <div class="value">${this.insuranceData.primary?.groupNumber || 'Not provided'}</div>
            </div>
            <div class="field">
                <div class="label">Policy Holder:</div>
                <div class="value">${this.insuranceData.primary?.policyHolderName}</div>
            </div>
            <div class="field">
                <div class="label">Relationship:</div>
                <div class="value">${this.insuranceData.primary?.relationshipToPatient}</div>
            </div>
        </div>
        ` : ''}
    </div>
</body>
</html>`;
  }

  private generateFormLayout(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Patient Summary - Form Layout</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .form-section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
        .form-group { margin: 10px 0; }
        label { display: inline-block; width: 150px; font-weight: bold; }
        input, select { padding: 5px; border: 1px solid #ddd; border-radius: 3px; }
        .readonly { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Patient Information Form</h1>
    
    <div class="form-section">
        <h3>Demographics</h3>
        <div class="form-group">
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" value="${this.patientData.firstName}" readonly class="readonly">
        </div>
        <div class="form-group">
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" value="${this.patientData.lastName}" readonly class="readonly">
        </div>
        ${this.patientData.middleName ? `
        <div class="form-group">
            <label for="middleName">Middle Name:</label>
            <input type="text" id="middleName" value="${this.patientData.middleName}" readonly class="readonly">
        </div>
        ` : ''}
        <div class="form-group">
            <label for="dob">Date of Birth:</label>
            <input type="text" id="dob" value="${this.patientData.dateOfBirth}" readonly class="readonly">
        </div>
        <div class="form-group">
            <label for="gender">Gender:</label>
            <select id="gender" disabled>
                <option value="Male" ${this.patientData.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${this.patientData.gender === 'Female' ? 'selected' : ''}>Female</option>
                <option value="Other" ${this.patientData.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
        </div>
        <div class="form-group">
            <label for="phone">Phone Number:</label>
            <input type="tel" id="phone" value="${this.patientData.phoneNumber}" readonly class="readonly">
        </div>
        ${this.patientData.email ? `
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" value="${this.patientData.email}" readonly class="readonly">
        </div>
        ` : ''}
    </div>

    <div class="form-section">
        <h3>Address</h3>
        <div class="form-group">
            <label for="address1">Address Line 1:</label>
            <input type="text" id="address1" value="${this.patientData.addressLine1}" readonly class="readonly">
        </div>
        ${this.patientData.addressLine2 ? `
        <div class="form-group">
            <label for="address2">Address Line 2:</label>
            <input type="text" id="address2" value="${this.patientData.addressLine2}" readonly class="readonly">
        </div>
        ` : ''}
        <div class="form-group">
            <label for="city">City:</label>
            <input type="text" id="city" value="${this.patientData.city}" readonly class="readonly">
        </div>
        <div class="form-group">
            <label for="state">State:</label>
            <input type="text" id="state" value="${this.patientData.state}" readonly class="readonly">
        </div>
        <div class="form-group">
            <label for="zip">Zip Code:</label>
            <input type="text" id="zip" value="${this.patientData.zipCode}" readonly class="readonly">
        </div>
    </div>

    <div class="form-section">
        <h3>Identifiers</h3>
        ${this.patientData.mrn ? `
        <div class="form-group">
            <label for="mrn">Medical Record Number:</label>
            <input type="text" id="mrn" value="${this.patientData.mrn}" readonly class="readonly">
        </div>
        ` : ''}
        ${this.patientData.ssn ? `
        <div class="form-group">
            <label for="ssn">Social Security Number:</label>
            <input type="text" id="ssn" value="${this.patientData.ssn}" readonly class="readonly">
        </div>
        ` : ''}
    </div>

    ${this.insuranceData.hasInsurance ? `
    <div class="form-section">
        <h3>Insurance</h3>
        <div class="form-group">
            <label for="insurance">Primary Insurance:</label>
            <input type="text" id="insurance" value="${this.insuranceData.primary?.company}" readonly class="readonly">
        </div>
        <div class="form-group">
            <label for="policy">Policy Number:</label>
            <input type="text" id="policy" value="${this.insuranceData.primary?.policyNumber}" readonly class="readonly">
        </div>
        <div class="form-group">
            <label for="group">Group Number:</label>
            <input type="text" id="group" value="${this.insuranceData.primary?.groupNumber || ''}" readonly class="readonly">
        </div>
        <div class="form-group">
            <label for="holder">Policy Holder:</label>
            <input type="text" id="holder" value="${this.insuranceData.primary?.policyHolderName}" readonly class="readonly">
        </div>
        <div class="form-group">
            <label for="relationship">Relationship:</label>
            <select id="relationship" disabled>
                <option value="Self" ${this.insuranceData.primary?.relationshipToPatient === 'Self' ? 'selected' : ''}>Self</option>
                <option value="Spouse" ${this.insuranceData.primary?.relationshipToPatient === 'Spouse' ? 'selected' : ''}>Spouse</option>
                <option value="Child" ${this.insuranceData.primary?.relationshipToPatient === 'Child' ? 'selected' : ''}>Child</option>
                <option value="Other" ${this.insuranceData.primary?.relationshipToPatient === 'Other' ? 'selected' : ''}>Other</option>
            </select>
        </div>
    </div>
    ` : ''}
</body>
</html>`;
  }

  private generateMixedLayout(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Patient Summary - Mixed Layout</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { margin-left: 10px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .highlight { background-color: #fff3cd; padding: 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Patient Summary Report</h1>
        
        <div class="section">
            <div class="section-title">Patient Demographics</div>
            <div class="field">
                <span class="label">Name:</span>
                <span class="value">${this.patientData.firstName} ${this.patientData.middleName || ''} ${this.patientData.lastName}</span>
            </div>
            <div class="field">
                <span class="label">Date of Birth:</span>
                <span class="value">${this.patientData.dateOfBirth}</span>
            </div>
            <div class="field">
                <span class="label">Gender:</span>
                <span class="value">${this.patientData.gender || 'Not specified'}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Contact Information</div>
            <table>
                <tr><th>Phone Number</th><td>${this.patientData.phoneNumber}</td></tr>
                ${this.patientData.email ? `<tr><th>Email Address</th><td>${this.patientData.email}</td></tr>` : ''}
            </table>
        </div>

        <div class="section">
            <div class="section-title">Address Details</div>
            <div class="field">
                <span class="label">Street Address:</span>
                <span class="value">${this.patientData.addressLine1}</span>
            </div>
            ${this.patientData.addressLine2 ? `
            <div class="field">
                <span class="label">Additional Address:</span>
                <span class="value">${this.patientData.addressLine2}</span>
            </div>
            ` : ''}
            <div class="field">
                <span class="label">City, State, Zip:</span>
                <span class="value">${this.patientData.city}, ${this.patientData.state} ${this.patientData.zipCode}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Patient Identifiers</div>
            <div class="highlight">
                ${this.patientData.mrn ? `<div class="field"><span class="label">MRN:</span> <span class="value">${this.patientData.mrn}</span></div>` : ''}
                ${this.patientData.ssn ? `<div class="field"><span class="label">SSN:</span> <span class="value">${this.patientData.ssn}</span></div>` : ''}
            </div>
        </div>

        ${this.insuranceData.hasInsurance ? `
        <div class="section">
            <div class="section-title">Insurance Information</div>
            <table>
                <tr><th>Insurance Company</th><td>${this.insuranceData.primary?.company}</td></tr>
                <tr><th>Policy Number</th><td>${this.insuranceData.primary?.policyNumber}</td></tr>
                <tr><th>Group Number</th><td>${this.insuranceData.primary?.groupNumber || 'N/A'}</td></tr>
                <tr><th>Policy Holder</th><td>${this.insuranceData.primary?.policyHolderName}</td></tr>
                <tr><th>Relationship</th><td>${this.insuranceData.primary?.relationshipToPatient}</td></tr>
            </table>
        </div>
        ` : ''}
    </div>
</body>
</html>`;
  }

  private generateComplexLayout(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Patient Summary - Complex Layout</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { display: flex; gap: 20px; }
        .main-content { flex: 2; }
        .sidebar { flex: 1; }
        .card { background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .card-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        .field-group { display: flex; margin-bottom: 10px; }
        .field-label { font-weight: bold; width: 120px; color: #555; }
        .field-value { flex: 1; }
        .status-badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .status-active { background-color: #d4edda; color: #155724; }
        .status-inactive { background-color: #f8d7da; color: #721c24; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .highlight-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 3px; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Patient Summary Dashboard</h1>
            <p>Comprehensive patient information and status</p>
        </div>
        
        <div class="content">
            <div class="main-content">
                <div class="card">
                    <div class="card-title">Patient Demographics</div>
                    <div class="grid">
                        <div class="field-group">
                            <div class="field-label">First Name:</div>
                            <div class="field-value">${this.patientData.firstName}</div>
                        </div>
                        <div class="field-group">
                            <div class="field-label">Last Name:</div>
                            <div class="field-value">${this.patientData.lastName}</div>
                        </div>
                        ${this.patientData.middleName ? `
                        <div class="field-group">
                            <div class="field-label">Middle Name:</div>
                            <div class="field-value">${this.patientData.middleName}</div>
                        </div>
                        ` : ''}
                        <div class="field-group">
                            <div class="field-label">Date of Birth:</div>
                            <div class="field-value">${this.patientData.dateOfBirth}</div>
                        </div>
                        <div class="field-group">
                            <div class="field-label">Gender:</div>
                            <div class="field-value">
                                ${this.patientData.gender || 'Not specified'}
                                ${this.patientData.gender ? '<span class="status-badge status-active">Active</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">Contact Information</div>
                    <div class="field-group">
                        <div class="field-label">Phone Number:</div>
                        <div class="field-value">${this.patientData.phoneNumber}</div>
                    </div>
                    ${this.patientData.email ? `
                    <div class="field-group">
                        <div class="field-label">Email Address:</div>
                        <div class="field-value">${this.patientData.email}</div>
                    </div>
                    ` : ''}
                </div>

                <div class="card">
                    <div class="card-title">Address Information</div>
                    <div class="field-group">
                        <div class="field-label">Street Address:</div>
                        <div class="field-value">${this.patientData.addressLine1}</div>
                    </div>
                    ${this.patientData.addressLine2 ? `
                    <div class="field-group">
                        <div class="field-label">Additional Address:</div>
                        <div class="field-value">${this.patientData.addressLine2}</div>
                    </div>
                    ` : ''}
                    <div class="field-group">
                        <div class="field-label">City, State, Zip:</div>
                        <div class="field-value">${this.patientData.city}, ${this.patientData.state} ${this.patientData.zipCode}</div>
                    </div>
                </div>
            </div>

            <div class="sidebar">
                <div class="card">
                    <div class="card-title">Patient Identifiers</div>
                    ${this.patientData.mrn ? `
                    <div class="field-group">
                        <div class="field-label">MRN:</div>
                        <div class="field-value">${this.patientData.mrn}</div>
                    </div>
                    ` : ''}
                    ${this.patientData.ssn ? `
                    <div class="field-group">
                        <div class="field-label">SSN:</div>
                        <div class="field-value">${this.patientData.ssn}</div>
                    </div>
                    ` : ''}
                    <div class="highlight-box">
                        <strong>Note:</strong> All identifiers are securely stored and encrypted.
                    </div>
                </div>

                ${this.insuranceData.hasInsurance ? `
                <div class="card">
                    <div class="card-title">Insurance Status</div>
                    <div class="field-group">
                        <div class="field-label">Primary:</div>
                        <div class="field-value">${this.insuranceData.primary?.company}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Policy #:</div>
                        <div class="field-value">${this.insuranceData.primary?.policyNumber}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Group #:</div>
                        <div class="field-value">${this.insuranceData.primary?.groupNumber || 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Policy Holder:</div>
                        <div class="field-value">${this.insuranceData.primary?.policyHolderName}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Relationship:</div>
                        <div class="field-value">${this.insuranceData.primary?.relationshipToPatient}</div>
                    </div>
                    <span class="status-badge status-active">Active Coverage</span>
                </div>
                ` : `
                <div class="card">
                    <div class="card-title">Insurance Status</div>
                    <span class="status-badge status-inactive">No Insurance</span>
                </div>
                `}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  // Generate a completely random layout
  generateRandomPage(): string {
    const layoutTypes = ['table', 'div', 'form', 'mixed', 'complex'];
    const randomLayout = layoutTypes[Math.floor(Math.random() * layoutTypes.length)];
    return this.generatePage(randomLayout as any);
  }

  // Generate multiple pages for batch testing
  generateBatch(count: number = 10): string[] {
    const pages: string[] = [];
    for (let i = 0; i < count; i++) {
      pages.push(this.generateRandomPage());
    }
    return pages;
  }

  // Get the current patient data for validation
  getPatientData(): PatientData {
    return { ...this.patientData };
  }

  // Get the current insurance data for validation
  getInsuranceData(): InsuranceData {
    return { ...this.insuranceData };
  }
}

export { EMRPageGenerator, PatientData, InsuranceData }; 