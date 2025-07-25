import puppeteer, { Browser, Page } from 'puppeteer';
import * as path from 'path';

export class PuppeteerTestSetup {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Initialize browser for testing
   */
  async setup(): Promise<void> {
    console.log('🚀 Setting up Puppeteer for testing...');
    
    // Launch browser without extension for simpler testing
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    // Create new page
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1280, height: 720 });
    
    console.log('✅ Puppeteer setup complete');
  }

  /**
   * Clean up browser
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Get the page instance
   */
  getPage(): Page {
    if (!this.page) {
      throw new Error('Page not initialized. Call setup() first.');
    }
    return this.page;
  }

  /**
   * Get the browser instance
   */
  getBrowser(): Browser {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call setup() first.');
    }
    return this.browser;
  }

  /**
   * Wait for extension to load (simplified)
   */
  async waitForExtension(): Promise<void> {
    // Wait a bit for browser to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
} 