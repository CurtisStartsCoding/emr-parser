import { PuppeteerTestSetup } from '../puppeteer-setup';
import * as path from 'path';

describe('EMR Integration Tests with Puppeteer', () => {
  let puppeteerSetup: PuppeteerTestSetup;
  let page: any;

  beforeAll(async () => {
    puppeteerSetup = new PuppeteerTestSetup();
    await puppeteerSetup.setup();
    page = puppeteerSetup.getPage();
    await puppeteerSetup.waitForExtension();
  }, 30000); // Increased timeout for setup

  afterAll(async () => {
    await puppeteerSetup.cleanup();
  }, 10000);

  beforeEach(async () => {
    // Clear any previous test data
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  describe('ECW EMR Integration', () => {
    it('should load ECW mock page and verify content', async () => {
      // Load mock ECW page
      const mockPagePath = path.resolve(__dirname, '../fixtures/emr-pages/ecw-mock.html');
      await page.goto(`file://${mockPagePath}`);

      // Wait for page to load
      await page.waitForSelector('body');

      // Verify page content
      const pageTitle = await page.title();
      expect(pageTitle).toContain('ECW EMR');

      // Check if patient data is present in the HTML
      const firstName = await page.$eval('#firstName', (el: any) => el.value);
      expect(firstName).toBe('John');

      const lastName = await page.$eval('#lastName', (el: any) => el.value);
      expect(lastName).toBe('Smith');

      const dateOfBirth = await page.$eval('#dateOfBirth', (el: any) => el.value);
      expect(dateOfBirth).toBe('05/15/1985');
    }, 30000);
  });

  describe('Athenahealth EMR Integration', () => {
    it('should load Athenahealth mock page and verify content', async () => {
      // Load mock Athenahealth page
      const mockPagePath = path.resolve(__dirname, '../fixtures/emr-pages/athenahealth-mock.html');
      await page.goto(`file://${mockPagePath}`);

      // Wait for page to load
      await page.waitForSelector('body');

      // Verify page content
      const pageTitle = await page.title();
      expect(pageTitle).toContain('Athenahealth EMR');

      // Check if patient data is present in the HTML
      const firstName = await page.$eval('#firstName', (el: any) => el.value);
      expect(firstName).toBe('Sarah');

      const lastName = await page.$eval('#lastName', (el: any) => el.value);
      expect(lastName).toBe('Johnson');

      const dateOfBirth = await page.$eval('#dateOfBirth', (el: any) => el.value);
      expect(dateOfBirth).toBe('12/03/1990');
    }, 30000);
  });

  describe('Epic EMR Integration', () => {
    it('should load Epic mock page and verify content', async () => {
      // Load mock Epic page
      const mockPagePath = path.resolve(__dirname, '../fixtures/emr-pages/epic-mock.html');
      await page.goto(`file://${mockPagePath}`);

      // Wait for page to load
      await page.waitForSelector('body');

      // Verify page content
      const pageTitle = await page.title();
      expect(pageTitle).toContain('Epic EMR');

      // Check if patient data is present in the HTML
      const firstName = await page.$eval('#firstName', (el: any) => el.value);
      expect(firstName).toBe('Michael');

      const lastName = await page.$eval('#lastName', (el: any) => el.value);
      expect(lastName).toBe('Brown');

      const dateOfBirth = await page.$eval('#dateOfBirth', (el: any) => el.value);
      expect(dateOfBirth).toBe('08/22/1978');
    }, 30000);
  });

  describe('Onco EMR Integration', () => {
    it('should load Onco mock page and verify content', async () => {
      // Load mock Onco page
      const mockPagePath = path.resolve(__dirname, '../fixtures/emr-pages/onco-mock.html');
      await page.goto(`file://${mockPagePath}`);

      // Wait for page to load
      await page.waitForSelector('body');

      // Verify page content
      const pageTitle = await page.title();
      expect(pageTitle).toContain('Onco EMR');

      // Check if patient data is present in the HTML
      const firstName = await page.$eval('#firstName', (el: any) => el.value);
      expect(firstName).toBe('Emily');

      const lastName = await page.$eval('#lastName', (el: any) => el.value);
      expect(lastName).toBe('Wilson');

      const dateOfBirth = await page.$eval('#dateOfBirth', (el: any) => el.value);
      expect(dateOfBirth).toBe('03/10/1982');
    }, 30000);
  });

  describe('Extension UI Tests', () => {
    it('should verify extension popup exists', async () => {
      // Load a mock page first
      const mockPagePath = path.resolve(__dirname, '../fixtures/emr-pages/ecw-mock.html');
      await page.goto(`file://${mockPagePath}`);

      // Wait for page to load
      await page.waitForSelector('body');

      // Check if extension files exist in the built extension
      const extensionPath = path.resolve(__dirname, '../../dist');
      const fs = require('fs');
      
      expect(fs.existsSync(path.join(extensionPath, 'popup.html'))).toBe(true);
      expect(fs.existsSync(path.join(extensionPath, 'popup.js'))).toBe(true);
      expect(fs.existsSync(path.join(extensionPath, 'content.js'))).toBe(true);
      expect(fs.existsSync(path.join(extensionPath, 'background.js'))).toBe(true);
      expect(fs.existsSync(path.join(extensionPath, 'manifest.json'))).toBe(true);
    }, 30000);
  });
}); 