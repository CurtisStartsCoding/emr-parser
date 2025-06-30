import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode: true,
    setupNodeEvents(on, config) {
      // Configure Chrome extension testing
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
        }
        
        // Load the extension
        launchOptions.args.push('--load-extension=dist');
        launchOptions.args.push('--disable-extensions-except=dist');
        launchOptions.args.push('--allow-running-insecure-content');
        launchOptions.args.push('--disable-web-security');
        launchOptions.args.push('--disable-features=VizDisplayCompositor');
        
        return launchOptions;
      });
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.ts',
  },
  
  env: {
    extensionId: 'test-extension-id',
    testPatientData: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '01/15/1980',
      phoneNumber: '(555) 123-4567',
      email: 'john.doe@example.com',
      addressLine1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    }
  },
  
  retries: {
    runMode: 2,
    openMode: 0,
  },
}); 