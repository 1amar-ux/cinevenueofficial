const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log('Navigating to http://localhost:3000/');
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  } catch (e) {
    console.log('Navigation failed:', e.message);
  }
  
  await browser.close();
})();
