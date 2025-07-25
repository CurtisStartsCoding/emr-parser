import puppeteer, { Browser, Page } from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

describe('EMR Mock Pages Test', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    console.log('🚀 Starting EMR mock pages test...');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    // Create new page
    page = await browser.newPage();
    
    console.log('✅ Browser launched successfully');
  }, 30000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed');
    }
  }, 10000);

  describe('ECW Mock Page', () => {
    it('should load ECW mock page and extract patient data', async () => {
      console.log('📄 Loading ECW mock page...');
      
      // Load mock ECW page
      const mockPagePath = path.resolve(__dirname, '../fixtures/emr-pages/ecw-mock.html');
      await page.goto(`file://${mockPagePath}`);
      
      console.log('✅ ECW page loaded');

      // Wait for page to load
      await page.waitForSelector('body');
      console.log('✅ Body element found');

      // Verify page title
      const title = await page.title();
      console.log(`📄 Page title: ${title}`);
      expect(title).toContain('ECW EMR');

      // Extract patient data
      const firstName = await page.$eval('#firstName', (el: any) => el.value);
      console.log(`👤 First Name: ${firstName}`);
      expect(firstName).toBe('John');

      const lastName = await page.$eval('#lastName', (el: any) => el.value);
      console.log(`👤 Last Name: ${lastName}`);
      expect(lastName).toBe('Smith');

      const middleName = await page.$eval('#middleName', (el: any) => el.value);
      console.log(`👤 Middle Name: ${middleName}`);
      expect(middleName).toBe('Michael');

      const dateOfBirth = await page.$eval('#dateOfBirth', (el: any) => el.value);
      console.log(`📅 Date of Birth: ${dateOfBirth}`);
      expect(dateOfBirth).toBe('05/15/1985');

      const gender = await page.$eval('#gender', (el: any) => el.value);
      console.log(`👤 Gender: ${gender}`);
      expect(gender).toBe('M');

      const addressLine1 = await page.$eval('#addressLine1', (el: any) => el.value);
      console.log(`🏠 Address Line 1: ${addressLine1}`);
      expect(addressLine1).toBe('123 Main Street');

      const city = await page.$eval('#city', (el: any) => el.value);
      console.log(`🏙️ City: ${city}`);
      expect(city).toBe('New York');

      const state = await page.$eval('#state', (el: any) => el.value);
      console.log(`🏛️ State: ${state}`);
      expect(state).toBe('NY');

      const zipCode = await page.$eval('#zipCode', (el: any) => el.value);
      console.log(`📮 ZIP Code: ${zipCode}`);
      expect(zipCode).toBe('10001');

      const phone = await page.$eval('#phone', (el: any) => el.value);
      console.log(`📞 Phone: ${phone}`);
      expect(phone).toBe('(555) 123-4567');

      const email = await page.$eval('#email', (el: any) => el.value);
      console.log(`📧 Email: ${email}`);
      expect(email).toBe('john.smith@email.com');

      const mrn = await page.$eval('#mrn', (el: any) => el.value);
      console.log(`🏥 MRN: ${mrn}`);
      expect(mrn).toBe('MRN123456789');

      const ssn = await page.$eval('#ssn', (el: any) => el.value);
      console.log(`🆔 SSN: ${ssn}`);
      expect(ssn).toBe('123-45-6789');

      const insurance = await page.$eval('#insurance', (el: any) => el.value);
      console.log(`🏥 Insurance: ${insurance}`);
      expect(insurance).toBe('Blue Cross Blue Shield');

      console.log('✅ All ECW patient data extracted successfully!');
    }, 30000);
  });

  describe('Athenahealth Mock Page', () => {
    it('should load Athenahealth mock page and extract patient data', async () => {
      console.log('📄 Loading Athenahealth mock page...');
      
      // Load mock Athenahealth page
      const mockPagePath = path.resolve(__dirname, '../fixtures/emr-pages/athenahealth-mock.html');
      await page.goto(`file://${mockPagePath}`);
      
      console.log('✅ Athenahealth page loaded');

      // Wait for page to load
      await page.waitForSelector('body');

      // Verify page title
      const title = await page.title();
      expect(title).toContain('Athenahealth EMR');

      // Extract key patient data
      const firstName = await page.$eval('#firstName', (el: any) => el.value);
      expect(firstName).toBe('Sarah');

      const lastName = await page.$eval('#lastName', (el: any) => el.value);
      expect(lastName).toBe('Johnson');

      const dateOfBirth = await page.$eval('#dateOfBirth', (el: any) => el.value);
      expect(dateOfBirth).toBe('12/03/1990');

      const gender = await page.$eval('#gender', (el: any) => el.value);
      expect(gender).toBe('F');

      console.log('✅ All Athenahealth patient data extracted successfully!');
    }, 30000);
  });

  describe('Epic Mock Page', () => {
    it('should load Epic mock page and extract patient data', async () => {
      console.log('📄 Loading Epic mock page...');
      
      // Load mock Epic page
      const mockPagePath = path.resolve(__dirname, '../fixtures/emr-pages/epic-mock.html');
      await page.goto(`file://${mockPagePath}`);
      
      console.log('✅ Epic page loaded');

      // Wait for page to load
      await page.waitForSelector('body');

      // Verify page title
      const title = await page.title();
      expect(title).toContain('Epic EMR');

      // Extract key patient data
      const firstName = await page.$eval('#firstName', (el: any) => el.value);
      expect(firstName).toBe('Michael');

      const lastName = await page.$eval('#lastName', (el: any) => el.value);
      expect(lastName).toBe('Brown');

      const dateOfBirth = await page.$eval('#dateOfBirth', (el: any) => el.value);
      expect(dateOfBirth).toBe('08/22/1978');

      const gender = await page.$eval('#gender', (el: any) => el.value);
      expect(gender).toBe('M');

      console.log('✅ All Epic patient data extracted successfully!');
    }, 30000);
  });

  describe('Onco Mock Page', () => {
    it('should load Onco mock page and extract patient data', async () => {
      console.log('📄 Loading Onco mock page...');
      
      // Load mock Onco page
      const mockPagePath = path.resolve(__dirname, '../fixtures/emr-pages/onco-mock.html');
      await page.goto(`file://${mockPagePath}`);
      
      console.log('✅ Onco page loaded');

      // Wait for page to load
      await page.waitForSelector('body');

      // Verify page title
      const title = await page.title();
      expect(title).toContain('Onco EMR');

      // Extract key patient data
      const firstName = await page.$eval('#firstName', (el: any) => el.value);
      expect(firstName).toBe('Emily');

      const lastName = await page.$eval('#lastName', (el: any) => el.value);
      expect(lastName).toBe('Wilson');

      const dateOfBirth = await page.$eval('#dateOfBirth', (el: any) => el.value);
      expect(dateOfBirth).toBe('03/10/1982');

      const gender = await page.$eval('#gender', (el: any) => el.value);
      expect(gender).toBe('F');

      console.log('✅ All Onco patient data extracted successfully!');
    }, 30000);
  });

  describe('Extension Files', () => {
    it('should verify extension files exist', async () => {
      console.log('📁 Checking extension files...');
      
      const extensionPath = path.resolve(__dirname, '../../dist');
      
      // Check if extension files exist
      expect(fs.existsSync(path.join(extensionPath, 'popup.html'))).toBe(true);
      expect(fs.existsSync(path.join(extensionPath, 'popup.js'))).toBe(true);
      expect(fs.existsSync(path.join(extensionPath, 'content.js'))).toBe(true);
      expect(fs.existsSync(path.join(extensionPath, 'background.js'))).toBe(true);
      expect(fs.existsSync(path.join(extensionPath, 'manifest.json'))).toBe(true);
      
      console.log('✅ All extension files exist!');
    }, 10000);
  });
}); 