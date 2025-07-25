import puppeteer, { Browser, Page } from 'puppeteer';

describe('Simple Puppeteer Test', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    console.log('🚀 Starting simple Puppeteer test...');
    
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

  it('should load a simple HTML page', async () => {
    console.log('📄 Loading test page...');
    
    // Load a simple HTML page
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <h1>Hello Puppeteer!</h1>
          <input id="testInput" value="test value" />
          <div id="testDiv">Test content</div>
        </body>
      </html>
    `);

    console.log('✅ Page content set');

    // Wait for page to load
    await page.waitForSelector('body');
    console.log('✅ Body element found');

    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    expect(title).toBe('Test Page');

    // Get heading text
    const heading = await page.$eval('h1', (el) => el.textContent);
    console.log(`📄 Heading: ${heading}`);
    expect(heading).toBe('Hello Puppeteer!');

    // Get input value
    const inputValue = await page.$eval('#testInput', (el: any) => el.value);
    console.log(`📄 Input value: ${inputValue}`);
    expect(inputValue).toBe('test value');

    // Get div content
    const divContent = await page.$eval('#testDiv', (el) => el.textContent);
    console.log(`📄 Div content: ${divContent}`);
    expect(divContent).toBe('Test content');

    console.log('✅ All assertions passed!');
  }, 30000);

  it('should navigate to a real website', async () => {
    console.log('🌐 Navigating to example.com...');
    
    // Navigate to a simple website
    await page.goto('https://example.com');
    
    console.log('✅ Navigation complete');

    // Wait for page to load
    await page.waitForSelector('body');
    console.log('✅ Body element found');

    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    expect(title).toContain('Example Domain');

    // Get heading text
    const heading = await page.$eval('h1', (el) => el.textContent);
    console.log(`📄 Heading: ${heading}`);
    expect(heading).toContain('Example Domain');

    console.log('✅ Website test passed!');
  }, 30000);
}); 