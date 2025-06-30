// Cypress support file for Chrome extension testing
import './commands';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on uncaught exceptions from the extension
  if (err.message.includes('chrome-extension://')) {
    return false;
  }
  return true;
});

// Custom commands for extension testing
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to load the extension
       */
      loadExtension(): Chainable<void>;
      
      /**
       * Custom command to capture patient data
       */
      capturePatientData(): Chainable<void>;
      
      /**
       * Custom command to fill RadOrderPad forms
       */
      fillRadOrderPadForms(): Chainable<void>;
      
      /**
       * Custom command to check extension status
       */
      checkExtensionStatus(): Chainable<any>;
      
      /**
       * Custom command to open extension popup
       */
      openExtensionPopup(): Chainable<void>;
      
      /**
       * Custom command to simulate EMR page
       */
      simulateEMRPage(emrType: string): Chainable<void>;
      
      /**
       * Custom command to simulate RadOrderPad page
       */
      simulateRadOrderPadPage(): Chainable<void>;
    }
  }
} 