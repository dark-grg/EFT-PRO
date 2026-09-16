const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
    console.log('ROOT HTML LENGTH:', rootHtml.length);
    console.log('ROOT HTML PREVIEW:', rootHtml.substring(0, 500));
    
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
