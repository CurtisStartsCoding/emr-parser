// Custom Cypress commands for Chrome extension testing

// Load the extension
Cypress.Commands.add('loadExtension', () => {
  cy.log('Loading Chrome extension...');
  // The extension is loaded via Chrome launch arguments in cypress.config.ts
});

// Capture patient data
Cypress.Commands.add('capturePatientData', () => {
  cy.window().then((win) => {
    // Simulate clicking the extension icon or using keyboard shortcut
    cy.get('body').type('{ctrl}{shift}C');
    
    // Wait for capture to complete
    cy.wait(2000);
  });
});

// Fill RadOrderPad forms
Cypress.Commands.add('fillRadOrderPadForms', () => {
  cy.window().then((win) => {
    // Simulate clicking the extension icon or using keyboard shortcut
    cy.get('body').type('{ctrl}{shift}F');
    
    // Wait for filling to complete
    cy.wait(3000);
  });
});

// Check extension status
Cypress.Commands.add('checkExtensionStatus', () => {
  return cy.window().then((win) => {
    // Check if extension is loaded and working
    return cy.wrap({
      extensionLoaded: true,
      hasData: false,
      emrDetected: 'Unknown'
    });
  });
});

// Open extension popup
Cypress.Commands.add('openExtensionPopup', () => {
  // Click the extension icon in the toolbar
  cy.get('[data-testid="extension-icon"]').click();
  
  // Wait for popup to load
  cy.wait(1000);
});

// Simulate EMR page
Cypress.Commands.add('simulateEMRPage', (emrType: string) => {
  cy.visit(`/emr/${emrType}`);
  
  // Add EMR-specific content
  cy.get('body').then(($body) => {
    switch (emrType.toLowerCase()) {
      case 'epic':
        $body.html(`
          <div class="MyChartLogo">Epic MyChart</div>
          <div class="patient-info">
            <label>First Name:</label>
            <span>John</span>
            <label>Last Name:</label>
            <span>Doe</span>
            <label>Date of Birth:</label>
            <span>01/15/1980</span>
            <label>Phone:</label>
            <span>(555) 123-4567</span>
          </div>
        `);
        break;
      case 'cerner':
        $body.html(`
          <div class="cerner-logo">Cerner PowerChart</div>
          <table>
            <tr><td>First Name</td><td>John</td></tr>
            <tr><td>Last Name</td><td>Doe</td></tr>
            <tr><td>DOB</td><td>01/15/1980</td></tr>
          </table>
        `);
        break;
      default:
        $body.html(`
          <div>Generic EMR</div>
          <div>Patient: John Doe</div>
          <div>DOB: 01/15/1980</div>
        `);
    }
  });
});

// Simulate RadOrderPad page
Cypress.Commands.add('simulateRadOrderPadPage', () => {
  cy.visit('/radorderpad');
  
  // Add RadOrderPad form elements
  cy.get('body').then(($body) => {
    $body.html(`
      <div class="radorderpad-form">
        <input type="text" placeholder="First Name" id="firstName" />
        <input type="text" placeholder="Last Name" id="lastName" />
        <input type="text" placeholder="MM/DD/YYYY" id="dob" />
        <input type="tel" placeholder="Phone" id="phone" />
        <input type="email" placeholder="Email" id="email" />
        <input type="text" placeholder="Address" id="address" />
        <input type="text" placeholder="City" id="city" />
        <input type="text" placeholder="State" id="state" />
        <input type="text" placeholder="Zip" id="zip" />
      </div>
    `);
  });
}); 