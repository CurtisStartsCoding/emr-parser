const fs = require('fs');
const path = require('path');

// Read the ModMed mock HTML
const modmedHtml = fs.readFileSync(path.join(__dirname, 'test/fixtures/emr-pages/modmed-mock.html'), 'utf8');

// Test the parsing via fetch
async function testModMedAPI() {
  try {
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
    console.log('✅ ModMed API Test Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log('\n🎉 ModMed parsing successful!');
      console.log(`Patient: ${result.data.firstName} ${result.data.lastName}`);
      console.log(`DOB: ${result.data.dateOfBirth}`);
      console.log(`Phone: ${result.data.phoneNumber}`);
    } else {
      console.log('\n❌ ModMed parsing failed');
      console.log('Errors:', result.errors);
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('Make sure the web-app server is running: npm start');
  }
}

testModMedAPI(); 