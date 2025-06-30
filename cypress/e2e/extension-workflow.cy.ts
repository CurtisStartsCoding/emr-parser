// E2E test for complete extension workflow
describe('RadOrderPad Extension E2E Workflow', () => {
  beforeEach(() => {
    // Load the extension before each test
    cy.loadExtension();
  });

  it('should capture patient data from Epic EMR and fill RadOrderPad forms', () => {
    // Step 1: Navigate to Epic EMR page
    cy.simulateEMRPage('epic');
    
    // Step 2: Verify EMR page is loaded
    cy.get('.MyChartLogo').should('contain', 'Epic MyChart');
    cy.get('.patient-info').should('exist');
    
    // Step 3: Capture patient data
    cy.capturePatientData();
    
    // Step 4: Check extension status
    cy.checkExtensionStatus().then((status) => {
      expect(status.extensionLoaded).to.be.true;
    });
    
    // Step 5: Navigate to RadOrderPad
    cy.simulateRadOrderPadPage();
    
    // Step 6: Verify RadOrderPad page is loaded
    cy.get('.radorderpad-form').should('exist');
    cy.get('#firstName').should('exist');
    cy.get('#lastName').should('exist');
    
    // Step 7: Fill forms with captured data
    cy.fillRadOrderPadForms();
    
    // Step 8: Verify forms are filled
    cy.get('#firstName').should('have.value', 'John');
    cy.get('#lastName').should('have.value', 'Doe');
    cy.get('#dob').should('have.value', '01/15/1980');
    cy.get('#phone').should('have.value', '(555) 123-4567');
  });

  it('should capture patient data from Cerner EMR and fill RadOrderPad forms', () => {
    // Step 1: Navigate to Cerner EMR page
    cy.simulateEMRPage('cerner');
    
    // Step 2: Verify EMR page is loaded
    cy.get('.cerner-logo').should('contain', 'Cerner PowerChart');
    cy.get('table').should('exist');
    
    // Step 3: Capture patient data
    cy.capturePatientData();
    
    // Step 4: Navigate to RadOrderPad
    cy.simulateRadOrderPadPage();
    
    // Step 5: Fill forms with captured data
    cy.fillRadOrderPadForms();
    
    // Step 6: Verify forms are filled
    cy.get('#firstName').should('have.value', 'John');
    cy.get('#lastName').should('have.value', 'Doe');
    cy.get('#dob').should('have.value', '01/15/1980');
  });

  it('should handle keyboard shortcuts correctly', () => {
    // Navigate to EMR page
    cy.simulateEMRPage('epic');
    
    // Test Ctrl+Shift+C for capture
    cy.get('body').type('{ctrl}{shift}C');
    cy.wait(2000);
    
    // Navigate to RadOrderPad
    cy.simulateRadOrderPadPage();
    
    // Test Ctrl+Shift+F for fill
    cy.get('body').type('{ctrl}{shift}F');
    cy.wait(3000);
    
    // Verify forms are filled
    cy.get('#firstName').should('have.value', 'John');
  });

  it('should show status indicator on EMR pages', () => {
    // Navigate to EMR page
    cy.simulateEMRPage('epic');
    
    // Check for status indicator
    cy.get('#radorderpad-status').should('exist');
    cy.get('#radorderpad-status').should('have.css', 'background-color', 'rgb(204, 204, 204)'); // No data color
    
    // Capture data
    cy.capturePatientData();
    
    // Check status indicator changed
    cy.get('#radorderpad-status').should('have.css', 'background-color', 'rgb(33, 150, 243)'); // Has data color
  });

  it('should handle data expiration correctly', () => {
    // Navigate to EMR page and capture data
    cy.simulateEMRPage('epic');
    cy.capturePatientData();
    
    // Wait for data to expire (simulate 6 minutes)
    cy.wait(6000);
    
    // Navigate to RadOrderPad
    cy.simulateRadOrderPadPage();
    
    // Try to fill forms
    cy.fillRadOrderPadForms();
    
    // Verify forms are not filled (data expired)
    cy.get('#firstName').should('have.value', '');
    cy.get('#lastName').should('have.value', '');
  });

  it('should show error handling for invalid pages', () => {
    // Navigate to a non-EMR page
    cy.visit('/generic-page');
    
    // Try to capture data
    cy.capturePatientData();
    
    // Check for error notification
    cy.get('.notification').should('contain', 'No valid patient data found');
  });
}); 