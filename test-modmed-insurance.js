const fs = require('fs');
const path = require('path');

// Read the ModMed mock HTML
const modmedHtml = fs.readFileSync(path.join(__dirname, 'test/fixtures/emr-pages/modmed-mock.html'), 'utf8');

// Test the parsing via fetch
async function testModMedInsurance() {
  try {
    console.log('🧪 Testing ModMed Insurance Extraction...');
    
    const response = await fetch('http://localhost:3000/api/parse-emr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: modmedHtml,
        url: 'http://localhost:3000/modmed-mock.html'
      })
    });

    const result = await response.json();
    console.log('✅ ModMed Insurance Test Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log('\n🎉 ModMed parsing successful!');
      console.log(`Patient: ${result.data.firstName} ${result.data.lastName}`);
      console.log(`DOB: ${result.data.dateOfBirth}`);
      console.log(`Phone: ${result.data.phoneNumber}`);
      
      // Check insurance data
      if (result.data.insurance) {
        console.log('\n📋 Insurance Information:');
        console.log(`Has Insurance: ${result.data.insurance.hasInsurance}`);
        
        if (result.data.insurance.primary) {
          console.log(`Primary Insurance: ${result.data.insurance.primary.company}`);
          console.log(`Plan Name: ${result.data.insurance.primary.planName}`);
          console.log(`Policy Number: ${result.data.insurance.primary.policyNumber}`);
          console.log(`Group Number: ${result.data.insurance.primary.groupNumber}`);
          console.log(`Policy Holder: ${result.data.insurance.primary.policyHolderName}`);
          console.log(`Relationship: ${result.data.insurance.primary.relationshipToPatient}`);
        }
        
        if (result.data.insurance.secondary) {
          console.log(`Secondary Insurance: ${result.data.insurance.secondary.company}`);
          console.log(`Secondary Policy: ${result.data.insurance.secondary.policyNumber}`);
        }
      } else {
        console.log('\n❌ No insurance data found');
      }
    } else {
      console.log('\n❌ ModMed parsing failed');
      console.log('Errors:', result.errors);
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure the web-app server is running: npm start');
  }
}

testModMedInsurance(); 